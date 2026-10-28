'use strict';

// Word-level diff between the raw transcript and the cleaned text, used to draw
// proofreader's marks: removed words struck through, added words underlined.

(function (root) {
  const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

  /** @returns {{type: 'same'|'del'|'ins', word: string}[] | null} */
  function wordDiff(raw, clean) {
    const a = String(raw || '').split(/\s+/).filter(Boolean);
    const b = String(clean || '').split(/\s+/).filter(Boolean);
    if (!a.length || !b.length || a.length * b.length > 4_000_000) return null;
    const an = a.map(norm);
    const bn = b.map(norm);
    // LCS table, filled from the end so we can walk forward
    const dp = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
    for (let i = a.length - 1; i >= 0; i--) {
      for (let j = b.length - 1; j >= 0; j--) {
        dp[i][j] = an[i] && an[i] === bn[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
    const out = [];
    let i = 0;
    let j = 0;
    while (i < a.length && j < b.length) {
      if (an[i] && an[i] === bn[j]) {
        out.push({ type: 'same', word: b[j] });
        i++;
        j++;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        out.push({ type: 'del', word: a[i++] });
      } else {
        out.push({ type: 'ins', word: b[j++] });
      }
    }
    while (i < a.length) out.push({ type: 'del', word: a[i++] });
    while (j < b.length) out.push({ type: 'ins', word: b[j++] });
    return out;
  }

  const api = { wordDiff };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.bwfDiff = api;
})(typeof window !== 'undefined' ? window : globalThis);
