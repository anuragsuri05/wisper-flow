'use strict';

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const isMac = window.bwf.platform === 'darwin';
const call = (channel, payload) => window.bwf.call(channel, payload);

const USAGE_URL = 'https://chatgpt.com/settings/usage';
const KEYBOARD_SETTINGS = 'x-apple.systempreferences:com.apple.Keyboard-Settings.extension';

let state = null; // app:state from the main process
let view = 'home';
let models = null;
let chosenSpeech = null;
let setupStep = 0;
let styleTab = 'personal';

const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const initial = (s) => esc((String(s || '?').trim()[0] || '?').toUpperCase());

// ---------- helpers ----------

let toastTimer;
function toast(message, kind = '') {
  const el = $('#toast');
  el.textContent = message;
  el.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (el.className = 'toast'), kind === 'error' ? 4500 : 2200);
}

function renderMarks(raw, clean) {
  const ops = window.bwfDiff.wordDiff(raw, clean);
  if (!ops) return esc(clean);
  return ops.map((o) => (o.type === 'same' ? esc(o.word) : o.type === 'del' ? `<del>${esc(o.word)}</del>` : `<ins>${esc(o.word)}</ins>`)).join(' ');
}

const KEY_SYMBOLS = isMac
  ? { CommandOrControl: '⌘', CmdOrCtrl: '⌘', Command: '⌘', Cmd: '⌘', Control: '⌃', Ctrl: '⌃', Alt: '⌥', Option: '⌥', Shift: '⇧', Super: '⌘' }
  : { CommandOrControl: 'Ctrl', CmdOrCtrl: 'Ctrl', Control: 'Ctrl', Ctrl: 'Ctrl', Alt: 'Alt', Shift: 'Shift', Super: 'Win', Command: 'Win' };
const ARROWS = { Up: '↑', Down: '↓', Left: '←', Right: '→' };

function keycaps(accel) {
  if (!accel) return '<span class="muted small">Not set</span>';
  return accel
    .split('+')
    .map((k) => `<kbd>${esc(KEY_SYMBOLS[k] || ARROWS[k] || k)}</kbd>`)
    .join('');
}
const labelCaps = (label) => (label || '').split(' ').filter(Boolean).map((k) => `<kbd>${esc(k)}</kbd>`).join('');

const CODE_KEYS = {
  Space: 'Space', Backquote: '`', Minus: '-', Equal: '=', BracketLeft: '[', BracketRight: ']', Backslash: '\\',
  Semicolon: ';', Quote: "'", Comma: ',', Period: '.', Slash: '/', ArrowUp: 'Up', ArrowDown: 'Down', ArrowLeft: 'Left', ArrowRight: 'Right',
};

function accelFromEvent(e) {
  let key = null;
  let m;
  if ((m = e.code.match(/^Key([A-Z])$/))) key = m[1];
  else if ((m = e.code.match(/^Digit(\d)$/))) key = m[1];
  else if (/^F\d{1,2}$/.test(e.code)) key = e.code;
  else key = CODE_KEYS[e.code] || null;
  if (!key) return null;
  const mods = [];
  if (e.metaKey) mods.push(isMac ? 'Command' : 'Super');
  if (e.ctrlKey) mods.push('Control');
  if (e.altKey) mods.push('Alt');
  if (e.shiftKey) mods.push('Shift');
  if (!mods.some((x) => x !== 'Shift') && !/^F\d+$/.test(key)) return { invalid: 'Use at least one of ⌘, Ctrl or Alt/Option with a key.' };
  return { accel: [...mods, key].join('+') };
}

// local copy of the style pass, for live previews
function applyStyle(text, style) {
  let t = String(text || '');
  if (style === 'casual' || style === 'veryCasual') t = t.replace(/\.\s*$/, '');
  if (style === 'veryCasual') t = t.toLowerCase();
  if (style === 'excited') t = t.replace(/\.(\s*)$/, '!$1');
  return t;
}

/** The key the user holds to talk, as keycaps (macOS), or the hands-free shortcut elsewhere. */
function holdKeyHTML() {
  return state.hotkey.supported ? labelCaps(state.hotkey.label || 'fn') : keycaps(state.settings.shortcut);
}

// ---------- routing ----------

function showScreen(name) {
  $$('[data-screen]').forEach((el) => (el.hidden = el.dataset.screen !== name));
}

function route() {
  if (!state.user) {
    renderAuth();
    return showScreen('auth');
  }
  if (!state.onboarded) {
    showScreen('setup');
    return renderSetup();
  }
  showScreen('app');
  renderShell();
  navigate(view);
}

function navigate(next) {
  view = next;
  $$('[data-view]').forEach((el) => (el.hidden = el.dataset.view !== next));
  $$('[data-nav]').forEach((b) => (b.dataset.nav === next ? b.setAttribute('aria-current', 'page') : b.removeAttribute('aria-current')));
  if (next === 'home') renderHome();
  if (next === 'dictionary') loadDictionary();
  if (next === 'snippets') loadSnippets();
  if (next === 'style') renderStyle();
  $('.main').scrollTop = 0;
}

async function refreshState() {
  state = await call('app:state');
  return state;
}

// ---------- sign in ----------

function setWaiting(on) {
  $('#auth-idle').hidden = on;
  $('#auth-waiting').hidden = !on;
  if (on) $('#waiting-title').textContent = 'Finish signing in in your browser';
}

