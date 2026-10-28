'use strict';

// Local data store, one JSON file in the app's user-data folder.
// Accounts are ChatGPT sign-ins: each registration keeps its issued client id,
// verified identity and an encrypted token set (OS keychain via safeStorage).
// Settings, dictionary and history are kept per ChatGPT account.

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const { DEFAULT_STYLES } = require('./styles');

const HISTORY_LIMIT = 500;

const DEFAULT_SETTINGS = {
  pttChord: 'fn', // hold-to-talk key on macOS: fn | ctrl+alt | ralt | rcmd | rctrl
  shortcut: 'CommandOrControl+Shift+Space', // hands-free toggle, works on every platform
  pasteLastShortcut: process.platform === 'darwin' ? 'Command+Control+V' : 'Shift+Alt+Z',
  cleanupLevel: 'standard', // light | standard | polished
  styles: { ...DEFAULT_STYLES }, // per app category: personal | work | email | other
  language: 'en',
  speechModel: 'fast', // fast | accurate
  chatgptModel: '', // chosen from the account's model list
  customPrompt: '',
  restoreClipboard: true,
  playSounds: true,
  alwaysShowBar: false, // off: the bar appears only while dictating (renamed from showBar, which defaulted to on)
  launchAtLogin: false,
};

function emptyProfile() {
  return { settings: { ...DEFAULT_SETTINGS }, dictionary: [], snippets: [], history: [], onboarded: false };
}

class Store {
  /**
   * @param {string} dir  folder for bewithflow.json
   * @param {{available: () => boolean, encrypt: (s: string) => string, decrypt: (s: string) => string}} vault
   */
  constructor(dir, vault) {
    this.file = path.join(dir, 'bewithflow.json');
    this.vault = vault;
    this.data = this.#load();
    if (!this.data.hostId) {
      this.data.hostId = `urn:uuid:${crypto.randomUUID()}`;
      this.#save();
    }
  }

