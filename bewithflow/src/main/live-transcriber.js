'use strict';

// Transcribes while you're still talking. Audio arrives in small chunks; when
// there's a natural pause after a few seconds of speech, that stretch is sent to
// Whisper in the background. When you release the key only the last few seconds
// are left to transcribe, instead of the whole recording.

const RATE = 16000;
const FRAME = 320; // 20 ms

class LiveTranscriber {
  /**
   * @param {object} o
   * @param {(samples: Float32Array) => Promise<string>} o.transcribe
   * @param {number} [o.minSegmentSec]  don't cut before this much audio
   * @param {number} [o.pauseMs]        silence that counts as a pause
   * @param {number} [o.maxSegmentSec]  force a cut (at the quietest point) after this long
   * @param {number} [o.voiceRms]       frame energy that counts as speech
   */
  constructor({ transcribe, minSegmentSec = 4, pauseMs = 300, maxSegmentSec = 24, voiceRms = 0.012 }) {
    this.transcribe = transcribe;
    this.minSegment = minSegmentSec * RATE;
    this.pauseMs = pauseMs;
    this.maxSegment = maxSegmentSec * RATE;
    this.voiceRms = voiceRms;

    this.buf = new Float32Array(RATE * 30);
    this.len = 0;
    this.segStart = 0; // first sample not yet sent to Whisper
    this.scanned = 0; // samples analysed into frames
    this.frameRms = []; // per 20 ms frame since the start
    this.silentRun = 0;
    this.voicedInSegment = 0;

    this.parts = [];
    this.chain = Promise.resolve();
    this.failed = null;
    this.cancelled = false;
    this.segments = 0;
  }

  push(chunk) {
    if (this.cancelled) return;
    const data = chunk instanceof Float32Array ? chunk : new Float32Array(chunk);
    if (this.len + data.length > this.buf.length) {
      const grown = new Float32Array(Math.max(this.buf.length * 2, this.len + data.length));
      grown.set(this.buf.subarray(0, this.len));
      this.buf = grown;
    }
    this.buf.set(data, this.len);
    this.len += data.length;
    this.#scan();
  }

  #scan() {
    while (this.scanned + FRAME <= this.len) {
      let sum = 0;
      for (let i = this.scanned; i < this.scanned + FRAME; i++) sum += this.buf[i] * this.buf[i];
      const rms = Math.sqrt(sum / FRAME);
      this.frameRms.push(rms);
      this.scanned += FRAME;
      if (rms >= this.voiceRms) {
        this.silentRun = 0;
        this.voicedInSegment++;
      } else this.silentRun++;

      const pending = this.scanned - this.segStart;
      if (pending >= this.minSegment && this.silentRun >= this.#pauseFramesFor() && this.voicedInSegment > 10) {
        // cut in the middle of the pause so no word is split
        this.#commit(this.scanned - Math.floor(this.silentRun / 2) * FRAME);
      } else if (pending >= this.maxSegment) {
        this.#commit(this.#quietestCut());
      }
    }
  }

  /** Only a real pause between phrases counts; shorter gaps fall between words and splitting there costs accuracy. */
  #pauseFramesFor() {
    return Math.ceil(((this.pauseMs / 1000) * RATE) / FRAME);
  }

  /** Quietest frame in the last 2 s of the pending audio. */
  #quietestCut() {
    const lastFrame = this.frameRms.length - 1;
    const from = Math.max(Math.ceil(this.segStart / FRAME), lastFrame - 100);
    let best = lastFrame;
    for (let f = from; f <= lastFrame; f++) if (this.frameRms[f] < this.frameRms[best]) best = f;
    return (best + 1) * FRAME;
  }

  #commit(end) {
    const start = this.segStart;
    if (end <= start) return;
    const voiced = this.voicedInSegment;
    this.segStart = end;
    this.voicedInSegment = 0;
    this.silentRun = 0;
    if (voiced < 8) return; // nothing but silence or a click: don't let Whisper invent words
    const samples = this.buf.slice(start, end);
    const index = this.segments++;
    this.chain = this.chain.then(async () => {
      if (this.cancelled || this.failed) return;
      try {
        this.parts[index] = String(await this.transcribe(samples)).trim();
      } catch (err) {
        this.failed = err;
      }
    });
  }

  /** Transcribe whatever is left and return the full text. */
  async finish() {
    this.#scan();
    // leftover partial frame
    if (this.len > this.scanned) {
      this.scanned = this.len;
    }
    this.#commit(this.len);
    await this.chain;
    if (this.failed) throw this.failed;
    const { isNoise } = require('./ai');
    return this.parts
      .filter((t) => t && !isNoise(t))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** The whole recording, for a fallback full transcription. */
  samples() {
    return this.buf.slice(0, this.len);
  }

  cancel() {
    this.cancelled = true;
  }
}

module.exports = { LiveTranscriber };