function renderAuth() {
  setWaiting(Boolean(state.signingIn));
  $('#saved-accounts').innerHTML = (state.savedAccounts || [])
    .map(
      (a) => `<button class="saved-btn" data-signin="${esc(a.id)}">
        <span class="avatar" aria-hidden="true">${initial(a.name || a.email)}</span>
        <span><b>Continue as ${esc(a.name || a.email)}</b><small>${a.local ? 'Free mode on this computer' : esc(a.email)}</small></span></button>`,
    )
    .join('');
  const b = $('#signin-btn');
  b.textContent = state.savedAccounts?.length ? 'Sign in with another ChatGPT account' : 'Continue with ChatGPT';
  b.classList.toggle('btn-primary', !state.savedAccounts?.length);
  $('#signin-free').hidden = (state.savedAccounts || []).some((a) => a.local);
}

async function useLocal() {
  state = await call('auth:local');
  view = 'home';
  setupStep = 0;
  route();
  toast('Free mode: everything runs on this computer');
}

async function signIn(accountId) {
  $('#auth-error').textContent = '';
  $('#auth-log').hidden = true;
  $('#auth-free-retry').hidden = true;
  setWaiting(true);
  try {
    state = await call('auth:signIn', accountId ? { accountId } : {});
    view = 'home';
    setupStep = 0;
    route();
    toast(state.user.local ? 'Welcome back' : `Signed in as ${state.user.email}`);
  } catch (err) {
    setWaiting(false);
    if (err.code === 'plan_unavailable') {
      // OpenAI's page blocks Continue on ChatGPT Free when plan usage is requested
      $('#auth-error').textContent = 'OpenAI only lets ChatGPT Plus and Pro accounts sign in to apps like bewithflow. On ChatGPT Free, use bewithflow free on this computer instead.';
      $('#auth-free-retry').hidden = false;
    } else if (err.code !== 'cancelled' || !/cancelled\.$/.test(err.message)) {
      $('#auth-error').textContent = err.message;
      $('#auth-log').hidden = false;
    }
  }
}

function wireAuth() {
  const onSignInClick = (e) => {
    if (e.target.closest('[data-local]')) return useLocal();
    const b = e.target.closest('[data-signin]');
    if (b) signIn(b.dataset.signin || null);
  };
  $('#auth-idle').addEventListener('click', onSignInClick);
  $('#auth-free-retry').addEventListener('click', onSignInClick);
  $('#signin-cancel').addEventListener('click', () => call('auth:cancel'));
  $('#signin-reopen').addEventListener('click', () => call('auth:reopen'));
  $('#auth-log').addEventListener('click', () => call('auth:log'));
  window.bwf.on('auth:status', (msg) => ($('#waiting-title').textContent = msg));
}

// ---------- shared cards ----------

function chatgptCardHTML() {
  const u = state.user;
  if (u.local) {
    return `
    <div class="head"><b>Free mode</b><span class="chip warn">No ChatGPT sign-in</span></div>
    <p>Everything runs on this computer. OpenAI only lets ChatGPT Plus and Pro accounts sign in to apps like bewithflow, so here a small AI on your computer cleans up what you say.</p>
    <div class="row-gap"><button class="btn btn-sm" data-enable-plan>Connect ChatGPT Plus or Pro</button></div>`;
  }
  return `
    <div class="head"><b>${esc(u.email)}</b>
      <span class="chip ${u.planUsage ? 'ok' : 'warn'}">${u.planUsage ? 'ChatGPT plan connected' : 'Free plan mode'}</span></div>
    ${
      u.planUsage
        ? `<p>Every dictation is cleaned up by your ChatGPT plan. <button class="link" data-open="${USAGE_URL}">Manage usage limits</button></p>`
        : `<p>OpenAI lets only ChatGPT Plus and Pro plans power other apps, so on a Free plan bewithflow cleans up your words with AI on this computer.</p>
           <div class="row-gap"><button class="btn btn-sm" data-enable-plan>I have Plus or Pro: use my plan</button></div>`
    }`;
}

function progressHTML(st) {
  return `<div class="dl-row"><div class="progress"><i style="width:${Math.round((st.progress || 0) * 100)}%"></i></div>
    <span>${st.status === 'downloading' ? `${Math.round((st.progress || 0) * 100)}%` : '…'}</span></div>`;
}

function speechCardHTML() {
  const sp = state.speech;
  const selected = chosenSpeech || state.settings.speechModel || 'fast';
  const busy = sp.status === 'downloading' || sp.status === 'loading';
  const readyHere = sp.ready && sp.readyModel === selected;
  const downloaded = sp.models[selected]?.downloaded;
  const chip = readyHere ? '<span class="chip ok">Ready</span>' : busy ? `<span class="chip warn">${sp.status === 'downloading' ? 'Downloading' : 'Loading'}</span>` : downloaded ? '<span class="chip ok">Downloaded</span>' : '<span class="chip bad">Not set up</span>';
  return `
    <div class="head"><b>Turns your voice into text on this computer</b>${chip}</div>
    <div class="choice-row" role="group" aria-label="Speech model">
      ${Object.entries(sp.models)
        .map(
          ([key, m]) => `<button class="choice" data-speech-choice="${key}" aria-pressed="${key === selected}" ${busy ? 'disabled' : ''}>
            <b>${m.label}</b><small>${key === 'fast' ? 'Quick, great for messages' : 'Slower, catches more words'} · ${m.size}</small></button>`,
        )
        .join('')}
    </div>
    ${busy ? progressHTML(sp) : readyHere ? '' : `<div><button class="btn btn-sm btn-primary" data-speech-download>${downloaded ? 'Use this model' : `Download ${sp.models[selected].size}`}</button></div>`}
    ${sp.status === 'error' ? `<p class="error-text">${esc(sp.error)}</p>` : ''}`;
}

