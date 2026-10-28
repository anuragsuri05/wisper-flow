'use strict';

const path = require('path');
const fs = require('fs');
const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  globalShortcut,
  ipcMain,
  screen,
  systemPreferences,
  shell,
  nativeImage,
  session,
  safeStorage,
  clipboard,
} = require('electron');

const { Store } = require('./store');
const { ChatGPTAuth } = require('./chatgpt-auth');
const { listModels, pickDefaultModel, respond, ChatGPTError, USAGE_URL } = require('./chatgpt');
const { Transcriber } = require('./transcriber');
const { LiveTranscriber } = require('./live-transcriber');
const { Agent: HttpAgent, fetch: undiciFetch } = require('undici');
const { LocalCleaner } = require('./local-cleaner');
const { processDictation } = require('./ai');
const { buildMasterPrompt, exampleTurns } = require('./prompt');
const { pasteText } = require('./paste');
const { KeyHook } = require('./keyhook');
const { categorize, CATEGORIES, STYLES, applyStyleLocally } = require('./styles');
const { markPng } = require('./icon');

const isMac = process.platform === 'darwin';
const MAX_RECORDING_MS = 10 * 60 * 1000;
const BAR = { width: 260, height: 64 };
const EXTERNAL_LINKS = new Set([
  USAGE_URL,
  'https://chatgpt.com/#pricing',
  'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
  'x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone',
  'x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent',
  'x-apple.systempreferences:com.apple.Keyboard-Settings.extension',
]);

// Hold-to-talk keys offered on macOS, with the label shown on the Flow Bar and in the app.
const CHORDS = {
  fn: 'fn',
  'ctrl+alt': '⌃ ⌥',
  ralt: 'Right ⌥',
  rcmd: 'Right ⌘',
  rctrl: 'Right ⌃',
};

let store;
let auth;
let transcriber;
let localCleaner;
let keyhook;
let hub = null;
let bar = null;
let tray = null;
let quitting = false;
let phase = 'idle'; // idle | listening | processing
let lastText = '';
let modelCache = null; // { clientId, models }

// Dev only (ignored in release builds): BWF_USER_DATA isolates data; BWF_SNAPSHOT=<dir>
// screenshots each screen and quits. Set before the single-instance lock, which is scoped
// to the user-data folder.
const DEV = !app.isPackaged;
if (DEV && process.env.BWF_USER_DATA) app.setPath('userData', process.env.BWF_USER_DATA);

// `bewithflow --self-test`: checks the packaged app's native parts and exits (see selfTest below).
const SELF_TEST = process.argv.includes('--self-test');
if (SELF_TEST) app.setPath('userData', path.join(app.getPath('temp'), `bewithflow-selftest-${process.pid}`));

if (!SELF_TEST && !app.requestSingleInstanceLock()) app.quit();
app.on('second-instance', () => showHub());

// ---------- error log ----------
// Unexpected errors go to logs/app.log (no dictation text is ever written there).
function logError(kind, err) {
  try {
    const file = path.join(app.getPath('userData'), 'logs', 'app.log');
    require('fs').mkdirSync(path.dirname(file), { recursive: true });
    require('fs').appendFileSync(file, `${new Date().toISOString()} ${kind} v${app.getVersion()} ${process.platform}-${process.arch}: ${err?.stack || err}\n`);
  } catch {
    /* nothing more we can do */
  }
}
process.on('uncaughtException', (err) => logError('uncaughtException', err));
process.on('unhandledRejection', (err) => logError('unhandledRejection', err));

// ---------- windows ----------

function createHub() {
  hub = new BrowserWindow({
    width: 1080,
    height: 720,
    minWidth: 880,
    minHeight: 600,
    show: false,
    title: 'bewithflow',
    backgroundColor: '#18111b',
    titleBarStyle: isMac ? 'hiddenInset' : 'default',
    trafficLightPosition: { x: 18, y: 18 },
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
    },
  });
  hub.loadFile(path.join(__dirname, '../renderer/hub/index.html'));
  hub.once('ready-to-show', () => hub.show());
  hub.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      hub.hide();
    }
  });
  hub.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
}

function showHub(view) {
  if (!hub || hub.isDestroyed()) createHub();
  hub.show();
  hub.focus();
  if (view) hub.webContents.send('hub:navigate', view);
}

function createBar() {
  const { workArea } = screen.getPrimaryDisplay();
  bar = new BrowserWindow({
    width: BAR.width,
    height: BAR.height,
    x: Math.round(workArea.x + (workArea.width - BAR.width) / 2),
    y: Math.round(workArea.y + workArea.height - BAR.height - 10),
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    focusable: false, // never steal focus from the app you are dictating into
    skipTaskbar: true,
    hasShadow: false,
    alwaysOnTop: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });
  bar.setAlwaysOnTop(true, 'screen-saver');
  bar.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  bar.setIgnoreMouseEvents(true, { forward: true });
  bar.loadFile(path.join(__dirname, '../renderer/bar/bar.html'));
  bar.once('ready-to-show', syncBarVisibility);
}

