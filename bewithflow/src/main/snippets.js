'use strict';

// Snippets: say a trigger ("my calendly link") and the saved text is inserted.
// Before cleanup, spoken triggers become placeholders like ⟦0⟧ that the AI is
// told to keep, so long expansions are never rewritten. Afterwards the
// placeholders are swapped for the saved text.

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function triggerPattern(trigger) {
  const words = String(trigger).toLowerCase().match(/[\p{L}\p{N}']+/gu);
  if (!words) return null;
  // spoken triggers can pick up punctuation or extra spaces between words
  const body = words.map(esc).join(`[\\s,.!?;:"'-]+`);
  return new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, 'giu');
}

/** Replace spoken triggers with ⟦n⟧ placeholders. Longest trigger wins. */
function protect(raw, snippets = []) {
  const slots = [];
  let text = String(raw || '');
  const sorted = [...snippets].filter((s) => s.trigger && s.expansion).sort((a, b) => b.trigger.length - a.trigger.length);
  for (const s of sorted) {
    const re = triggerPattern(s.trigger);
    if (!re) continue;
    text = text.replace(re, () => {
      slots.push(s.expansion);
      return `⟦${slots.length - 1}⟧`;
    });
  }
  return { text, slots };
}

/** Swap placeholders back for the saved text; re-insert any the cleanup dropped. */
function restore(text, slots) {
  if (!slots.length) return text;
  const used = new Set();
  let out = String(text || '').replace(/⟦\s*(\d+)\s*⟧/g, (m, n) => {
    const i = Number(n);
    if (slots[i] === undefined) return m;
    used.add(i);
    return slots[i];
  });
  slots.forEach((exp, i) => {
    if (!used.has(i)) out = `${out}${out && !/\s$/.test(out) ? ' ' : ''}${exp}`;
  });
  return out;
}

module.exports = { protect, restore, triggerPattern };