function cleanerCardHTML() {
  const c = state.cleaner;
  const free = !state.user.planUsage;
  const busy = c.status === 'downloading' || c.status === 'loading';
  const chip = c.ready ? '<span class="chip ok">Ready</span>' : busy ? `<span class="chip warn">${c.status === 'downloading' ? 'Downloading' : 'Loading'}</span>` : c.downloaded ? '<span class="chip ok">Downloaded</span>' : `<span class="chip ${free ? 'bad' : ''}">${free ? 'Recommended' : 'Optional'}</span>`;
  return `
    <div class="head"><b>${free ? 'AI cleanup for your Free plan' : 'Backup when ChatGPT is unavailable'}</b>${chip}</div>
    <p>A small AI model on this computer removes ums, applies your corrections and fixes grammar. Private and works offline. One-time download, ${c.size}.</p>
    ${busy ? progressHTML(c) : c.ready ? '' : `<div><button class="btn btn-sm ${free ? 'btn-primary' : ''}" data-cleaner-download>${c.downloaded ? 'Load model' : `Download ${c.size}`}</button></div>`}
    ${c.status === 'error' ? `<p class="error-text">${esc(c.error)}</p>` : ''}`;
}

function permsHTML() {
  const p = state.permissions;
  if (!isMac) return '<p class="muted small">bewithflow asks for the microphone the first time you dictate. No other permissions are needed.</p>';
  const row = (title, sub, ok, key) => `<div class="perm-row"><div><b>${title}</b><small>${sub}</small></div>
    ${ok ? '<span class="chip ok">Allowed</span>' : `<button class="btn btn-sm btn-primary" data-perm="${key}">Allow</button>`}</div>`;
  return (
    row('Microphone', 'Listens only while you dictate', p.mic === 'granted', 'mic') +
    row('Accessibility', 'Lets bewithflow see your dictation key and type into other apps', p.accessibility, 'ax')
  );
}

function renderSharedCards() {
  if (!state.user) return;
  $$('[data-chatgpt-card]').forEach((el) => (el.innerHTML = chatgptCardHTML()));
  $$('[data-speech-card]').forEach((el) => (el.innerHTML = speechCardHTML()));
  $$('[data-cleaner-card]').forEach((el) => (el.innerHTML = cleanerCardHTML()));
  $$('[data-perms]').forEach((el) => (el.innerHTML = permsHTML()));
}

async function enablePlan(btn) {
  btn.disabled = true;
  btn.textContent = 'Finish in your browser…';
  try {
    state = await call('auth:enablePlan');
    toast(state.user.planUsage ? 'ChatGPT plan connected' : 'Signed in, but plan usage is still off');
  } catch (err) {
    toast(err.message, 'error');
    await refreshState();
  }
  rerender();
}

async function downloadSpeech() {
  const key = chosenSpeech || state.settings.speechModel;
  try {
    state.speech = await call('speech:download', key);
    state.settings.speechModel = key;
    chosenSpeech = null;
    toast('Speech engine ready');
  } catch (err) {
    toast(err.message, 'error');
  }
  rerender();
}

async function downloadCleaner() {
  try {
    state.cleaner = await call('cleaner:download');
    toast('On-device cleanup ready');
  } catch (err) {
    toast(err.message, 'error');
  }
  rerender();
}

/** Re-render whatever is on screen after state changed. */
function rerender() {
  if (!state.user) return route();
  renderSharedCards();
  if (!state.onboarded) return renderSetup();
  renderShell();
  if (view === 'home') renderBanner();
  if (!$('#settings').hidden) renderSettings();
}

function wireShared() {
  document.addEventListener('click', async (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.matches('[data-open]')) return call('open:external', t.dataset.open);
    if (t.matches('[data-enable-plan]')) return enablePlan(t);
    if (t.matches('[data-speech-choice]')) {
      chosenSpeech = t.dataset.speechChoice;
      return rerender();
    }
    if (t.matches('[data-speech-download]')) return downloadSpeech();
    if (t.matches('[data-cleaner-download]')) return downloadCleaner();
    if (t.matches('[data-perm]')) {
      state.permissions = await call(t.dataset.perm === 'mic' ? 'perm:requestMic' : 'perm:requestAccessibility');
      return rerender();
    }
  });
  window.addEventListener('focus', async () => {
    if (!state?.user) return;
    state.permissions = await call('perm:status');
    rerender();
  });
}

// ---------- setup ----------

let tryBaseline = null; // history count when the Try step opened
let keyTested = false;
let globeKey = null;

const SETUP_STEPS = [
  {
    id: 'account',
    eyebrow: 'Welcome',
    title: () => (state.user.local ? 'Welcome to bewithflow' : `Hi ${esc(state.user.name.split(' ')[0])}, you’re in`),
    lede: 'bewithflow turns what you say into clean, ready-to-send text in any app.',
    body: () => `<div class="card-lite" data-chatgpt-card>${chatgptCardHTML()}</div>`,
    canContinue: () => true,
  },
  {
    id: 'permissions',
    eyebrow: 'Permissions',
    title: () => 'Let bewithflow hear you and type for you',
    lede: 'macOS asks once for each. You can change these later in System Settings.',
    body: () => `<div class="card-lite" data-perms>${permsHTML()}</div>`,
    canContinue: () => !isMac || (state.permissions.mic === 'granted' && state.permissions.accessibility),
    skippable: true,
  },
  {
    id: 'shortcut',
    eyebrow: 'Your shortcut',
    title: () => (state.hotkey.supported ? 'Hold one key to talk' : 'Your dictation shortcut'),
    lede: state => null,
    body: () => shortcutStepHTML(),
    canContinue: () => !state.hotkey.supported || keyTested,
    skippable: true,
  },
  {
    id: 'engine',
    eyebrow: 'Speech engine',
    title: () => 'Download the speech engine',
    lede: 'Your voice is turned into text right here on your computer, so audio never leaves it.',
    body: () =>
      `<div class="card-lite" data-speech-card>${speechCardHTML()}</div>` +
      (state.user.planUsage ? '' : `<div class="card-lite" data-cleaner-card>${cleanerCardHTML()}</div>`),
    canContinue: () => state.speech.ready || state.speech.models[state.settings.speechModel]?.downloaded,
  },
  {
    id: 'try',
    eyebrow: 'Try it',
    title: () => 'Say something messy',
    lede: null,
    body: () => tryStepHTML(),
    canContinue: () => true,
    finish: true,
  },
];