let barHideTimer = null;
function syncBarVisibility() {
  if (!bar || bar.isDestroyed()) return;
  clearTimeout(barHideTimer);
  const user = store.currentUser();
  const always = user && store.getSettings().alwaysShowBar;
  if (user && (always || phase !== 'idle')) bar.showInactive();
  else if (!user) bar.hide();
  else barHideTimer = setTimeout(() => phase === 'idle' && bar.hide(), 2500); // let the result flash finish
}

function barSend(msg) {
  if (bar && !bar.isDestroyed()) bar.webContents.send('bar:command', msg);
}

function hubSend(channel, payload) {
  if (hub && !hub.isDestroyed()) hub.webContents.send(channel, payload);
}

// ---------- tray ----------

function createTray() {
  const img = nativeImage.createEmpty();
  img.addRepresentation({ scaleFactor: 1, buffer: markPng(18) });
  img.addRepresentation({ scaleFactor: 2, buffer: markPng(36) });
  if (isMac) img.setTemplateImage(true);
  tray = new Tray(img);
  tray.setToolTip('bewithflow');
  refreshTrayMenu();
}

function refreshTrayMenu() {
  if (!tray) return;
  const user = store.currentUser();
  const s = user ? store.getSettings() : null;
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: user ? `ChatGPT: ${user.email}` : 'Not signed in', enabled: false },
      { type: 'separator' },
      {
        label: phase === 'listening' ? 'Stop dictation' : 'Start dictation',
        accelerator: s?.shortcut,
        enabled: Boolean(user) && phase !== 'processing',
        click: handsFreeToggle,
      },
      { label: 'Paste last transcript', accelerator: s?.pasteLastShortcut, enabled: Boolean(lastText), click: pasteLast },
      { type: 'separator' },
      { label: 'Open bewithflow', click: () => showHub('home') },
      { label: 'Settings…', enabled: Boolean(user), click: () => showHub('settings') },
      { type: 'separator' },
      { label: 'Quit bewithflow', role: 'quit' },
    ]),
  );
}

// ---------- shortcuts ----------

function registerShortcuts() {
  globalShortcut.unregisterAll();
  if (!store.currentUser()) return { ok: true };
  const s = store.getSettings();
  const failed = [];
  if (s.shortcut && !globalShortcut.register(s.shortcut, handsFreeToggle)) failed.push(s.shortcut);
  keyhook?.setChord(s.pttChord);
  barSend({ type: 'config', pttLabel: pttLabel() });
  if (s.pasteLastShortcut && !globalShortcut.register(s.pasteLastShortcut, pasteLast)) failed.push(s.pasteLastShortcut);
  refreshTrayMenu();
  return failed.length ? { ok: false, failed } : { ok: true };
}

function pttLabel() {
  if (!keyhook?.supported || !store.currentUser()) return null;
  return CHORDS[store.getSettings().pttChord] || 'fn';
}

function setPhase(next) {
  phase = next;
  syncBarVisibility();
  if (next === 'listening') globalShortcut.register('Escape', cancelDictation);
  else if (globalShortcut.isRegistered('Escape')) globalShortcut.unregister('Escape');
  hubSend('dictation:phase', phase);
  refreshTrayMenu();
}

// ---------- ChatGPT session ----------

// One long-lived connection to OpenAI: no new TLS handshake on each dictation.
const httpAgent = new HttpAgent({ keepAliveTimeout: 60_000, keepAliveMaxTimeout: 600_000, connections: 4 });
const apiFetch = (url, init = {}) => undiciFetch(url, { ...init, dispatcher: httpAgent });

/** Open (or keep open) the connection while you're still talking. */
function warmConnection() {
  if (!store.currentUser()?.planUsage) return;
  apiFetch('https://api.openai.com/v1/models', { method: 'HEAD', signal: AbortSignal.timeout(5000) }).catch(() => {});
}

/** Renew the sign-in in the background so it never happens in the middle of a dictation. */
function keepSessionFresh() {
  const user = store.currentUser();
  if (!user?.planUsage || phase !== 'idle') return;
  const tokens = store.getTokens();
  if (tokens?.refreshToken && tokens.expiresAt - Date.now() < 10 * 60 * 1000) accessToken({ force: true }).catch(() => {});
}

let refreshing = null;

