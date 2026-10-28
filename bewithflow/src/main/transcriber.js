'use strict';

// On-device speech-to-text with Whisper (transformers.js + ONNX Runtime).
// ChatGPT plan usage doesn't accept audio, so voice → text happens on this
// computer: private, free, works offline. Models download once, then load from disk.

const fs = require('fs');
const path = require('path');

const RATE = 16000;

const MODELS = {
  fast: { id: 'onnx-community/whisper-base', label: 'Fast', size: '78 MB' },
  accurate: { id: 'onnx-community/whisper-small', label: 'Accurate', size: '259 MB' },
};

const LANGUAGE_NAMES = {
  en: 'english',
  hi: 'hindi',
  es: 'spanish',
  fr: 'french',
  de: 'german',
  pt: 'portuguese',
  it: 'italian',
  ja: 'japanese',
  ko: 'korean',
  zh: 'chinese',
  ar: 'arabic',
};

/** 16-bit PCM mono WAV → Float32Array in [-1, 1] */
function decodeWav(buf) {
  buf = Buffer.from(buf);
  if (buf.toString('ascii', 0, 4) !== 'RIFF' || buf.toString('ascii', 8, 12) !== 'WAVE') throw new Error('Recording is not a WAV file.');
  let o = 12;
  while (o + 8 <= buf.length) {
    const id = buf.toString('ascii', o, o + 4);
    const size = buf.readUInt32LE(o + 4);
    if (id === 'data') {
      const end = Math.min(buf.length, o + 8 + size);
      const samples = new Float32Array(Math.floor((end - o - 8) / 2));
      for (let i = 0; i < samples.length; i++) samples[i] = buf.readInt16LE(o + 8 + i * 2) / 32768;
      return samples;
    }
    o += 8 + size + (size % 2);
  }
  throw new Error('Recording has no audio data.');
}

/** Whisper sometimes gets stuck repeating a word ("the the the …"). Keep at most 3 copies of any repeated word or short phrase. */
function collapseRepeats(text) {
  // Unicode-aware word boundaries (\b only understands Latin letters)
  const W = "[\\p{L}\\p{M}\\p{N}']+";
  const re = new RegExp(`(?<![\\p{L}\\p{M}\\p{N}])(${W}(?:\\s+${W}){0,2}?)(?:[\\s,.]+\\1(?![\\p{L}\\p{M}\\p{N}])){3,}`, 'gu');
  return text.replace(re, '$1 $1 $1');
}

class Transcriber {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this.loaded = null; // { key, asr }
    this.loading = null; // { key, promise }
    this.state = { model: null, status: 'idle', progress: 0, error: null };
    this.listeners = new Set();
    this.queue = Promise.resolve(); // one Whisper run at a time (live transcription overlaps them)
  }

  onChange(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  #set(patch) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.status());
  }

  isDownloaded(key) {
    const dir = path.join(this.cacheDir, MODELS[key].id, 'onnx');
    try {
      return fs.readdirSync(dir).filter((f) => f.endsWith('.onnx')).length >= 2;
    } catch {
      return false;
    }
  }

  status() {
    return {
      ...this.state,
      ready: Boolean(this.loaded),
      readyModel: this.loaded?.key || null,
      models: Object.fromEntries(Object.entries(MODELS).map(([k, m]) => [k, { ...m, downloaded: this.isDownloaded(k) }])),
    };
  }

  /** Download (first time) and load a model. Safe to call repeatedly. */
  async load(key) {
    if (!MODELS[key]) throw new Error(`Unknown speech model "${key}".`);
    if (this.loaded?.key === key) return;
    if (this.loading?.key === key) return this.loading.promise;

    const files = new Map();
    const promise = (async () => {
      this.#set({ model: key, status: this.isDownloaded(key) ? 'loading' : 'downloading', progress: 0, error: null });
      const { pipeline, env } = require('@huggingface/transformers');
      env.cacheDir = this.cacheDir;
      env.allowLocalModels = false;
      const asr = await pipeline('automatic-speech-recognition', MODELS[key].id, {
        dtype: 'q8',
        progress_callback: (p) => {
          if (p.status !== 'progress' || !p.total) return;
          files.set(p.file, { loaded: p.loaded, total: p.total });
          let loaded = 0;
          let total = 0;
          for (const f of files.values()) {
            loaded += f.loaded;
            total += f.total;
          }
          const progress = total ? Math.min(0.99, loaded / total) : 0;
          if (Math.floor(progress * 100) !== Math.floor(this.state.progress * 100)) this.#set({ progress });
        },
      });
      // warm-up: the first run after loading is slower, so pay that cost now, not on your first dictation
      await asr(new Float32Array(RATE / 2), { language: 'english', task: 'transcribe' }).catch(() => {});
      await this.queue;
      const previous = this.loaded;
      this.loaded = { key, asr };
      previous?.asr?.dispose?.().catch?.(() => {});
      this.#set({ status: 'ready', progress: 1 });
    })();

    this.loading = { key, promise };
    try {
      await promise;
    } catch (err) {
      this.#set({ status: 'error', error: `Couldn't get the speech model: ${err.message}` });
      throw err;
    } finally {
      if (this.loading?.promise === promise) this.loading = null;
    }
  }

  async transcribe(wav, opts = {}) {
    return this.transcribeSamples(decodeWav(wav), opts);
  }

  /** @param {Float32Array} audio 16 kHz mono samples */
  async transcribeSamples(audio, { language = 'en' } = {}) {
    if (!this.loaded) {
      if (this.loading) await this.loading.promise;
      else throw new Error('The speech engine isn’t set up yet. Download it in Settings → Speech engine.');
    }
    // cap output to what anyone could say in this time, so a stuck decoder can't run on for seconds
    const secs = Math.min(30, audio.length / RATE);
    const run = this.queue.then(() =>
      this.loaded.asr(audio, {
        language: LANGUAGE_NAMES[language] || 'english',
        task: 'transcribe',
        chunk_length_s: 30,
        stride_length_s: 5,
        max_new_tokens: Math.ceil(secs * 10) + 24,
      }),
    );
    this.queue = run.catch(() => {});
    const out = await run;
    // a capped decode can end mid-character; drop the broken bytes
    return collapseRepeats(String(out?.text ?? '').replace(/�/g, '').trim());
  }
}

module.exports = { Transcriber, decodeWav, MODELS, collapseRepeats };