function shortcutStepHTML() {
  if (!state.hotkey.supported) {
    return `<p class="muted">Press ${keycaps(state.settings.shortcut)} to start dictating in any app, and press it again to paste. You can change it in Settings.</p>`;
  }
  const chords = state.hotkey.chords;
  const current = state.settings.pttChord;
  const perm = state.hotkey.status === 'need_permission';
  const tip =
    current === 'fn' && globeKey !== null && globeKey !== 0
      ? `<div class="tip"><span>Set <b>Press 🌐 key to</b> → <b>Do Nothing</b> so the emoji picker or dictation doesn’t pop up when you hold fn.</span>
         <button class="btn btn-sm" data-open="${KEYBOARD_SETTINGS}">Open Keyboard Settings</button></div>`
      : '';
  return `
    <p class="muted">Hold the key, speak, and let go. Your words appear wherever you’re typing: WhatsApp, Slack, Mail, anywhere.</p>
    <div class="chip-picker" style="justify-content:flex-start" role="group" aria-label="Hold-to-talk key">
      ${Object.entries(chords).map(([id, label]) => `<button data-chord="${id}" aria-pressed="${id === current}">${esc(label)}</button>`).join('')}
    </div>
    <div class="key-test ${keyTested ? 'ok' : ''}" id="key-test">
      <div class="bigkey">${esc(chords[current] || 'fn')}</div>
      <b id="key-test-text">${keyTested ? 'Got it. That’s your dictation key.' : perm ? 'Allow Accessibility first (previous step)' : `Hold ${esc(chords[current] || 'fn')} now`}</b>
      <span class="muted small">Double-tap it, or press Space while holding, to go hands-free.</span>
    </div>
    ${tip}`;
}

function tryStepHTML() {
  return `
    <p class="muted">Click the box, hold ${holdKeyHTML()} and say: <i>“um so can we meet at three, no wait, four tomorrow”</i>. Let go to paste.</p>
    <textarea class="input" id="try-box" rows="3" placeholder="Your words will appear here"></textarea>
    <div class="card-lite" id="try-result" hidden></div>`;
}

function renderSetup() {
  const steps = SETUP_STEPS;
  setupStep = Math.max(0, Math.min(setupStep, steps.length - 1));
  const step = steps[setupStep];
  $('#stepper').innerHTML = steps.map((s, i) => `<li class="${i < setupStep ? 'done' : i === setupStep ? 'current' : ''}" aria-current="${i === setupStep ? 'step' : 'false'}"></li>`).join('');
  const lede = typeof step.lede === 'function' ? step.lede(state) : step.lede;
  const can = step.canContinue();
  const card = $('#setup-card');
  const tryValue = $('#try-box')?.value;
  card.innerHTML = `
    <div class="eyebrow">${step.eyebrow} · ${setupStep + 1} of ${steps.length}</div>
    <h1>${step.title()}</h1>
    ${lede ? `<p>${lede}</p>` : ''}
    ${step.body()}
    <div class="setup-actions">
      <button class="btn btn-ghost" data-setup="back" ${setupStep === 0 ? 'hidden' : ''}>Back</button>
      <div class="row-gap">
        ${!can && step.skippable ? '<button class="btn btn-ghost" data-setup="next">Skip for now</button>' : ''}
        <button class="btn btn-primary" data-setup="${step.finish ? 'finish' : 'next'}" ${can ? '' : 'disabled'}>${step.finish ? 'Start using bewithflow' : 'Continue'}</button>
      </div>
    </div>`;
  if (step.id === 'try') {
    if (tryValue) $('#try-box').value = tryValue;
    call('setup:try', true);
    if (tryBaseline === null) call('history:get').then(({ items }) => (tryBaseline = items.length));
  } else call('setup:try', false);
  if (step.id === 'shortcut' && isMac && globeKey === null) call('system:globeKey').then((v) => {
    globeKey = v;
    if (SETUP_STEPS[setupStep].id === 'shortcut' && v !== null && v !== 0) renderSetup();
  });
}

function wireSetup() {
  $('#setup-card').addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.setup === 'back') {
      setupStep--;
      return renderSetup();
    }
    if (b.dataset.setup === 'next') {
      setupStep++;
      return renderSetup();
    }
    if (b.dataset.setup === 'finish') {
      call('setup:try', false);
      state = await call('onboarding:complete');
      view = 'home';
      return route();
    }
    if (b.dataset.chord) {
      keyTested = false;
      state.settings = await call('settings:update', { pttChord: b.dataset.chord });
      await refreshState();
      return renderSetup();
    }
  });
}

function onHotkeyEvent(ev) {
  const test = $('#key-test');
  if (test) {
    if (ev === 'ptt_down') test.classList.add('down');
    if (ev === 'ptt_up' || ev === 'ptt_broken') {
      test.classList.remove('down');
      if (ev === 'ptt_up' && !keyTested) {
        keyTested = true;
        renderSetup();
      }
    }
  }
}