/** A valid access token for the active ChatGPT account, refreshing it when close to expiry. */
async function accessToken({ force = false } = {}) {
  const acct = store.activeAccount();
  const tokens = acct && store.getTokens(acct.clientId);
  if (!tokens) throw new ChatGPTError('Sign in with ChatGPT first.', 'auth');
  if (!force && tokens.expiresAt - 2 * 60 * 1000 > Date.now()) return tokens.accessToken;
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const next = await auth.refresh({ clientId: acct.clientId, refreshToken: tokens.refreshToken, idToken: tokens.idToken });
        store.setTokens(next, acct.clientId);
        return next.accessToken;
      } catch (err) {
        if (err.code === 'expired') {
          store.signOut();
          afterAuthChange();
          hubSend('hub:navigate', 'auth');
        }
        throw err;
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}

async function withToken(fn) {
  try {
    return await fn(await accessToken());
  } catch (err) {
    if (err.kind !== 'auth') throw err;
    return fn(await accessToken({ force: true })); // one retry with a renewed token
  }
}

async function chatgptModels({ refresh = false } = {}) {
  const id = store.activeAccount()?.clientId;
  if (!refresh && modelCache?.clientId === id) return modelCache.models;
  const models = await withToken((token) => listModels({ token, fetchImpl: apiFetch }));
  modelCache = { clientId: id, models };
  const s = store.getSettings();
  if (!s.chatgptModel || !models.some((m) => m.slug === s.chatgptModel)) store.updateSettings({ chatgptModel: pickDefaultModel(models) });
  return models;
}

async function chatgptCleanup({ instructions, input }) {
  let model = store.getSettings().chatgptModel;
  if (!model) {
    await chatgptModels();
    model = store.getSettings().chatgptModel;
  }
  if (!model) throw new ChatGPTError('Your ChatGPT account has no models available to bewithflow.', 'unsupported');
  // Cleanup needs no deliberation: reasoning off is ~0.2 s faster. Models that reject it get plain requests.
  const extra = noReasoningUnsupported.has(model) ? null : { reasoning: { effort: 'none' } };
  try {
    return await withToken((token) => respond({ token, model, instructions, input, examples: exampleTurns(), extra, fetchImpl: apiFetch }));
  } catch (err) {
    if (!extra || !/reasoning|effort/i.test(err.message)) throw err;
    noReasoningUnsupported.add(model);
    return withToken((token) => respond({ token, model, instructions, input, examples: exampleTurns(), fetchImpl: apiFetch }));
  }
}
const noReasoningUnsupported = new Set();

// ---------- speech engine ----------

function warmSpeechEngine() {
  const user = store.currentUser();
  if (!user) return;
  const key = store.getSettings().speechModel;
  if (transcriber.isDownloaded(key)) transcriber.load(key).catch(() => {});
  // Free accounts rely on on-device cleanup; Plus/Pro load it only as a backup once downloaded
  if (localCleaner.isDownloaded()) localCleaner.load().catch(() => {});
}

// ---------- dictation flow ----------
//
// Like Wispr Flow: hold the push-to-talk key and speak, release to paste.
// Double-tap the key (or press Space while holding it) for hands-free mode,
// then press the key again to finish. Esc cancels. The hands-free shortcut
// and a click on the Flow Bar toggle hands-free mode too.

const TAP_MS = 350; // shorter holds are taps, not dictation
const DOUBLE_TAP_MS = 450;
let mode = 'hold'; // hold | handsfree
let startedAt = 0;
let lastTapAt = 0;
let tipTimer = null;
let frontPromise = null;
let live = null; // LiveTranscriber for the current recording
let releasedAt = 0;
let setupTry = false; // during setup, dictation only runs on the "Try it" step

function onKey(ev) {
  hubSend('hotkey:event', ev); // setup screen lights up the key
  if (!store.currentUser()) return;
  if (!store.isOnboarded() && !setupTry) return;
  switch (ev) {
    case 'ptt_down':
      clearTimeout(tipTimer);
      if (phase === 'listening' && mode === 'handsfree') return stopDictation();
      if (phase !== 'idle') return;
      return startDictation(Date.now() - lastTapAt < DOUBLE_TAP_MS ? 'handsfree' : 'hold');
    case 'ptt_up':
      if (phase !== 'listening' || mode !== 'hold') return;
      if (Date.now() - startedAt < TAP_MS) {
        lastTapAt = Date.now();
        cancelDictation({ quiet: true });
        tipTimer = setTimeout(() => barSend({ type: 'flash', kind: 'info', message: `Hold ${pttLabel()} to talk` }), DOUBLE_TAP_MS);
        return;
      }
      return stopDictation();
    case 'ptt_space':
      if (phase === 'listening') {
        mode = 'handsfree';
        barSend({ type: 'mode', mode });
      } else if (phase === 'idle') startDictation('handsfree');
      return;
    case 'ptt_esc':
      return cancelDictation();
    case 'ptt_broken': // another key was pressed with the chord: it was a different shortcut
      if (phase === 'listening' && mode === 'hold') cancelDictation({ quiet: true });
      return;
    default:
  }
}

