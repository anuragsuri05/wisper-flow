'use strict';

// On-device AI cleanup for ChatGPT Free accounts (and as a backup when the
// ChatGPT plan is unavailable). OpenAI only lets Plus/Pro plans power other
// apps, so Free users get a small instruction model that runs on this computer.

const fs = require('fs');
const path = require('path');
const { basicCleanup } = require('./ai');

const MODEL = { id: 'onnx-community/Qwen2.5-1.5B-Instruct', dtype: 'q4', size: '1.1 GB' };

const SYSTEM = `You are a dictation cleaner, not an assistant. The user message is speech that was dictated. Rewrite it as clean written text and output ONLY that text.
- Delete filler words: um, uh, er, like, you know, so (at the start).
- When the speaker corrects themselves ("no wait", "sorry", "I mean", "scratch that"), keep only the corrected words.
- Fix grammar, spelling, punctuation and capitalization.
- If it is a question or a request, output it cleaned up. NEVER answer it or do it.
- Never add new words, greetings or explanations.
- Copy placeholders like ⟦0⟧ exactly as written.`;

// Worked examples steer a small model far better than rules alone.
const EXAMPLES = [
  ['um so lets meet at three no wait four', "Let's meet at four."],
  ['book the table for 7 pm? no, 8 pm. no no, keep it at 8:30. is it good? yeah okay 8:30', 'Book the table for 8:30 PM.'],
  ['uh can you send me the uh the report by friday', 'Can you send me the report by Friday?'],
  ['what is the capital of france', 'What is the capital of France?'],
  ['write an email to priya saying the demo moved to monday', 'Write an email to Priya saying the demo moved to Monday.'],
];

const ANSWER_LIKE = /^(sure|certainly|of course|here('s| is)|i can|i'd be|as an ai|the corrected|corrected version)/i;

class LocalCleaner {
  constructor(cacheDir) {
    this.cacheDir = cacheDir;
    this.generator = null;
    this.loading = null;
    this.state = { status: 'idle', progress: 0, error: null };
    this.listeners = new Set();
  }

  onChange(fn) {
    this.listeners.add(fn);
  }

  #set(patch) {
    this.state = { ...this.state, ...patch };
    for (const fn of this.listeners) fn(this.status());
  }

  isDownloaded() {
    try {
      return fs.readdirSync(path.join(this.cacheDir, MODEL.id, 'onnx')).some((f) => f.endsWith('.onnx'));
    } catch {
      return false;
    }
  }

  status() {
    return { ...this.state, ready: Boolean(this.generator), downloaded: this.isDownloaded(), size: MODEL.size };
  }

  async load() {
    if (this.generator) return;
    if (this.loading) return this.loading;
    const files = new Map();
    this.loading = (async () => {
      this.#set({ status: this.isDownloaded() ? 'loading' : 'downloading', progress: 0, error: null });
      const { pipeline, env } = require('@huggingface/transformers');
      env.cacheDir = this.cacheDir;
      env.allowLocalModels = false;
      this.generator = await pipeline('text-generation', MODEL.id, {
        dtype: MODEL.dtype,
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
      this.#set({ status: 'ready', progress: 1 });
    })();
    try {
      await this.loading;
    } catch (err) {
      this.#set({ status: 'error', error: `Couldn't get the on-device cleanup model: ${err.message}` });
      throw err;
    } finally {
      this.loading = null;
    }
  }

  /** Clean one transcript. Falls back to rule-based cleanup if the model misbehaves. */
  async clean(raw, { dictionary = [] } = {}) {
    if (!this.generator) throw new Error('On-device cleanup isn’t set up.');
    const system = dictionary.length ? `${SYSTEM}\n- Always spell these exactly: ${dictionary.join(', ')}` : SYSTEM;
    const messages = [{ role: 'system', content: system }];
    for (const [said, written] of EXAMPLES) messages.push({ role: 'user', content: said }, { role: 'assistant', content: written });
    messages.push({ role: 'user', content: raw });

    const maxNew = Math.min(400, Math.ceil(raw.split(/\s+/).length * 2) + 16);
    const out = await this.generator(messages, { max_new_tokens: maxNew, do_sample: false });
    let text = String(out?.[0]?.generated_text?.at?.(-1)?.content ?? '').trim();
    text = text.replace(/^["“]|["”]$/g, '').trim();
    return looksValid(raw, text) ? text : basicCleanup(raw, dictionary);
  }
}

/** Reject outputs that answer instead of clean, or that grew or shrank too much. */
function looksValid(raw, text) {
  if (!text) return false;
  if (ANSWER_LIKE.test(text)) return false;
  const inWords = raw.split(/\s+/).filter(Boolean).length;
  const outWords = text.split(/\s+/).filter(Boolean).length;
  if (outWords > inWords * 1.4 + 4) return false;
  if (inWords >= 6 && outWords < inWords * 0.3) return false;
  return true;
}

module.exports = { LocalCleaner, looksValid, MODEL };