async function onTryResult() {
  if (!state.user || state.onboarded || SETUP_STEPS[setupStep].id !== 'try') return;
  const { items } = await call('history:get');
  if (tryBaseline === null || items.length <= tryBaseline) return;
  const it = items[0];
  const box = $('#try-result');
  if (!box) return;
  box.hidden = false;
  box.innerHTML = `<div class="head"><b>Nice. That’s it, in any app.</b><span class="chip ok">Worked</span></div>
    ${it.raw ? `<div class="marks">${renderMarks(it.raw, it.text)}</div>` : ''}`;
}

// ---------- shell ----------

function renderShell() {
  const u = state.user;
  $('#me').innerHTML = `<span class="avatar">${initial(u.name)}</span><div><b>${esc(u.name)}</b><small>${u.local ? 'Free mode' : esc(u.email)}</small></div>`;
  const sp = state.speech;
  $('#plan-card').innerHTML = u.planUsage
    ? `<b>ChatGPT plan</b><span class="muted">Your ChatGPT plan cleans up every dictation.</span><span class="chip ok" style="justify-self:start">Connected</span>`
    : `<b>Free mode</b><span class="muted">Cleanup runs on this computer.</span>${state.cleaner.ready || state.cleaner.downloaded ? '<span class="chip ok" style="justify-self:start">On-device AI</span>' : '<button class="btn btn-sm" data-cleaner-download>Get AI cleanup</button>'}`;
  if (!sp.ready && !sp.models[state.settings.speechModel]?.downloaded) {
    $('#plan-card').innerHTML += '<span class="chip bad" style="justify-self:start">Speech engine not set up</span>';
  }
}

// ---------- home ----------

const ICONS = {
  streak: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 4 5 4 9a4 4 0 0 1-8 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 0-8z"/></svg>',
  words: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  speed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/></svg>',
};

function greeting() {
  const h = new Date().getHours();
  const first = state.user.name.split(' ')[0];
  return h < 12 ? `Good morning, ${first}` : h < 18 ? `Welcome back, ${first}` : `Good evening, ${first}`;
}

function renderBanner(message) {
  const b = $('#home-banner');
  const free = !state.user.planUsage;
  const hasCleaner = state.cleaner.ready || state.cleaner.downloaded;
  if (message) {
    b.hidden = false;
    b.innerHTML = `<span>${esc(message)}</span><button class="btn btn-sm" data-open="${USAGE_URL}">Open ChatGPT usage</button>`;
  } else if (isMac && state.hotkey.supported && state.hotkey.status === 'need_permission') {
    b.hidden = false;
    b.innerHTML = `<span>Allow Accessibility so bewithflow can see your ${esc(state.hotkey.label || 'fn')} key and paste into other apps.</span><button class="btn btn-sm btn-primary" data-perm="ax">Allow</button>`;
  } else if (free && !hasCleaner) {
    b.hidden = false;
    b.innerHTML = `<span>Get AI-quality cleanup on your Free plan with a one-time download.</span><button class="btn btn-sm btn-primary" data-cleaner-download>Download ${state.cleaner.size}</button>`;
  } else b.hidden = true;
}

async function renderHome() {
  $('#greeting').textContent = greeting();
  $('#hero-key').innerHTML = holdKeyHTML();
  $('#hero-sub').textContent = state.hotkey.supported
    ? 'Works in WhatsApp, Slack, Mail, Notes and your browser. Release the key and your words appear where you’re typing. Double-tap for hands-free.'
    : 'Works in WhatsApp, Slack, Mail and your browser. Press it again to paste where you’re typing.';
  updatePracticeButton(state.phase);
  renderBanner();
  await loadHistory();
}

const PROVIDER_CHIP = {
  chatgpt: '<span class="chip violet">ChatGPT</span>',
  'local-ai': '<span class="chip ok">On-device AI</span>',
  local: '<span class="chip warn">Basic cleanup</span>',
  openai: '<span class="chip violet">ChatGPT</span>',
  gemini: '<span class="chip warn">Gemini</span>',
  raw: '<span class="chip bad">Raw</span>',
};

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const y = new Date();
  y.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === y.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

let historyItems = [];
let historyStats = null;

async function loadHistory() {
  const { items, stats } = await call('history:get');
  historyItems = items;
  historyStats = stats;
  $('#stats').innerHTML = `
    <span class="stat">${ICONS.streak}<b>${stats.streak}</b> day streak</span>
    <span class="stat">${ICONS.words}<b>${stats.totalWords.toLocaleString()}</b> words</span>
    <span class="stat">${ICONS.speed}<b>${stats.wpm || '–'}</b> WPM</span>`;
  renderHistory();
}