function handsFreeToggle() {
  if (phase === 'idle') return startDictation('handsfree');
  if (phase === 'listening') return stopDictation();
}

async function startDictation(nextMode = 'handsfree') {
  if (!store.currentUser()) {
    showHub('auth');
    return;
  }
  const key = store.getSettings().speechModel;
  if (!transcriber.status().ready && !transcriber.isDownloaded(key) && !transcriber.loading) {
    barSend({ type: 'flash', kind: 'error', message: 'Set up the speech engine first' });
    showHub('settings');
    return;
  }
  if (!transcriber.status().ready) transcriber.load(key).catch(() => {}); // loads while you talk
  if (isMac) {
    const mic = systemPreferences.getMediaAccessStatus('microphone');
    if (mic === 'not-determined') await systemPreferences.askForMediaAccess('microphone');
    if (systemPreferences.getMediaAccessStatus('microphone') !== 'granted') {
      barSend({ type: 'flash', kind: 'error', message: 'Allow microphone access in System Settings' });
      showHub('settings');
      return;
    }
  }
  mode = nextMode;
  startedAt = Date.now();
  frontPromise = keyhook?.supported ? keyhook.front() : Promise.resolve(null); // which app you're dictating into
  const language = store.getSettings().language;
  live = transcriber.status().ready ? new LiveTranscriber({ transcribe: (samples) => transcriber.transcribeSamples(samples, { language }) }) : null;
  warmConnection();
  setPhase('listening');
  barSend({ type: 'start', mode, maxMs: MAX_RECORDING_MS, sounds: store.getSettings().playSounds, pttLabel: pttLabel() });
}

function stopDictation() {
  releasedAt = Date.now();
  setPhase('processing');
  barSend({ type: 'stop' });
}

function cancelDictation({ quiet = false } = {}) {
  if (phase !== 'listening') return;
  live?.cancel();
  live = null;
  barSend({ type: 'cancel', quiet });
  setPhase('idle');
}

async function handleAudio({ wav, durationMs, peak }) {
  if (phase === 'listening') {
    releasedAt = Date.now();
    setPhase('processing'); // auto-stopped at max length
  }
  const session = live;
  live = null;
  try {
    if (!wav || durationMs < 300 || peak < 0.01) {
      session?.cancel();
      return { status: 'empty', message: 'No speech heard' };
    }

    const settings = store.getSettings();
    const user = store.currentUser();
    const front = await (frontPromise || Promise.resolve(null));
    const category = categorize(front);
    const t = { released: releasedAt || Date.now() };
    const full = (audio) => transcriber.transcribe(audio, { language: settings.language });
    const result = await processDictation({
      wav: Buffer.from(wav),
      settings,
      category,
      dictionary: store.getDictionary(),
      snippets: store.getSnippets(),
      // most of the recording was already transcribed while you talked; fall back to the whole file if that failed
      transcribe: async (audio) => {
        const text = session ? await session.finish().catch(() => full(audio)) : await full(audio);
        t.transcribed = Date.now();
        return text;
      },
      cleanup: user?.planUsage ? chatgptCleanup : null,
      localClean: localCleaner.status().ready ? (raw) => localCleaner.clean(raw, { dictionary: store.getDictionary() }) : null,
    });
    t.cleaned = Date.now();
    if (!result.text) return { status: 'empty', message: 'No speech heard' };

    lastText = result.text;
    const paste = await insertText(result.text);
    t.pasted = Date.now();
    const latency = {
      totalMs: t.pasted - t.released,
      speechMs: (t.transcribed || t.cleaned) - t.released,
      cleanupMs: t.cleaned - (t.transcribed || t.cleaned),
      pasteMs: t.pasted - t.cleaned,
      liveSegments: session?.segments || 0,
    };
    logLatency(result.provider, durationMs, latency);

    store.addHistory({
      text: result.text,
      raw: result.raw,
      provider: result.provider,
      durationMs,
      app: front?.name || '',
      category,
      latencyMs: latency.totalMs,
      warnings: result.warnings,
    });
    hubSend('history:changed');
    if (result.error?.kind === 'limit' || result.error?.kind === 'ineligible') hubSend('chatgpt:problem', result.error.message);

    if (!paste.pasted) {
      const tip = isMac ? 'Copied. Press ⌘V (allow Accessibility to auto-paste)' : 'Copied. Press Ctrl+V to paste';
      return { status: 'copied', message: tip, provider: result.provider };
    }
    if (result.provider === 'local') return { status: 'pasted', message: 'Pasted with basic cleanup', provider: 'local' };
    return { status: 'pasted', message: front?.name ? `Pasted in ${front.name}` : 'Pasted', provider: result.provider };
  } catch (err) {
    return { status: 'error', message: err.message };
  } finally {
    setPhase('idle');
  }
}

