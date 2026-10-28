'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const INVOKE = new Set([
  'app:state',
  'auth:signIn',
  'auth:cancel',
  'auth:reopen',
  'auth:enablePlan',
  'auth:signOut',
  'auth:forget',
  'auth:log',
  'auth:local',
  'chatgpt:models',
  'speech:download',
  'speech:status',
  'cleaner:download',
  'onboarding:complete',
  'settings:update',
  'prompt:default',
  'dictionary:get',
  'dictionary:add',
  'dictionary:remove',
  'history:get',
  'history:delete',
  'dictation:toggle',
  'clipboard:copy',
  'perm:requestMic',
  'perm:requestAccessibility',
  'perm:status',
  'open:external',
  'bar:audio',
  'bar:click',
  'bar:failed',
  'bar:hover',
  'bar:cancel',
  'bar:ready',
  'snippets:get',
  'snippets:save',
  'snippets:remove',
  'style:preview',
  'system:globeKey',
  'setup:try',
]);
const EVENTS = new Set(['bar:command', 'hub:navigate', 'history:changed', 'dictation:phase', 'speech:status', 'chatgpt:problem', 'auth:status', 'cleaner:status', 'hotkey:event', 'hotkey:status']);

contextBridge.exposeInMainWorld('bwf', {
  platform: process.platform,
  /** Resolves with data, rejects with a readable Error. */
  async call(channel, payload) {
    if (!INVOKE.has(channel)) throw new Error(`Unknown channel ${channel}`);
    const res = await ipcRenderer.invoke(channel, payload);
    if (!res.ok) throw Object.assign(new Error(res.error), { code: res.code });
    return res.data;
  },
  /** One-way, no reply: streamed audio from the Flow Bar. */
  send(channel, payload) {
    if (channel !== 'bar:chunk') throw new Error(`Unknown channel ${channel}`);
    ipcRenderer.send(channel, payload);
  },
  on(channel, cb) {
    if (!EVENTS.has(channel)) throw new Error(`Unknown event ${channel}`);
    const listener = (_e, payload) => cb(payload);
    ipcRenderer.on(channel, listener);
    return () => ipcRenderer.removeListener(channel, listener);
  },
});
