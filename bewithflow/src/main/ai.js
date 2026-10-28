'use strict';

// Voice -> clean text.
//
//   1. On-device Whisper turns the recording into a raw transcript.
//   2. The user's ChatGPT account cleans it with the master prompt.
//   3. Without plan usage (ChatGPT Free) or when ChatGPT fails (limit reached,
//      offline...), a small on-device AI model cleans it instead.
//   4. If that isn't downloaded, a rule-based cleanup still gets the words pasted.

const { buildMasterPrompt, wrapTranscript } = require('./prompt');
const { styleInstruction, applyStyleLocally } = require('./styles');
const { protect, restore } = require('./snippets');

// Whisper's typical output for silence or background noise.
const NOISE = /^[\s.,!?-]*$|^\s*[[(].*[\])]\s*$|^\s*(thank you|thanks for watching|you)[.!]?\s*$/i;

function isNoise(text) {
  const t = String(text || '');
  return NOISE.test(t) || NOISE.test(t.replace(FILLERS, '')); // fillers only ("um, uh") is nothing to clean
}

const FILLERS = /\b(?:u+m+|u+h+|e+r+m*|a+h+|h+m+|mhm)\b[,.]?\s*/gi;

/** Minimal offline cleanup: fillers, stutters, dictionary spellings, capitals, end punctuation. */
function basicCleanup(raw, dictionary = []) {
  let t = ` ${String(raw || '')} `;
  t = t.replace(FILLERS, ' ');
  t = t.replace(/\b(\w+)(\s+\1\b)+/gi, '$1'); // "the the" -> "the"
  for (const word of dictionary) {
    const w = String(word).trim();
    if (!w) continue;
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\p{L}\\p{N}])`, 'giu');
    t = t.replace(pattern, w);
  }
  t = t.replace(/\s+([,.!?;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  t = t.replace(/^[,.;:\s]+/, '');
  if (!t) return '';
  t = t[0].toUpperCase() + t.slice(1);
  t = t.replace(/([.!?]\s+)(\p{Ll})/gu, (_, p, c) => p + c.toUpperCase());
  if (!/[.!?…:"')\]]$/.test(t)) t += '.';
  return t;
}

// Strip anything the model wraps around the answer despite instructions.
function tidy(text) {
  let t = String(text).trim();
  t = t.replace(/^```[a-z]*\n?|\n?```$/gi, '').trim();
  t = t.replace(/^<\/?transcript>|<\/?transcript>$/gi, '').trim();
  return t;
}

/**
 * @param {object} p
 * @param {(wav) => Promise<string>} p.transcribe   on-device speech-to-text
 * @param {null | ((args: {instructions: string, input: string}) => Promise<string>)} p.cleanup  ChatGPT plan; null without plan usage (e.g. ChatGPT Free)
 * @param {null | ((raw: string) => Promise<string>)} [p.localClean]  on-device AI cleanup, when downloaded
 * @param {'personal'|'work'|'email'|'other'} [p.category]  app category of the app being dictated into
 * @param {{trigger: string, expansion: string}[]} [p.snippets]
 * @returns {{ text, raw, provider: 'chatgpt'|'local-ai'|'local'|'none', warnings: string[], error?: Error }}
 */
async function processDictation({ wav, settings, dictionary = [], snippets = [], category = 'other', transcribe, cleanup, localClean = null }) {
  const raw = (await transcribe(wav)).trim();
  if (!raw || isNoise(raw)) return { text: '', raw, provider: 'none', warnings: [] };

  const { text: spoken, slots } = protect(raw, snippets);
  const styleKey = settings.styles?.[category];
  const warnings = [];
  let error;

  if (cleanup) {
    const instructions = buildMasterPrompt({
      level: settings.cleanupLevel,
      style: styleInstruction(category, styleKey),
      dictionary,
      customPrompt: settings.customPrompt,
    });
    try {
      const text = restore(tidy(await cleanup({ instructions, input: wrapTranscript(spoken) })), slots);
      return { text, raw, provider: 'chatgpt', warnings };
    } catch (err) {
      error = err;
      warnings.push(err.message);
    }
  }
  // on-device paths apply the style themselves, before snippets go back in
  const finish = (t) => restore(applyStyleLocally(t, styleKey), slots);
  if (localClean) {
    try {
      return { text: finish(tidy(await localClean(spoken))), raw, provider: 'local-ai', warnings, error };
    } catch (err) {
      warnings.push(err.message);
    }
  }
  return { text: finish(basicCleanup(spoken, dictionary)), raw, provider: 'local', warnings, error };
}

module.exports = { processDictation, basicCleanup, isNoise, tidy };