function logLatency(provider, durationMs, l) {
  try {
    const file = path.join(app.getPath('userData'), 'logs', 'latency.log');
    require('fs').mkdirSync(path.dirname(file), { recursive: true });
    require('fs').appendFileSync(
      file,
      `${new Date().toISOString()} ${provider} spoke=${(durationMs / 1000).toFixed(1)}s total=${l.totalMs}ms speech=${l.speechMs}ms cleanup=${l.cleanupMs}ms paste=${l.pasteMs}ms live_segments=${l.liveSegments}\n`,
    );
  } catch {
    /* best effort */
  }
}

async function insertText(text) {
  const canPaste = !isMac || systemPreferences.isTrustedAccessibilityClient(false);
  if (!canPaste) {
    clipboard.writeText(text);
    return { pasted: false };
  }
  return pasteText(text, {
    restoreClipboard: store.getSettings().restoreClipboard,
    nativePaste: keyhook?.status === 'ready' ? () => keyhook.paste() : null,
  });
}

async function pasteLast() {
  if (!lastText) {
    const [latest] = store.currentUser() ? store.getHistory() : [];
    lastText = latest?.text || '';
  }
  if (lastText) await insertText(lastText);
}

function globeKeySetting() {
  // macOS "Press 🌐 key to": 0 Do Nothing, 1 Change Input Source, 2 Show Emoji & Symbols, 3 Start Dictation
  return new Promise((resolve) => {
    if (!isMac) return resolve(null);
    require('child_process').execFile('defaults', ['read', 'com.apple.HIToolbox', 'AppleFnUsageType'], (err, out) =>
      resolve(err ? null : Number(String(out).trim())),
    );
  });
}

// ---------- IPC ----------

function handle(channel, fn) {
  ipcMain.handle(channel, async (_e, payload) => {
    try {
      return { ok: true, data: await fn(payload) };
    } catch (err) {
      return { ok: false, error: err.message || String(err), code: err.code || err.kind };
    }
  });
}

function permissions() {
  if (!isMac) return { mic: 'granted', accessibility: true, platform: process.platform };
  return {
    mic: systemPreferences.getMediaAccessStatus('microphone'),
    accessibility: systemPreferences.isTrustedAccessibilityClient(false),
    platform: process.platform,
  };
}

function appState() {
  const user = store.currentUser();
  return {
    user,
    savedAccounts: store.savedAccounts(),
    onboarded: user ? store.isOnboarded() : false,
    settings: user ? store.getSettings() : null,
    permissions: permissions(),
    speech: transcriber.status(),
    cleaner: localCleaner.status(),
    signingIn: Boolean(auth.pending),
    phase,
    hotkey: {
      supported: Boolean(keyhook?.supported),
      status: keyhook?.status || 'unsupported',
      error: keyhook?.error || null,
      chords: CHORDS,
      label: pttLabel(),
    },
    styleMeta: { categories: CATEGORIES, styles: STYLES },
  };
}

function afterAuthChange() {
  modelCache = null;
  lastText = '';
  registerShortcuts();
  syncBarVisibility();
  refreshTrayMenu();
  warmSpeechEngine();
  return appState();
}