  #load() {
    try {
      const parsed = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      return { accounts: {}, profiles: {}, active: null, ...parsed };
    } catch {
      return { accounts: {}, profiles: {}, active: null };
    }
  }

  #save() {
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const tmp = `${this.file}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(this.data, null, 2), { mode: 0o600 });
    fs.renameSync(tmp, this.file);
  }

  get hostId() {
    return this.data.hostId;
  }

  // ---------- ChatGPT accounts ----------

  #seal(obj) {
    const json = JSON.stringify(obj);
    return this.vault.available() ? { enc: true, value: this.vault.encrypt(json) } : { enc: false, value: Buffer.from(json).toString('base64') };
  }

  #open(sealed) {
    if (!sealed) return null;
    try {
      return JSON.parse(sealed.enc ? this.vault.decrypt(sealed.value) : Buffer.from(sealed.value, 'base64').toString());
    } catch {
      return null; // keychain reset or corrupt: treat as signed out
    }
  }

  /** Save a completed sign-in and make it the active account. */
  saveSignIn({ clientId, identity, tokens }) {
    const prev = this.data.accounts[clientId];
    this.data.accounts[clientId] = {
      clientId,
      sub: identity.sub,
      email: identity.email,
      name: identity.name || prev?.name || identity.email.split('@')[0] || 'there',
      picture: identity.picture || '',
      free: !tokens.planUsage,
      addedAt: prev?.addedAt || Date.now(),
      tokens: this.#seal(tokens),
    };
    if (!this.data.profiles[clientId]) this.data.profiles[clientId] = emptyProfile();
    this.data.active = clientId;
    this.#save();
    return this.currentUser();
  }

  /**
   * Free mode: a profile on this computer with no ChatGPT sign-in. OpenAI only lets
   * ChatGPT Plus/Pro accounts sign in to apps like this, so Free users run fully on-device.
   */
  saveLocal(name) {
    const id = 'local';
    const prev = this.data.accounts[id];
    this.data.accounts[id] = {
      clientId: id,
      sub: 'local',
      email: '',
      name: String(name || prev?.name || 'You').trim() || 'You',
      picture: '',
      free: true,
      local: true,
      addedAt: prev?.addedAt || Date.now(),
      tokens: this.#seal({ local: true, planUsage: false, scopes: [] }),
    };
    if (!this.data.profiles[id]) this.data.profiles[id] = emptyProfile();
    this.data.active = id;
    this.#save();
    return this.currentUser();
  }

  /** Copy settings, dictionary, snippets and history to a newly connected account that has none yet. */
  migrateProfile(fromId, toId) {
    const from = this.data.profiles[fromId];
    const to = this.data.profiles[toId];
    if (!from || !to || fromId === toId) return false;
    if (to.history.length || to.dictionary.length || (to.snippets || []).length) return false;
    this.data.profiles[toId] = { ...JSON.parse(JSON.stringify(from)) };
    this.#save();
    return true;
  }

  getTokens(clientId = this.data.active) {
    return this.#open(this.data.accounts[clientId]?.tokens);
  }

  setTokens(tokens, clientId = this.data.active) {
    const acct = this.data.accounts[clientId];
    if (!acct) return;
    acct.tokens = tokens ? this.#seal(tokens) : null;
    this.#save();
  }

  activeAccount() {
    const acct = this.data.accounts[this.data.active];
    if (!acct || !this.getTokens(acct.clientId)) return null;
    return acct;
  }

  currentUser() {
    const acct = this.activeAccount();
    if (!acct) return null;
    const tokens = this.getTokens(acct.clientId);
    return { id: acct.clientId, name: acct.name, email: acct.email, picture: acct.picture, planUsage: Boolean(tokens?.planUsage), local: Boolean(acct.local) };
  }

  /** Accounts registered on this computer that are signed out, for "Continue as …". */
  savedAccounts() {
    return Object.values(this.data.accounts)
      .filter((a) => a.clientId !== this.data.active || !this.getTokens(a.clientId))
      .map((a) => ({ id: a.clientId, email: a.email, name: a.name, free: Boolean(a.free), local: Boolean(a.local) }));
  }

  /** What a re-authorization needs: issued client id, identity, retained hints. */
  registration(clientId) {
    const a = this.data.accounts[clientId];
    if (!a) return null;
    const tokens = this.getTokens(clientId);
    return { clientId: a.clientId, sub: a.sub, email: a.email, idToken: tokens?.idToken || a.lastIdToken || null, free: Boolean(a.free) };
  }

  /** Clear tokens but keep the registration (client id + identity) for a later sign-in. */
  signOut() {
    const acct = this.data.accounts[this.data.active];
    if (acct) {
      acct.tokens = null;
      acct.lastIdToken = null; // docs: omit id_token_hint after signing out
    }
    this.data.active = null;
    this.#save();
  }

  /** Remove the account's registration, settings, dictionary and history from this computer. */
  forgetAccount(clientId = this.data.active) {
    delete this.data.accounts[clientId];
    delete this.data.profiles[clientId];
    if (this.data.active === clientId) this.data.active = null;
    this.#save();
  }

  #profile() {
    const id = this.activeAccount()?.clientId;
    if (!id) throw new Error('Sign in with ChatGPT first.');
    const p = this.data.profiles[id] || (this.data.profiles[id] = emptyProfile());
    p.settings = { ...DEFAULT_SETTINGS, ...p.settings };
    p.settings.styles = { ...DEFAULT_STYLES, ...(p.settings.styles || {}) };
    if (!p.snippets) p.snippets = [];
    return p;
  }

  // ---------- settings / onboarding ----------

  getSettings() {
    return { ...this.#profile().settings };
  }

  updateSettings(patch) {
    const p = this.#profile();
    const allowed = Object.keys(DEFAULT_SETTINGS);
    for (const [k, v] of Object.entries(patch || {})) if (allowed.includes(k)) p.settings[k] = v;
    this.#save();
    return this.getSettings();
  }

  isOnboarded() {
    return Boolean(this.#profile().onboarded);
  }

  setOnboarded(v = true) {
    this.#profile().onboarded = v;
    this.#save();
  }

  // ---------- dictionary ----------

  getDictionary() {
    return [...this.#profile().dictionary];
  }

  addWord(word) {
    word = String(word || '').trim();
    if (!word) throw new Error('Type a word or phrase first.');
    if (word.length > 80) throw new Error('Keep entries under 80 characters.');
    const p = this.#profile();
    if (!p.dictionary.some((w) => w.toLowerCase() === word.toLowerCase())) p.dictionary.push(word);
    this.#save();
    return this.getDictionary();
  }

  removeWord(word) {
    const p = this.#profile();
    p.dictionary = p.dictionary.filter((w) => w !== word);
    this.#save();
    return this.getDictionary();
  }

  // ---------- snippets ----------

  getSnippets() {
    return this.#profile().snippets.map((x) => ({ ...x }));
  }

  saveSnippet({ id, trigger, expansion }) {
    trigger = String(trigger || '').trim();
    expansion = String(expansion || '').trim();
    if (!trigger || !expansion) throw new Error('Enter a snippet and its expansion.');
    if (trigger.length > 60) throw new Error('Keep the snippet under 60 characters.');
    if (expansion.length > 4000) throw new Error('This expansion is too long. Please shorten it and try again.');
    if (!/[\p{L}\p{N}]/u.test(trigger)) throw new Error('The snippet needs at least one letter or number.');
    const p = this.#profile();
    const clash = p.snippets.find((x) => x.trigger.toLowerCase() === trigger.toLowerCase() && x.id !== id);
    if (clash) throw new Error(`"${trigger}" already exists in your snippets.`);
    if (id) {
      const existing = p.snippets.find((x) => x.id === id);
      if (!existing) throw new Error('That snippet no longer exists.');
      Object.assign(existing, { trigger, expansion });
    } else {
      p.snippets.unshift({ id: crypto.randomUUID(), trigger, expansion, createdAt: Date.now() });
    }
    this.#save();
    return this.getSnippets();
  }

  removeSnippet(id) {
    const p = this.#profile();
    p.snippets = p.snippets.filter((x) => x.id !== id);
    this.#save();
    return this.getSnippets();
  }

  // ---------- history ----------

  addHistory(entry) {
    const p = this.#profile();
    const item = { id: crypto.randomUUID(), at: Date.now(), ...entry };
    p.history.unshift(item);
    p.history.length = Math.min(p.history.length, HISTORY_LIMIT);
    this.#save();
    return item;
  }

  getHistory() {
    return [...this.#profile().history];
  }

  deleteHistory(id) {
    const p = this.#profile();
    p.history = id ? p.history.filter((h) => h.id !== id) : [];
    this.#save();
    return this.getHistory();
  }

  stats() {
    const h = this.#profile().history;
    const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;
    const words = (t) => (t ? t.trim().split(/\s+/).filter(Boolean).length : 0);
    const totalWords = h.reduce((n, x) => n + words(x.text), 0);
    const totalMs = h.reduce((n, x) => n + (x.durationMs || 0), 0);
    // streak: consecutive days (ending today or yesterday) with at least one dictation
    const days = new Set(h.map((x) => new Date(x.at).toDateString()));
    let streak = 0;
    const d = new Date();
    if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
    while (days.has(d.toDateString())) {
      streak++;
      d.setDate(d.getDate() - 1);
    }
    return {
      streak,
      dictations: h.length,
      wordsThisWeek: h.filter((x) => x.at >= weekAgo).reduce((n, x) => n + words(x.text), 0),
      totalWords,
      wpm: totalMs > 0 ? Math.round(totalWords / (totalMs / 60000)) : 0,
    };
  }
}

module.exports = { Store, DEFAULT_SETTINGS };
