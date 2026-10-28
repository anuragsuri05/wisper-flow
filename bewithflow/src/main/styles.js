'use strict';

// Styles follow the app you dictate into: casual in WhatsApp, formal in email.
// The app is detected when dictation starts (name, bundle id and, for
// browsers, the window title so web apps like web.whatsapp.com count too).

const STYLES = {
  formal: {
    label: 'Formal.',
    desc: 'Caps + punctuation',
    instruction: 'STYLE: Formal. Use full sentence capitalization and complete punctuation.',
  },
  casual: {
    label: 'Casual',
    desc: 'Caps + less punctuation',
    instruction: 'STYLE: Casual. Capitalize sentences but keep punctuation light: no period after the final sentence, commas only where needed.',
  },
  veryCasual: {
    label: 'very casual',
    desc: 'No caps + less punctuation',
    instruction: 'STYLE: Very casual. Write everything in lowercase, use minimal punctuation and no period at the end, like a quick text message. Keep question marks.',
  },
  excited: {
    label: 'Excited!',
    desc: 'More exclamations',
    instruction: 'STYLE: Excited. Keep the same words, but end upbeat sentences with exclamation marks where it fits naturally.',
  },
};

const CATEGORIES = {
  personal: {
    label: 'Personal messages',
    apps: 'WhatsApp, Messages, Telegram, Signal, Instagram',
    styles: ['formal', 'casual', 'veryCasual'],
    default: 'casual',
    sample: "Hey, are you free for lunch tomorrow? Let's do 12 if that works for you.",
  },
  work: {
    label: 'Work messages',
    apps: 'Slack, Teams, Google Chat, Discord, LinkedIn',
    styles: ['formal', 'casual', 'excited'],
    default: 'casual',
    sample: "Hey team, the build is green. Let's ship the update this afternoon.",
  },
  email: {
    label: 'Email',
    apps: 'Mail, Outlook, Gmail, Superhuman, Spark',
    styles: ['formal', 'casual', 'excited'],
    default: 'formal',
    sample: 'Hi Sam,\n\nThanks for sending the proposal. I reviewed it and it looks great.\n\nBest,\nLaksh',
    extra: 'This is an email. When the speaker dictates a greeting or sign-off, put each on its own line with a blank line around the body.',
  },
  other: {
    label: 'Other',
    apps: 'Notes, documents, browsers and everything else',
    styles: ['formal', 'casual', 'excited'],
    default: 'formal',
    sample: 'Remember to book flights for the conference. Check prices on Friday.',
  },
};

const DEFAULT_STYLES = Object.fromEntries(Object.entries(CATEGORIES).map(([k, c]) => [k, c.default]));

const PERSONAL = /whatsapp|^messages$|com\.apple\.mobilesms|imessage|telegram|signal|messenger|instagram|wechat|\bline\b|viber|snapchat|beeper/i;
const WORK = /slack|microsoft teams|\bteams\b|google chat|discord|linkedin|zoom|webex|mattermost|lark|chatwork/i;
const EMAIL = /^mail$|com\.apple\.mail|outlook|gmail|superhuman|\bspark\b|airmail|missive|thunderbird|proton ?mail|hey\.com|mimestream/i;
const BROWSER = /safari|chrome|chromium|firefox|arc|edge|brave|opera|vivaldi|orion|zen/i;

/** @param {{name?: string, bundle?: string, title?: string} | null} front */
function categorize(front) {
  if (!front) return 'other';
  const id = `${front.name || ''} ${front.bundle || ''}`;
  const test = (s) => (PERSONAL.test(s) ? 'personal' : WORK.test(s) ? 'work' : EMAIL.test(s) ? 'email' : null);
  for (const part of [front.name || '', front.bundle || '']) {
    const hit = test(part.trim());
    if (hit) return hit;
  }
  if (BROWSER.test(id) && front.title) return test(front.title) || 'other';
  return 'other';
}

/** Deterministic style pass used for on-device cleanup and for the style previews. */
function applyStyleLocally(text, style) {
  let t = String(text || '');
  if (!t) return t;
  if (style === 'casual' || style === 'veryCasual') t = t.replace(/\.\s*$/, '');
  if (style === 'veryCasual') t = t.toLowerCase();
  if (style === 'excited') t = t.replace(/\.(\s*)$/, '!$1');
  return t;
}

function styleInstruction(category, style) {
  const cat = CATEGORIES[category] || CATEGORIES.other;
  const s = STYLES[style] || STYLES[cat.default];
  return [`WHERE: the speaker is writing in ${cat.label.toLowerCase()}.`, s.instruction, cat.extra].filter(Boolean).join(' ');
}

module.exports = { STYLES, CATEGORIES, DEFAULT_STYLES, categorize, applyStyleLocally, styleInstruction };