function wireIpc() {
  handle('app:state', appState);

  // Sign in with ChatGPT. accountId: continue as a saved registration. consent: re-ask for plan usage.
  handle('auth:signIn', async ({ accountId, consent } = {}) => {
    if (accountId === 'local') {
      store.saveLocal();
      return afterAuthChange();
    }
    const previous = store.activeAccount();
    const account = accountId ? store.registration(accountId) : null;
    const result = await auth.signIn({ hostId: store.hostId, account, consent, onStatus: (msg) => hubSend('auth:status', msg) });
    store.saveSignIn(result);
    // moving up from Free mode: bring the on-device profile along
    if (previous?.local) store.migrateProfile(previous.clientId, result.clientId);
    afterAuthChange();
    if (result.tokens.planUsage) chatgptModels({ refresh: true }).catch(() => {});
    return appState();
  });
  // Free mode: use bewithflow on this computer without a ChatGPT sign-in
  handle('auth:local', () => {
    store.saveLocal(require('os').userInfo().username.replace(/^./, (c) => c.toUpperCase()));
    return afterAuthChange();
  });
  handle('auth:log', () => shell.showItemInFolder(path.join(app.getPath('userData'), 'logs', 'signin.log')));
  handle('auth:cancel', () => auth.cancel());
  handle('auth:reopen', () => auth.reopenBrowser());
  handle('auth:enablePlan', async () => {
    const acct = store.activeAccount();
    if (!acct) throw new Error('Sign in with ChatGPT first.');
    const account = acct.local ? null : store.registration(acct.clientId); // Free mode: a first ChatGPT sign-in
    const result = await auth.signIn({ hostId: store.hostId, account, consent: !acct.local, onStatus: (msg) => hubSend('auth:status', msg) });
    store.saveSignIn(result);
    if (acct.local) store.migrateProfile(acct.clientId, result.clientId);
    afterAuthChange();
    if (!result.tokens.planUsage) throw new Error('ChatGPT plan usage is still off. Approve it on the ChatGPT sign-in page.');
    chatgptModels({ refresh: true }).catch(() => {});
    return appState();
  });
  handle('auth:signOut', async () => {
    const acct = store.activeAccount();
    const tokens = acct && store.getTokens(acct.clientId);
    const revoked = acct ? await auth.revoke({ clientId: acct.clientId, refreshToken: tokens?.refreshToken }) : true;
    store.signOut();
    return { ...afterAuthChange(), revoked };
  });
  handle('auth:forget', async () => {
    const acct = store.activeAccount();
    const tokens = acct && store.getTokens(acct.clientId);
    if (acct) await auth.revoke({ clientId: acct.clientId, refreshToken: tokens?.refreshToken });
    store.forgetAccount();
    return afterAuthChange();
  });

  handle('chatgpt:models', ({ refresh } = {}) => chatgptModels({ refresh }));

  handle('speech:download', async (key) => {
    store.updateSettings({ speechModel: key });
    await transcriber.load(key);
    return transcriber.status();
  });
  handle('speech:status', () => transcriber.status());
  handle('cleaner:download', async () => {
    await localCleaner.load();
    return localCleaner.status();
  });

  handle('onboarding:complete', () => (store.setOnboarded(true), appState()));

  handle('settings:update', (patch) => {
    const before = store.getSettings();
    const after = store.updateSettings(patch);
    if (before.shortcut !== after.shortcut || before.pasteLastShortcut !== after.pasteLastShortcut) {
      const r = registerShortcuts();
      if (!r.ok) {
        store.updateSettings({ shortcut: before.shortcut, pasteLastShortcut: before.pasteLastShortcut });
        registerShortcuts();
        throw new Error(`${r.failed.join(', ')} is already used by another app or the system. Pick a different shortcut.`);
      }
    }
    if (before.pttChord !== after.pttChord) registerShortcuts();
    if (before.alwaysShowBar !== after.alwaysShowBar) syncBarVisibility();
    if (before.launchAtLogin !== after.launchAtLogin) app.setLoginItemSettings({ openAtLogin: Boolean(after.launchAtLogin) });
    return store.getSettings();
  });
  handle('prompt:default', () => {
    const s = store.getSettings();
    return buildMasterPrompt({ level: s.cleanupLevel, dictionary: store.getDictionary() });
  });

  handle('dictionary:get', () => store.getDictionary());
  handle('dictionary:add', (w) => store.addWord(w));
  handle('dictionary:remove', (w) => store.removeWord(w));

  handle('history:get', () => ({ items: store.getHistory(), stats: store.stats() }));
  handle('history:delete', (id) => (store.deleteHistory(id), { items: store.getHistory(), stats: store.stats() }));

  handle('dictation:toggle', () => handsFreeToggle());
  handle('snippets:get', () => store.getSnippets());
  handle('snippets:save', (snip) => store.saveSnippet(snip));
  handle('snippets:remove', (id) => store.removeSnippet(id));
  handle('style:preview', ({ category, style }) => applyStyleLocally(CATEGORIES[category]?.sample || '', style));
  handle('system:globeKey', globeKeySetting);
  handle('setup:try', (on) => {
    setupTry = Boolean(on);
  });
  handle('clipboard:copy', (text) => clipboard.writeText(String(text)));

  handle('perm:requestMic', async () => {
    if (isMac) {
      const status = systemPreferences.getMediaAccessStatus('microphone');
      if (status === 'not-determined') await systemPreferences.askForMediaAccess('microphone');
      else if (status !== 'granted') shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Microphone');
    }
    return permissions();
  });
  handle('perm:requestAccessibility', () => {
    if (isMac && !systemPreferences.isTrustedAccessibilityClient(true)) {
      shell.openExternal('x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility');
    }
    return permissions();
  });
  handle('perm:status', permissions);
  handle('open:external', (url) => {
    if (!EXTERNAL_LINKS.has(url)) throw new Error('Link not allowed.');
    return shell.openExternal(url);
  });

  // from the floating bar
  ipcMain.on('bar:chunk', (_e, chunk) => live?.push(chunk));
  handle('bar:audio', handleAudio);
  handle('bar:click', () => handsFreeToggle());
  handle('bar:cancel', () => cancelDictation());
  handle('bar:ready', () => ({ pttLabel: pttLabel() }));
  handle('bar:failed', (message) => {
    setPhase('idle');
    return message;
  });
  handle('bar:hover', (over) => {
    if (bar && !bar.isDestroyed()) bar.setIgnoreMouseEvents(!over, { forward: true });
  });
}