function renderHistory() {
  const q = $('#history-search').value.trim().toLowerCase();
  const items = q ? historyItems.filter((it) => it.text.toLowerCase().includes(q) || (it.app || '').toLowerCase().includes(q)) : historyItems;
  const host = $('#history');
  if (!historyItems.length) {
    host.innerHTML = `<div class="empty"><h3>Your words will show up here</h3>Open any app, hold ${holdKeyHTML()} and start talking.</div>`;
    return;
  }
  if (!items.length) {
    host.innerHTML = `<div class="empty"><h3>No matches</h3>Nothing in your history matches “${esc(q)}”.</div>`;
    return;
  }
  const groups = [];
  for (const it of items) {
    const day = dayLabel(it.at);
    if (!groups.length || groups.at(-1).day !== day) groups.push({ day, items: [] });
    groups.at(-1).items.push(it);
  }
  host.innerHTML = groups
    .map(
      (g) => `<div class="day">${esc(g.day)}</div><div class="entries">${g.items
        .map((it) => {
          const ops = it.raw ? window.bwfDiff.wordDiff(it.raw, it.text) : null;
          const canMark = Boolean(ops && ops.some((o) => o.type !== 'same'));
          const words = it.text.trim().split(/\s+/).length;
          return `<article class="entry" data-id="${it.id}">
            <time>${new Date(it.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</time>
            <div>
              <div class="entry-text" data-text>${esc(it.text)}</div>
              <div class="entry-meta">${it.app ? `<span>${esc(it.app)}</span>·` : ''}${PROVIDER_CHIP[it.provider] || ''}<span>${words} words</span>${it.latencyMs ? `<span title="From releasing the key to pasted">· ${(it.latencyMs / 1000).toFixed(1)} s</span>` : ''}</div>
            </div>
            <div class="entry-actions">
              ${canMark ? '<button class="btn btn-sm btn-ghost" data-marks aria-pressed="false">Show edits</button>' : ''}
              <button class="btn btn-sm btn-ghost" data-copy>Copy</button>
              <button class="btn btn-sm btn-ghost btn-danger" data-del aria-label="Delete dictation">Delete</button>
            </div>
          </article>`;
        })
        .join('')}</div>`,
    )
    .join('');
}

function wireHome() {
  $('#history').addEventListener('click', async (e) => {
    const entry = e.target.closest('.entry');
    const btn = e.target.closest('button');
    if (!entry || !btn) return;
    const item = historyItems.find((x) => x.id === entry.dataset.id);
    if (!item) return;
    if (btn.matches('[data-copy]')) {
      await call('clipboard:copy', item.text);
      toast('Copied');
    } else if (btn.matches('[data-del]')) {
      await call('history:delete', item.id);
      loadHistory();
    } else if (btn.matches('[data-marks]')) {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      const textEl = $('[data-text]', entry);
      textEl.classList.toggle('marks', on);
      textEl.innerHTML = on ? renderMarks(item.raw, item.text) : esc(item.text);
      btn.setAttribute('aria-pressed', String(on));
      btn.textContent = on ? 'Hide edits' : 'Show edits';
    }
  });
  $('#history-search').addEventListener('input', renderHistory);
  $('#practice-btn').addEventListener('click', async () => {
    $('#practice').focus();
    try {
      await call('dictation:toggle');
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function updatePracticeButton(phase) {
  const b = $('#practice-btn');
  b.textContent = phase === 'listening' ? 'Stop and paste' : phase === 'processing' ? 'Cleaning up…' : 'Dictate here';
  b.disabled = phase === 'processing';
}

// ---------- dictionary ----------

async function loadDictionary(words) {
  words = words || (await call('dictionary:get'));
  $('#words').innerHTML = words.length
    ? words.map((w) => `<div class="list-row"><span class="grow trigger">${esc(w)}</span><span class="row-actions"><button class="btn btn-sm btn-ghost btn-danger" data-word="${esc(w)}" aria-label="Remove ${esc(w)}">Remove</button></span></div>`).join('')
    : '<div class="empty"><h3>Teach bewithflow your words</h3>Add names and terms you say often, and they’ll always be spelled right.</div>';
}

function wireDictionary() {
  const form = $('#dict-form');
  $('#dict-add-btn').addEventListener('click', () => {
    form.hidden = false;
    $('#dict-input').focus();
  });
  $('#dict-cancel').addEventListener('click', () => (form.hidden = true));
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      loadDictionary(await call('dictionary:add', $('#dict-input').value));
      $('#dict-input').value = '';
      $('#dict-input').focus();
    } catch (err) {
      toast(err.message, 'error');
    }
  });
  $('#words').addEventListener('click', async (e) => {
    const w = e.target.closest('[data-word]')?.dataset.word;
    if (w) loadDictionary(await call('dictionary:remove', w));
  });
}

// ---------- snippets ----------

let snippetItems = [];
let editingSnippet = null;

async function loadSnippets(list) {
  snippetItems = list || (await call('snippets:get'));
  $('#snippets').innerHTML = snippetItems.length
    ? snippetItems
        .map(
          (s) => `<div class="list-row" data-id="${s.id}">
            <div class="grow"><span class="trigger">${esc(s.trigger)}</span> <span class="arrow">→</span><div class="expansion">${esc(s.expansion)}</div></div>
            <span class="row-actions"><button class="btn btn-sm btn-ghost" data-edit>Edit</button><button class="btn btn-sm btn-ghost btn-danger" data-remove>Delete</button></span>
          </div>`,
        )
        .join('')
    : '<div class="empty"><h3>Say less, send more</h3>Add a snippet like “my calendly link” and say it while dictating to insert the full link.</div>';
}

function openSnippet(snip = null) {
  editingSnippet = snip;
  $('#snip-title').textContent = snip ? 'Edit snippet' : 'Add snippet';
  $('#snip-save').textContent = snip ? 'Save changes' : 'Add snippet';
  $('#snip-trigger').value = snip?.trigger || '';
  $('#snip-expansion').value = snip?.expansion || '';
  $('#snip-error').textContent = '';
  $('#snip-modal').hidden = false;
  $('#snip-trigger').focus();
}

function wireSnippets() {
  $('#snip-add-btn').addEventListener('click', () => openSnippet());
  $('#snippets').addEventListener('click', async (e) => {
    const row = e.target.closest('.list-row');
    if (!row) return;
    const snip = snippetItems.find((s) => s.id === row.dataset.id);
    if (e.target.closest('[data-edit]')) openSnippet(snip);
    if (e.target.closest('[data-remove]')) {
      loadSnippets(await call('snippets:remove', snip.id));
      toast('Snippet deleted');
    }
  });
  $('#snip-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const list = await call('snippets:save', { id: editingSnippet?.id, trigger: $('#snip-trigger').value, expansion: $('#snip-expansion').value });
      $('#snip-modal').hidden = true;
      loadSnippets(list);
      toast(editingSnippet ? 'Snippet saved' : 'Snippet added');
    } catch (err) {
      $('#snip-error').textContent = err.message;
    }
  });
  $('#snip-form').addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') $('#snip-form').requestSubmit();
  });
}

