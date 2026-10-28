'use strict';

// The floating pill: records the mic as 16 kHz mono WAV, shows a live level
// meter, and hands the audio to the main process when dictation stops.

const SAMPLE_RATE = 16000;
const BARS = 13;

const pill = document.getElementById('pill');
const meter = document.getElementById('meter');
const msgEl = document.getElementById('msg');
const hintEl = document.getElementById('hint');

for (let i = 0; i < BARS; i++) meter.appendChild(document.createElement('b'));
const barEls = [...meter.children];

let rec = null; // active recording
let starting = null; // { stop?: true, cancel?: true } while the mic is opening
let flashTimer = null;

function setState(state, message = '') {
  clearTimeout(flashTimer);
  pill.dataset.state = state;
  msgEl.textContent = message;
  if (state === 'done' || state === 'error' || state === 'info') {
    flashTimer = setTimeout(() => setState('idle'), state === 'error' ? 4000 : 1600);
  }
}

// ---------- sounds ----------

function blip(freq, sounds) {
  if (!sounds) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.13);
    osc.onended = () => ctx.close();
  } catch {
    /* sound is optional */
  }
}

// ---------- recording ----------

async function start({ maxMs, sounds, mode = 'hold' }) {
  if (rec || starting) return;
  starting = {};
  pill.dataset.mode = mode;
  setState('listening');
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    });
  } catch (err) {
    starting = null;
    setState('error', 'Microphone unavailable');
    await window.bwf.call('bar:failed', err.message);
    return;
  }
  blip(880, sounds);

  const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.6;
  // 1024 frames = 64 ms per callback (was 256 ms): the tail after release is captured
  // more completely, and audio can be streamed to the app while you're still talking
  const processor = ctx.createScriptProcessor(1024, 1, 1);
  const chunks = [];
  let outgoing = [];
  let peak = 0;
  processor.onaudioprocess = (e) => {
    const data = new Float32Array(e.inputBuffer.getChannelData(0));
    chunks.push(data);
    outgoing.push(data);
    for (let i = 0; i < data.length; i += 16) peak = Math.max(peak, Math.abs(data[i]));
    if (rec) rec.peak = peak;
    // stream ~250 ms at a time so the app can transcribe while you're still talking
    if (outgoing.length >= 4) flush();
  };
  const flush = () => {
    if (!outgoing.length) return;
    window.bwf.send('bar:chunk', concat(outgoing));
    outgoing = [];
  };
  source.connect(analyser);
  source.connect(processor);
  processor.connect(ctx.destination); // required for onaudioprocess to fire; output stays silent

  rec = { stream, ctx, processor, chunks, flush, peak: 0, startedAt: performance.now(), sounds, raf: 0, timer: 0 };

  const bins = new Uint8Array(analyser.frequencyBinCount);
  const draw = () => {
    analyser.getByteFrequencyData(bins);
    // voice energy lives in the lower bins; spread it across the bars, tallest in the middle
    for (let i = 0; i < BARS; i++) {
      const v = bins[2 + i * 3] / 255;
      const centre = 1 - Math.abs(i - (BARS - 1) / 2) / BARS;
      barEls[i].style.height = `${Math.max(3, Math.round(v * 20 * (0.5 + centre * 0.7)))}px`;
    }
    rec.raf = requestAnimationFrame(draw);
  };
  draw();
  rec.timer = setTimeout(() => stop(), maxMs);

  // the key may have been released (or Esc pressed) while the mic was opening
  const pending = starting;
  starting = null;
  if (pending.cancel) cancel({ quiet: true });
  else if (pending.stop) stop();
}

async function teardown() {
  const r = rec;
  rec = null;
  if (!r) return null;
  cancelAnimationFrame(r.raf);
  clearTimeout(r.timer);
  r.processor.onaudioprocess = null;
  r.stream.getTracks().forEach((t) => t.stop());
  await r.ctx.close();
  return r;
}

function concat(parts) {
  const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

async function stop() {
  if (starting) {
    starting.stop = true;
    return;
  }
  if (!rec) {
    window.bwf.call('bar:audio', {}).catch(() => {}); // nothing recorded: let the app reset
    setState('idle');
    return;
  }
  setState('processing');
  await new Promise((r) => setTimeout(r, 250)); // keep listening briefly so the last word isn't clipped
  rec?.flush();
  const r = await teardown();
  if (!r) return;
  blip(560, r.sounds);
  const durationMs = Math.round(performance.now() - r.startedAt);
  const wav = encodeWav(r.chunks, SAMPLE_RATE);
  try {
    const res = await window.bwf.call('bar:audio', { wav, durationMs, peak: r.peak });
    if (res.status === 'pasted') setState('done', res.message);
    else if (res.status === 'copied') setState('info', res.message);
    else if (res.status === 'empty') setState('info', res.message);
    else setState('error', res.message);
  } catch (err) {
    setState('error', err.message);
  }
}

async function cancel({ quiet = false } = {}) {
  if (starting) {
    starting.cancel = true;
    return;
  }
  await teardown();
  if (quiet) setState('idle');
  else setState('info', 'Cancelled');
}

// 16-bit PCM WAV, mono
function encodeWav(chunks, rate) {
  const length = chunks.reduce((n, c) => n + c.length, 0);
  const buf = new ArrayBuffer(44 + length * 2);
  const v = new DataView(buf);
  const str = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
  str(0, 'RIFF');
  v.setUint32(4, 36 + length * 2, true);
  str(8, 'WAVE');
  str(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, rate, true);
  v.setUint32(28, rate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  str(36, 'data');
  v.setUint32(40, length * 2, true);
  let o = 44;
  for (const c of chunks) {
    for (let i = 0; i < c.length; i++, o += 2) {
      const s = Math.max(-1, Math.min(1, c[i]));
      v.setInt16(o, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  }
  return buf;
}

// ---------- wiring ----------

function configure({ pttLabel }) {
  hintEl.textContent = pttLabel ? `Click or hold ${pttLabel} to dictate` : 'Click to dictate';
}

window.bwf.on('bar:command', (cmd) => {
  if (cmd.type === 'start') {
    if (cmd.pttLabel !== undefined) configure(cmd);
    start(cmd);
  } else if (cmd.type === 'stop') stop();
  else if (cmd.type === 'cancel') cancel(cmd);
  else if (cmd.type === 'mode') pill.dataset.mode = cmd.mode;
  else if (cmd.type === 'config') configure(cmd);
  else if (cmd.type === 'flash') {
    if (pill.dataset.state === 'listening' || pill.dataset.state === 'processing') return;
    setState(cmd.kind === 'error' ? 'error' : 'info', cmd.message);
  }
});

window.bwf.call('bar:ready').then(configure).catch(() => {});

pill.addEventListener('mouseenter', () => window.bwf.call('bar:hover', true));
pill.addEventListener('mouseleave', () => window.bwf.call('bar:hover', false));
document.getElementById('cancel').addEventListener('click', (e) => {
  e.stopPropagation();
  window.bwf.call('bar:cancel');
});
document.getElementById('stop').addEventListener('click', (e) => {
  e.stopPropagation();
  window.bwf.call('bar:click');
});
pill.addEventListener('click', () => {
  if (pill.dataset.state === 'idle' || pill.dataset.state === 'listening') window.bwf.call('bar:click');
});