// ---------- dev snapshots ----------

async function snapshotScreens(dir) {
  const fs = require('fs');
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const shot = async (name, win = hub) => {
    await wait(1400);
    fs.writeFileSync(path.join(dir, `${name}.png`), (await win.webContents.capturePage()).toPNG());
  };
  const js = (code) => hub.webContents.executeJavaScript(code);
  await new Promise((r) => hub.webContents.once('did-finish-load', r));
  await shot('01-auth');
  store.saveSignIn({
    clientId: 'oaiapp_demo',
    identity: { sub: 'demo', email: 'laksh@example.com', name: 'Laksh Sharma' },
    tokens: { accessToken: 'demo', refreshToken: 'demo', idToken: 'demo', expiresAt: Date.now() + 3600e3, scopes: [], planUsage: !process.env.BWF_SNAPSHOT_FREE },
  });
  modelCache = { clientId: 'oaiapp_demo', models: [{ slug: 'demo-fast', name: 'Fast model (demo)' }, { slug: 'demo-smart', name: 'Smart model (demo)' }] };
  store.updateSettings({ chatgptModel: 'demo-fast' });
  hub.reload();
  await shot('02-setup-welcome');
  await js(`document.querySelector('[data-setup="next"]').click(); document.querySelector('[data-setup="next"]').click()`);
  await shot('03-setup-shortcut');
  store.setOnboarded(true);
  const now = Date.now();
  store.addHistory({ at: now - 3600e3, text: 'Send the invoice to Priya by Friday.', raw: 'um send the invoice to priya by friday', provider: 'chatgpt', app: 'Mail', durationMs: 3000 });
  store.addHistory({ at: now - 1800e3, text: 'Hey team, the build is green. Shipping the update this afternoon', raw: 'uh hey team so the build is like green shipping the the update this afternoon', provider: 'chatgpt', app: 'Slack', durationMs: 6000 });
  store.addHistory({ text: 'can we move dinner to 8:30? running a bit late', raw: 'um so can we move dinner to eight no wait eight thirty running a bit late', provider: 'chatgpt', app: 'WhatsApp', durationMs: 5000, latencyMs: 2810 });
  store.saveSnippet({ trigger: 'my calendly link', expansion: 'https://calendly.com/laksh/30min' });
  store.saveSnippet({ trigger: 'my address', expansion: '221B Baker Street, London NW1 6XE' });
  store.addWord('Supabase');
  hub.reload();
  await shot('04-home');
  hub.webContents.send('hub:navigate', 'snippets');
  await shot('05-snippets');
  hub.webContents.send('hub:navigate', 'style');
  await shot('06-style');
  hub.webContents.send('hub:navigate', 'settings');
  await shot('07-settings');
  await js(`document.querySelector('[data-stab="ai"]').click()`);
  await shot('08-settings-ai');
  const pill = (state, mode) => bar.webContents.executeJavaScript(`(() => { const p = document.getElementById('pill'); p.dataset.state='${state}'; p.dataset.mode='${mode}'; document.querySelectorAll('#meter b').forEach((b,i)=> b.style.height = (4 + Math.round(14*Math.abs(Math.sin(i*0.9))))+'px'); })()`);
  await pill('listening', 'hold');
  await shot('09-bar-hold', bar);
  await pill('listening', 'handsfree');
  await shot('10-bar-handsfree', bar);
  app.quit();
}

// ---------- lifecycle ----------

// ---------- release builds: self-test and updates ----------