// ---------- style ----------

const LEVEL_DESC = {
  light: 'Removes fillers and fixes punctuation. Keeps your exact words.',
  standard: 'Also fixes grammar and applies your corrections.',
  polished: 'Also tightens wording so it reads as written.',
};

function renderStyle() {
  const { categories, styles } = state.styleMeta;
  $('#style-tabs').innerHTML = Object.entries(categories)
    .map(([id, c]) => `<button role="tab" data-style-tab="${id}" aria-selected="${id === styleTab}">${esc(c.label)}</button>`)
    .join('');
  const cat = categories[styleTab];
  $('#style-apps').textContent = `Used in ${cat.apps}.`;
  const chosen = state.settings.styles[styleTab];
  $('#style-cards').innerHTML = cat.styles
    .map(
      (id) => `<button class="style-card" data-style="${id}" aria-pressed="${id === chosen}">
        <div><h4>${esc(styles[id].label)}</h4><span class="desc">${esc(styles[id].desc)}</span></div>
        <div class="sample">${esc(applyStyle(cat.sample, id))}</div></button>`,
    )
    .join('');
  $$('[data-seg="cleanupLevel"] button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.value === state.settings.cleanupLevel)));
  $('#level-desc').textContent = LEVEL_DESC[state.settings.cleanupLevel];
}

function wireStyle() {
  $('#style-tabs').addEventListener('click', (e) => {
    const b = e.target.closest('[data-style-tab]');
    if (!b) return;
    styleTab = b.dataset.styleTab;
    renderStyle();
  });
  $('#style-cards').addEventListener('click', async (e) => {
    const b = e.target.closest('[data-style]');
    if (!b) return;
    await saveSettings({ styles: { ...state.settings.styles, [styleTab]: b.dataset.style } }, `${state.styleMeta.categories[styleTab].label}: ${state.styleMeta.styles[b.dataset.style].label}`);
    renderStyle();
  });
  $('[data-seg="cleanupLevel"]').addEventListener('click', async (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    await saveSettings({ cleanupLevel: b.dataset.value });
    renderStyle();
  });
}

// ---------- settings ----------

async function saveSettings(patch, message = 'Saved') {
  try {
    state.settings = await call('settings:update', patch);
    toast(message);
  } catch (err) {
    toast(err.message, 'error');
  }
  if (!$('#settings').hidden) renderSettingsValues();
}

function openSettings(tab = 'general') {
  $('#settings').hidden = false;
  showSettingsTab(tab);
  renderSettings();
}

function closeSettings() {
  stopCapture();
  $('#settings').hidden = true;
}

function showSettingsTab(tab) {
  $$('[data-stab]').forEach((b) => b.setAttribute('aria-current', String(b.dataset.stab === tab)));
  $$('[data-spane]').forEach((p) => (p.hidden = p.dataset.spane !== tab));
  $('#settings-body').scrollTop = 0;
  if (tab === 'ai') {
    renderPrompt();
    loadModels();
  }
}

function renderSettingsValues() {
  const s = state.settings;
  $('#ptt-setting').hidden = !state.hotkey.supported;
  $('#ptt-picker').innerHTML = Object.entries(state.hotkey.chords || {})
    .map(([id, label]) => `<button data-chord="${id}" aria-pressed="${id === s.pttChord}">${esc(label)}</button>`)
    .join('');
  $('#sc-main').innerHTML = keycaps(s.shortcut);
  $('#sc-paste').innerHTML = keycaps(s.pasteLastShortcut);
  $('#language').value = s.language;
  $$('[data-toggle]').forEach((i) => (i.checked = Boolean(s[i.dataset.toggle])));
  renderModelSelect();
}

function renderSettings() {
  renderSettingsValues();
  renderSharedCards();
  $('#acct-name').textContent = state.user.name;
  $('#acct-email').textContent = state.user.local ? 'Free mode on this computer (no ChatGPT account)' : state.user.email;
  $('#switch-account').textContent = state.user.local ? 'Connect ChatGPT' : 'Use another account';
}

function renderModelSelect() {
  const sel = $('#model-select');
  if (!state.user.planUsage) {
    sel.innerHTML = '<option>Needs ChatGPT Plus or Pro</option>';
    sel.disabled = true;
    return;
  }
  if (!models) {
    sel.innerHTML = '<option>Loading your models…</option>';
    sel.disabled = true;
    return;
  }
  sel.disabled = false;
  sel.innerHTML = models.length
    ? models.map((m) => `<option value="${esc(m.slug)}" ${m.slug === state.settings.chatgptModel ? 'selected' : ''}>${esc(m.name)}</option>`).join('')
    : '<option>No models available</option>';
}

async function loadModels(refresh = false) {
  if (!state.user.planUsage) return renderModelSelect();
  try {
    models = await call('chatgpt:models', { refresh });
    await refreshState();
  } catch (err) {
    models = [];
    toast(err.message, 'error');
  }
  renderModelSelect();
}

async function renderPrompt() {
  const custom = state.settings.customPrompt;
  $('#prompt').value = custom || (await call('prompt:default'));
  const chip = $('#prompt-state');
  chip.textContent = custom ? 'Custom' : 'Default';
  chip.className = `chip ${custom ? 'warn' : 'ok'}`;
}

let capturing = null;
function stopCapture() {
  if (!capturing) return;
  capturing.btn.textContent = 'Change';
  capturing.btn.classList.remove('capture');
  window.removeEventListener('keydown', capturing.onKey, true);
  capturing = null;
}

function wireSettings() {
  $('#open-settings').addEventListener('click', () => openSettings());
  $$('#settings [data-close]').forEach((b) => b.addEventListener('click', closeSettings));
  $$('#snip-modal [data-close]').forEach((b) => b.addEventListener('click', () => ($('#snip-modal').hidden = true)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape' || capturing) return;
    if (!$('#snip-modal').hidden) $('#snip-modal').hidden = true;
    else if (!$('#settings').hidden) closeSettings();
  });
  $$('[data-stab]').forEach((b) => b.addEventListener('click', () => showSettingsTab(b.dataset.stab)));

  $('#ptt-picker').addEventListener('click', (e) => {
    const b = e.target.closest('[data-chord]');
    if (b) saveSettings({ pttChord: b.dataset.chord }, `Hold ${state.hotkey.chords[b.dataset.chord]} to talk`).then(refreshState).then(renderSettingsValues);
  });
  $('#language').addEventListener('change', (e) => saveSettings({ language: e.target.value }));
  $$('[data-toggle]').forEach((i) => i.addEventListener('change', () => saveSettings({ [i.dataset.toggle]: i.checked })));
  $('#model-select').addEventListener('change', (e) => saveSettings({ chatgptModel: e.target.value }, 'Model updated'));
  $('#model-refresh').addEventListener('click', () => loadModels(true));

  $('#prompt-save').addEventListener('click', async () => {
    const text = $('#prompt').value.trim();
    const def = await call('prompt:default');
    await saveSettings({ customPrompt: text === def.trim() ? '' : text }, 'Prompt saved');
    renderPrompt();
  });
  $('#prompt-reset').addEventListener('click', async () => {
    await saveSettings({ customPrompt: '' }, 'Prompt reset to default');
    renderPrompt();
  });

  $$('[data-capture]').forEach((btn) =>
    btn.addEventListener('click', () => {
      if (capturing) return stopCapture();
      btn.textContent = 'Press keys…';
      btn.classList.add('capture');
      const onKey = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.key === 'Escape') return stopCapture();
        const r = accelFromEvent(e);
        if (!r) return;
        if (r.invalid) return toast(r.invalid, 'error');
        const field = btn.dataset.capture;
        stopCapture();
        saveSettings({ [field]: r.accel }, 'Shortcut updated');
      };
      capturing = { btn, onKey };
      window.addEventListener('keydown', onKey, true);
    }),
  );

  $('#signout').addEventListener('click', async () => {
    const res = await call('auth:signOut');
    state = res;
    models = null;
    closeSettings();
    route();
    toast(res.revoked ? 'Signed out' : 'Signed out here. Disconnect bewithflow in ChatGPT Settings to be sure.', res.revoked ? '' : 'error');
  });
  $('#switch-account').addEventListener('click', async (e) => {
    if (state.user.local) return enablePlan(e.currentTarget); // keeps history, dictionary and snippets
    state = await call('auth:signOut');
    models = null;
    closeSettings();
    route();
    signIn(null);
  });
  $('#forget-account').addEventListener('click', async () => {
    if (!confirm('Remove this account from bewithflow? Its settings, dictionary, snippets and history on this computer are deleted.')) return;
    state = await call('auth:forget');
    models = null;
    closeSettings();
    route();
  });
}

