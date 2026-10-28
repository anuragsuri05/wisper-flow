'use strict';

// Calls the Responses API on the user's ChatGPT plan with the OAuth access token.
// Plan-usage rules: store:false, stream:true, instructions instead of system
// messages, no temperature. Success only on `response.completed`.
// Docs: https://developers.openai.com/siwc/token-sharing-open-source/models-and-inference

const API = 'https://api.openai.com/v1';
const TIMEOUT_MS = 30_000;
const USAGE_URL = 'https://chatgpt.com/settings/usage';

class ChatGPTError extends Error {
  /** kind: 'auth' | 'limit' | 'ineligible' | 'unsupported' | 'unavailable' | 'network' | 'failed' */
  constructor(message, kind, code) {
    super(message);
    this.kind = kind;
    this.code = code;
  }
}

function errorFor(status, body) {
  const code = body?.error?.code || '';
  const detail = body?.error?.message || body?.detail || '';
  switch (code) {
    case 'subscription_sharing_usage_limit_exceeded':
      return new ChatGPTError('You reached the ChatGPT usage limit for bewithflow. Raise it in ChatGPT Settings → Usage.', 'limit', code);
    case 'subscription_sharing_user_not_eligible':
      return new ChatGPTError('Your ChatGPT plan can’t be used in other apps. bewithflow needs ChatGPT Plus or Pro.', 'ineligible', code);
    case 'subscription_sharing_usage_unavailable':
    case 'subscription_sharing_user_unavailable':
      return new ChatGPTError('ChatGPT couldn’t check your plan right now. Try again in a moment.', 'unavailable', code);
    case 'subscription_sharing_unsupported_capability':
      return new ChatGPTError(`ChatGPT doesn’t support this request${body?.error?.param ? ` (${body.error.param})` : ''}. Pick another model in Settings.`, 'unsupported', code);
    case 'subscription_sharing_invalid_user':
      return new ChatGPTError('ChatGPT couldn’t verify your account. Sign in again.', 'auth', code);
    default:
  }
  if (status === 401) return new ChatGPTError('ChatGPT didn’t accept your sign-in. Sign in again.', 'auth', code);
  if (status === 403) return new ChatGPTError(`ChatGPT blocked this request${detail ? `: ${String(detail).slice(0, 140)}` : ''}.`, 'ineligible', code);
  if (status === 404) return new ChatGPTError('That ChatGPT model isn’t available to your account. Pick another in Settings.', 'unsupported', code);
  if (status === 429) return new ChatGPTError('ChatGPT is rate limiting requests. Try again shortly.', 'limit', code);
  if (status >= 500) return new ChatGPTError('ChatGPT is having problems right now.', 'unavailable', code);
  return new ChatGPTError(`ChatGPT request failed (${status}${detail ? `: ${String(detail).slice(0, 140)}` : ''}).`, 'failed', code);
}

async function readJson(res) {
  const text = await res.text().catch(() => '');
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return { detail: text };
  }
}

/** The models this ChatGPT account may use, in server order: [{slug, name}] */
async function listModels({ token, fetchImpl = fetch }) {
  let res;
  try {
    res = await fetchImpl(`${API}/models`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(15_000) });
  } catch {
    throw new ChatGPTError('Can’t reach ChatGPT. Check your internet connection.', 'network');
  }
  if (!res.ok) throw errorFor(res.status, await readJson(res));
  const body = await res.json();
  const list = Array.isArray(body.models) ? body.models : Array.isArray(body.data) ? body.data : [];
  return list
    .filter((m) => !m.visibility || m.visibility === 'list')
    .map((m) => ({ slug: m.slug || m.id, name: m.display_name || m.slug || m.id }))
    .filter((m) => m.slug);
}

/** Prefer a fast model for cleanup; fall back to the account's first model. */
function pickDefaultModel(models) {
  if (!models.length) return '';
  const fast = models.find((m) => /mini|fast|instant|nano|lite/i.test(`${m.slug} ${m.name}`));
  return (fast || models[0]).slug;
}

/** Parse a Server-Sent Events byte stream into JSON events. */
async function* sseEvents(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    let idx;
    while ((idx = buffer.search(/\r?\n\r?\n/)) !== -1) {
      const raw = buffer.slice(0, idx);
      buffer = buffer.slice(idx).replace(/^\r?\n\r?\n/, '');
      const data = raw
        .split(/\r?\n/)
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trimStart())
        .join('\n');
      if (!data || data === '[DONE]') continue;
      try {
        yield JSON.parse(data);
      } catch {
        /* ignore keep-alives / partial junk */
      }
    }
  }
}

function textFromResponse(response) {
  const out = response?.output || [];
  return out
    .flatMap((item) => item.content || [])
    .filter((c) => c.type === 'output_text')
    .map((c) => c.text)
    .join('');
}

/** Run one cleanup on the ChatGPT plan. Resolves with the model's text. */
const STALL_MS = 12_000; // no data for this long mid-reply: give up and fall back

async function respond({ token, model, instructions, input, examples = [], extra = null, fetchImpl = fetch }) {
  // One controller for the whole exchange: an overall deadline, plus a stall timer that
  // resets on every chunk, so a reply that hangs halfway can't block the dictation.
  const controller = new AbortController();
  let reason = 'timeout';
  const overall = setTimeout(() => controller.abort(), TIMEOUT_MS);
  let stall = null;
  const touch = () => {
    clearTimeout(stall);
    stall = setTimeout(() => {
      reason = 'stall';
      controller.abort();
    }, STALL_MS);
  };
  try {
    return await respondInner({ token, model, instructions, input, examples, extra, fetchImpl, signal: controller.signal, touch });
  } catch (err) {
    if (controller.signal.aborted) {
      throw new ChatGPTError(reason === 'stall' ? 'ChatGPT stopped responding mid-answer.' : 'ChatGPT took too long to answer.', 'network');
    }
    throw err;
  } finally {
    clearTimeout(overall);
    clearTimeout(stall);
  }
}

async function respondInner({ token, model, instructions, input, examples, extra, fetchImpl, signal, touch }) {
  let res;
  touch();
  try {
    res = await fetchImpl(`${API}/responses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        model,
        instructions,
        input: [...examples, { role: 'user', content: input }],
        store: false,
        stream: true,
        ...(extra || {}),
      }),
      signal,
    });
  } catch (err) {
    if (signal.aborted) throw err;
    throw new ChatGPTError('Can’t reach ChatGPT. Check your internet connection.', 'network');
  }
  if (!res.ok) throw errorFor(res.status, await readJson(res));
  if (!res.body) throw new ChatGPTError('ChatGPT returned an empty response.', 'failed');

  let text = '';
  try {
    for await (const ev of sseEvents(res.body)) {
      touch();
      if (ev.type === 'response.output_text.delta') text += ev.delta || '';
      else if (ev.type === 'response.completed') return text || textFromResponse(ev.response);
      else if (ev.type === 'response.failed') throw errorFor(200, { error: ev.response?.error || {} });
      else if (ev.type === 'response.incomplete') throw new ChatGPTError('ChatGPT stopped before finishing.', 'failed');
      else if (ev.type === 'error') throw errorFor(200, { error: ev.error || ev });
    }
  } catch (err) {
    if (err instanceof ChatGPTError || signal.aborted) throw err;
    throw new ChatGPTError('The connection to ChatGPT dropped mid-answer.', 'network');
  }
  throw new ChatGPTError('ChatGPT ended the answer without completing it.', 'failed');
}

module.exports = { listModels, pickDefaultModel, respond, sseEvents, ChatGPTError, USAGE_URL };