/** Loads every native part a release build depends on, prints a JSON report and exits. */
async function selfTest() {
  const report = { version: app.getVersion(), arch: process.arch, platform: process.platform, packaged: app.isPackaged, checks: {} };
  const check = async (name, fn) => {
    try {
      report.checks[name] = { ok: true, detail: (await fn()) ?? '' };
    } catch (err) {
      report.checks[name] = { ok: false, detail: String(err?.message || err) };
    }
  };
  await check('sharp', () => `v${require('sharp').versions?.sharp || 'loaded'}`);
  await check('onnxruntime', () => {
    const ort = require('onnxruntime-node');
    if (typeof ort.InferenceSession?.create !== 'function') throw new Error('InferenceSession missing');
    return 'binding loaded';
  });
  await check('transformers', () => typeof require('@huggingface/transformers').pipeline === 'function' && 'loaded');
  await check('keyhelper', () =>
    new Promise((resolve, reject) => {
      if (process.platform !== 'darwin') return resolve('not used on this platform');
      const kh = new KeyHook({ resourcesPath: process.resourcesPath, packaged: app.isPackaged });
      const done = (fn, v) => {
        clearTimeout(timer);
        kh.stop();
        fn(v);
      };
      const timer = setTimeout(() => done(reject, new Error(`no response (status ${kh.status})`)), 8000);
      kh.on('status', ({ status, error }) => {
        if (status === 'ready' || status === 'need_permission') done(resolve, `${status} (${kh.bin.includes('Resources') ? 'bundled' : 'dev build'})`);
        else if (status === 'error') done(reject, new Error(error));
      });
      kh.start('fn');
    }),
  );
  await check('speech inference', async () => {
    // reuse an already-downloaded model from the real app data; never downloads in a self-test
    const models = path.join(app.getPath('appData'), 'bewithflow', 'models');
    const t = new Transcriber(models);
    const key = ['fast', 'accurate'].find((k) => t.isDownloaded(k));
    if (!key) return 'skipped (no speech model downloaded yet)';
    const started = Date.now();
    await t.load(key);
    await t.transcribeSamples(new Float32Array(16000));
    return `${key} model ran in ${Date.now() - started} ms`;
  });
  await check('updater', () => (fs.existsSync(path.join(process.resourcesPath, 'app-update.yml')) ? 'configured' : 'not configured (no publish target)'));
  report.ok = Object.values(report.checks).every((c) => c.ok);
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  app.exit(report.ok ? 0 : 1);
}

/** Auto-update from the release server, only in release builds that were built with a publish target. */
function setupAutoUpdates() {
  if (!app.isPackaged || !fs.existsSync(path.join(process.resourcesPath, 'app-update.yml'))) return;
  try {
    const { autoUpdater } = require('electron-updater');
    autoUpdater.autoDownload = true;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.on('error', (err) => logError('updater', err));
    autoUpdater.checkForUpdatesAndNotify().catch((err) => logError('updater', err));
    setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 60 * 60 * 1000);
  } catch (err) {
    logError('updater', err);
  }
}

if (SELF_TEST) app.whenReady().then(selfTest);
else app.whenReady().then(() => {
  store = new Store(app.getPath('userData'), {
    available: () => safeStorage.isEncryptionAvailable(),
    encrypt: (s) => safeStorage.encryptString(s).toString('base64'),
    decrypt: (s) => safeStorage.decryptString(Buffer.from(s, 'base64')),
  });
  const signInLog = path.join(app.getPath('userData'), 'logs', 'signin.log');
  auth = new ChatGPTAuth({
    openBrowser: (url) => shell.openExternal(url),
    // sign-in steps and error codes only; never tokens or authorization codes
    log: (line) => {
      try {
        require('fs').mkdirSync(path.dirname(signInLog), { recursive: true });
        require('fs').appendFileSync(signInLog, `${new Date().toISOString()} ${line}\n`);
      } catch {
        /* logging is best effort */
      }
    },
  });
  transcriber = new Transcriber(path.join(app.getPath('userData'), 'models'));
  transcriber.onChange((status) => hubSend('speech:status', status));
  localCleaner = new LocalCleaner(path.join(app.getPath('userData'), 'models'));
  localCleaner.onChange((status) => hubSend('cleaner:status', status));

  session.defaultSession.setPermissionRequestHandler((_wc, permission, cb) => cb(permission === 'media'));
  session.defaultSession.setPermissionCheckHandler((_wc, permission) => permission === 'media');

  if (isMac && app.dock) app.dock.setIcon(nativeImage.createFromBuffer(markPng(256, [42, 30, 47])));

  keyhook = new KeyHook({ resourcesPath: process.resourcesPath, packaged: app.isPackaged });
  keyhook.on('key', onKey);
  keyhook.on('status', (st) => hubSend('hotkey:status', st));
  keyhook.start(store.currentUser() ? store.getSettings().pttChord : 'fn');

  wireIpc();
  createHub();
  createBar();
  createTray();
  registerShortcuts();
  warmSpeechEngine();

  setInterval(keepSessionFresh, 60_000);
  app.on('activate', () => showHub());
  if (DEV && process.env.BWF_SNAPSHOT) snapshotScreens(process.env.BWF_SNAPSHOT);
  setupAutoUpdates();
});

app.on('before-quit', () => {
  quitting = true;
});
app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  keyhook?.stop();
});
app.on('window-all-closed', (e) => e.preventDefault()); // keep running in the tray