// ---------- boot ----------

function mountMarks() {
  const tpl = $('#mark');
  $$('[data-mark]').forEach((el) => el.prepend(tpl.content.cloneNode(true)));
}

async function boot() {
  mountMarks();
  wireAuth();
  wireShared();
  wireSetup();
  wireHome();
  wireDictionary();
  wireSnippets();
  wireStyle();
  wireSettings();
  $$('[data-nav]').forEach((b) => b.addEventListener('click', () => navigate(b.dataset.nav)));

  window.bwf.on('history:changed', () => {
    if (state?.onboarded && view === 'home') loadHistory();
    else onTryResult();
  });
  window.bwf.on('dictation:phase', (phase) => {
    if (state) state.phase = phase;
    updatePracticeButton(phase);
  });
  window.bwf.on('speech:status', (speech) => {
    if (!state) return;
    state.speech = speech;
    if (state.user) rerender();
  });
  window.bwf.on('cleaner:status', (cleaner) => {
    if (!state) return;
    state.cleaner = cleaner;
    if (state.user) rerender();
  });
  window.bwf.on('hotkey:event', onHotkeyEvent);
  window.bwf.on('hotkey:status', async () => {
    await refreshState();
    if (state.user) rerender();
  });
  window.bwf.on('chatgpt:problem', (message) => {
    if (state?.user && state.onboarded) renderBanner(message);
  });
  window.bwf.on('hub:navigate', async (target) => {
    await refreshState();
    if (target === 'settings' && state.user && state.onboarded) {
      route();
      return openSettings(state.speech.ready ? 'general' : 'ai');
    }
    if (['home', 'dictionary', 'snippets', 'style'].includes(target)) view = target;
    route();
  });

  await refreshState();
  route();
}

boot();
