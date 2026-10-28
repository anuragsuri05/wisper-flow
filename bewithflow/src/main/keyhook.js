'use strict';

// Runs the native macOS key helper (native/mac/keyhook.swift): push-to-talk on
// any key chord (Fn by default), fast native paste, and frontmost-app lookup.
// The helper is compiled on first run if the binary is missing.

const { spawn, execFile } = require('child_process');
const { EventEmitter } = require('events');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const SOURCE = path.join(ROOT, 'native', 'mac', 'keyhook.swift');

function binaryPath(resourcesPath) {
  const packaged = resourcesPath && path.join(resourcesPath, 'bwf-keyhook');
  if (packaged && fs.existsSync(packaged)) return packaged;
  return path.join(ROOT, 'native', 'mac', 'build', 'bwf-keyhook');
}

function build(out) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFile('swiftc', ['-O', '-swift-version', '5', SOURCE, '-o', out], { timeout: 180_000 }, (err, _o, stderr) =>
      err ? reject(new Error(`Couldn't build the key helper: ${stderr || err.message}`)) : resolve(out),
    );
  });
}

class KeyHook extends EventEmitter {
  constructor({ resourcesPath, packaged = false } = {}) {
    super();
    this.packaged = packaged;
    this.bin = binaryPath(resourcesPath);
    this.proc = null;
    this.status = process.platform === 'darwin' ? 'starting' : 'unsupported'; // starting | ready | need_permission | error | unsupported
    this.error = null;
    this.chord = 'fn';
    this.waiters = { front: [], pasted: [] };
    this.stopped = false;
  }

  get supported() {
    return process.platform === 'darwin';
  }

  async start(chord) {
    if (!this.supported) return;
    this.chord = chord || this.chord;
    this.stopped = false;
    try {
      if (!fs.existsSync(this.bin)) {
        // release builds ship the helper; only development builds compile it on the fly
        if (this.packaged) throw new Error('The key helper is missing from this installation. Reinstall bewithflow.');
        await build(this.bin);
      }
    } catch (err) {
      this.#status('error', err.message);
      return;
    }
    this.#spawn();
  }

  #spawn() {
    const proc = spawn(this.bin, ['--chord', this.chord], { stdio: ['pipe', 'pipe', 'ignore'] });
    this.proc = proc;
    let buf = '';
    proc.stdout.on('data', (d) => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) !== -1) {
        const line = buf.slice(0, i).trim();
        buf = buf.slice(i + 1);
        if (line) this.#onLine(line);
      }
    });
    proc.on('exit', () => {
      if (this.proc === proc) this.proc = null;
      if (!this.stopped) setTimeout(() => !this.stopped && this.#spawn(), 1500); // keep it alive
    });
    proc.on('error', (err) => this.#status('error', err.message));
  }

  #status(s, error = null) {
    this.status = s;
    this.error = error;
    this.emit('status', { status: s, error });
  }

  #onLine(line) {
    let msg;
    try {
      msg = JSON.parse(line);
    } catch {
      return;
    }
    switch (msg.e) {
      case 'ready':
        return this.#status('ready');
      case 'need_permission':
        return this.#status('need_permission');
      case 'front':
        this.waiters.front.splice(0).forEach((fn) => fn({ name: msg.name || '', bundle: msg.bundle || '', title: msg.title || '' }));
        return;
      case 'pasted':
        this.waiters.pasted.splice(0).forEach((fn) => fn(true));
        return;
      default:
        this.emit('key', msg.e); // ptt_down | ptt_up | ptt_space | ptt_esc | ptt_broken
    }
  }

  #send(cmd) {
    if (!this.proc) return false;
    try {
      this.proc.stdin.write(`${cmd}\n`);
      return true;
    } catch {
      return false;
    }
  }

  setChord(chord) {
    this.chord = chord;
    this.#send(`chord ${chord}`);
  }

  /** Frontmost app {name, bundle, title}, or null if the helper isn't running. */
  front(timeoutMs = 400) {
    return new Promise((resolve) => {
      if (!this.#send('front')) return resolve(null);
      const timer = setTimeout(() => resolve(null), timeoutMs);
      this.waiters.front.push((v) => {
        clearTimeout(timer);
        resolve(v);
      });
    });
  }

  /** Native Cmd+V. Resolves false if the helper isn't available. */
  paste(timeoutMs = 600) {
    return new Promise((resolve) => {
      if (this.status !== 'ready' || !this.#send('paste')) return resolve(false);
      const timer = setTimeout(() => resolve(false), timeoutMs);
      this.waiters.pasted.push((v) => {
        clearTimeout(timer);
        resolve(v);
      });
    });
  }

  stop() {
    this.stopped = true;
    this.#send('quit');
    this.proc?.kill();
    this.proc = null;
  }
}

module.exports = { KeyHook, build, binaryPath };
