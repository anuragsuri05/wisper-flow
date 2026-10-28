'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const { processDictation, basicCleanup, isNoise, tidy } = require('../src/main/ai');
const { buildMasterPrompt, exampleTurns } = require('../src/main/prompt');
const { Store } = require('../src/main/store');
const { ChatGPTAuth } = require('../src/main/chatgpt-auth');
const { respond, listModels, pickDefaultModel } = require('../src/main/chatgpt');
const { decodeWav, collapseRepeats } = require('../src/main/transcriber');
const { looksValid } = require('../src/main/local-cleaner');
const { LiveTranscriber } = require('../src/main/live-transcriber');
const { categorize, applyStyleLocally, styleInstruction } = require('../src/main/styles');
const { protect, restore } = require('../src/main/snippets');
const { wordDiff } = require('../src/renderer/hub/diff');
const { markPng } = require('../src/main/icon');

const settings = { cleanupLevel: 'standard', tone: 'auto', customPrompt: '' };

// ---------- pipeline ----------

test('ChatGPT cleans the on-device transcript with the master prompt', async () => {
  let seen;
  const r = await processDictation({
    wav: Buffer.alloc(4),
    settings,
    dictionary: ['Laksh'],
    transcribe: async () => 'um so lets meet at three no wait four',
    cleanup: async (args) => ((seen = args), "Let's meet at 4."),
  });
  assert.equal(r.text, "Let's meet at 4.");
  assert.equal(r.provider, 'chatgpt');
  assert.match(seen.instructions, /Self-corrections/);
  assert.match(seen.instructions, /Laksh/);
  assert.match(seen.input, /^<transcript>\num so lets meet/);
});

test('falls back to basic on-device cleanup when ChatGPT fails', async () => {
  const err = Object.assign(new Error('You reached the ChatGPT usage limit'), { kind: 'limit' });
  const r = await processDictation({
    wav: Buffer.alloc(4),
    settings,
    dictionary: [],
    transcribe: async () => 'uh send the the invoice',
    cleanup: async () => {
      throw err;
    },
  });
  assert.equal(r.text, 'Send the invoice.');
  assert.equal(r.provider, 'local');
  assert.equal(r.error, err);
});

test('without plan usage, basic cleanup runs and no ChatGPT call is made', async () => {
  const r = await processDictation({ wav: Buffer.alloc(4), settings, dictionary: [], transcribe: async () => 'hello there', cleanup: null });
  assert.equal(r.text, 'Hello there.');
  assert.equal(r.provider, 'local');
});

test('ChatGPT Free: on-device AI cleans up; ChatGPT failure also falls back to it', async () => {
  const free = await processDictation({
    wav: Buffer.alloc(4),
    settings,
    dictionary: [],
    transcribe: async () => 'um lets ship it',
    cleanup: null,
    localClean: async (raw) => (raw === 'um lets ship it' ? "Let's ship it." : 'wrong'),
  });
  assert.equal(free.text, "Let's ship it.");
  assert.equal(free.provider, 'local-ai');

  const limited = await processDictation({
    wav: Buffer.alloc(4),
    settings,
    dictionary: [],
    transcribe: async () => 'um lets ship it',
    cleanup: async () => {
      throw Object.assign(new Error('limit'), { kind: 'limit' });
    },
    localClean: async () => "Let's ship it.",
  });
  assert.equal(limited.provider, 'local-ai');
  assert.equal(limited.error.kind, 'limit');

  const broken = await processDictation({
    wav: Buffer.alloc(4),
    settings,
    dictionary: [],
    transcribe: async () => 'um lets ship it',
    cleanup: null,
    localClean: async () => {
      throw new Error('model crashed');
    },
  });
  assert.equal(broken.provider, 'local');
  assert.equal(broken.text, 'Lets ship it.');
});

test('on-device output guard rejects answers and runaway text', () => {
  assert.equal(looksValid('what time is the meeting', 'What time is the meeting?'), true);
  assert.equal(looksValid('what time is the meeting', 'Sure! The meeting is at 3 PM.'), false);
  assert.equal(looksValid('fix this', 'Here is the corrected version: Fix this.'), false);
  assert.equal(looksValid('one two three', 'one two three four five six seven eight nine ten eleven'), false);
  assert.equal(looksValid('please send the full quarterly report to the whole team today', 'Okay.'), false);
});

test('styles follow the app: WhatsApp is personal, Slack is work, Gmail in a browser is email', () => {
  assert.equal(categorize({ name: 'WhatsApp', bundle: 'net.whatsapp.WhatsApp' }), 'personal');
  assert.equal(categorize({ name: 'Messages', bundle: 'com.apple.MobileSMS' }), 'personal');
  assert.equal(categorize({ name: 'Slack', bundle: 'com.tinyspeck.slackmacgap' }), 'work');
  assert.equal(categorize({ name: 'Mail', bundle: 'com.apple.mail' }), 'email');
  assert.equal(categorize({ name: 'Google Chrome', bundle: 'com.google.Chrome', title: 'Inbox (3) - laksh@gmail.com - Gmail' }), 'email');
  assert.equal(categorize({ name: 'Safari', bundle: 'com.apple.Safari', title: 'WhatsApp' }), 'personal');
  assert.equal(categorize({ name: 'Notes', bundle: 'com.apple.Notes' }), 'other');
  assert.equal(categorize(null), 'other');
  assert.equal(applyStyleLocally('Are you free at 8? See you then.', 'veryCasual'), 'are you free at 8? see you then');
  assert.equal(applyStyleLocally('Shipped it.', 'excited'), 'Shipped it!');
  assert.match(styleInstruction('email', 'formal'), /email/);
});

test('snippets expand from spoken triggers and survive cleanup', () => {
  const snippets = [
    { trigger: 'my calendly link', expansion: 'https://calendly.com/laksh/30min' },
    { trigger: 'my link', expansion: 'SHORT' },
  ];
  const { text, slots } = protect('Sure, here is My Calendly Link. Thanks', snippets);
  assert.equal(text, 'Sure, here is ⟦0⟧. Thanks');
  assert.equal(restore('Sure, here is ⟦0⟧. Thanks!', slots), 'Sure, here is https://calendly.com/laksh/30min. Thanks!');
  assert.equal(restore('Sure, here it is. Thanks!', slots), 'Sure, here it is. Thanks! https://calendly.com/laksh/30min');
  assert.equal(protect('the mylink thing', snippets).slots.length, 0);
});

test('pipeline uses the app style and snippets; expansions keep their case', async () => {
  let seen;
  const r = await processDictation({
    wav: Buffer.alloc(4),
    settings: { cleanupLevel: 'standard', styles: { personal: 'veryCasual' }, customPrompt: '' },
    category: 'personal',
    snippets: [{ trigger: 'my calendly link', expansion: 'https://calendly.com/Laksh' }],
    transcribe: async () => 'um book a slot at my calendly link',
    cleanup: async (args) => ((seen = args), 'Book a slot at ⟦0⟧'),
  });
  assert.match(seen.instructions, /Very casual/);
  assert.match(seen.input, /⟦0⟧/);
  assert.equal(r.text, 'Book a slot at https://calendly.com/Laksh');

  const local = await processDictation({
    wav: Buffer.alloc(4),
    settings: { styles: { personal: 'veryCasual' } },
    category: 'personal',
    snippets: [{ trigger: 'my calendly link', expansion: 'https://calendly.com/Laksh' }],
    transcribe: async () => 'Book a slot at my calendly link.',
    cleanup: null,
  });
  assert.equal(local.text, 'book a slot at https://calendly.com/Laksh');
});

test('live transcription: cuts at pauses while you talk, finishes only the tail', async () => {
  const tone = (sec) => Float32Array.from({ length: Math.round(sec * 16000) }, (_, i) => 0.2 * Math.sin(i / 5));
  const quiet = (sec) => new Float32Array(Math.round(sec * 16000));
  const calls = [];
  const live = new LiveTranscriber({
    transcribe: async (samples) => {
      calls.push(samples.length / 16000);
      return `part${calls.length}`;
    },
  });
  const feed = (arr) => {
    for (let i = 0; i < arr.length; i += 4096) live.push(arr.subarray(i, i + 4096));
  };
  feed(tone(5));
  feed(quiet(0.15)); // a gap between words is not a cut point
  feed(tone(0.5));
  await new Promise((r) => setImmediate(r));
  assert.equal(calls.length, 0, 'never cuts between words');
  feed(quiet(0.6)); // a real pause after 5.5 s of speech -> first part goes off in the background
  await new Promise((r) => setImmediate(r));
  assert.equal(calls.length, 1, 'first segment transcribed before release');
  assert.ok(calls[0] > 5.6 && calls[0] < 6.3);
  feed(tone(2));
  const text = await live.finish();
  assert.equal(calls.length, 2);
  assert.ok(calls[1] < 2.6, 'only the tail is left at release');
  assert.equal(text, 'part1 part2');

  // silence-only recordings never reach Whisper (it would invent words)
  const silent = new LiveTranscriber({ transcribe: async () => 'Thank you.' });
  silent.push(quiet(6));
  assert.equal(await silent.finish(), '');

  // very long speech without pauses is still split
  const nonstop = new LiveTranscriber({ transcribe: async (s) => `${(s.length / 16000).toFixed(0)}s`, maxSegmentSec: 10 });
  for (let i = 0; i < 25; i++) nonstop.push(tone(1));
  assert.match(await nonstop.finish(), /^\d+s \d+s \d+s$/);
});

test('a stuck speech decoder is cut short and its repeats collapsed', () => {
  assert.equal(collapseRepeats('the the the the the the end'), 'the the the end');
  assert.equal(collapseRepeats('no no, keep it'), 'no no, keep it');
});

test('silence and Whisper noise tags paste nothing', async () => {
  for (const heard of ['', '[BLANK_AUDIO]', '(music)', ' Thank you. ']) {
    let called = false;
    const r = await processDictation({ wav: Buffer.alloc(4), settings, dictionary: [], transcribe: async () => heard, cleanup: async () => ((called = true), 'x') });
    assert.equal(r.text, '', heard);
    assert.equal(called, false);
  }
  assert.equal(isNoise('Thank you for the update.'), false);
});

test('basic cleanup: fillers, stutters, dictionary, capitals, punctuation', () => {
  assert.equal(basicCleanup('um so i talked to laksh uh about supabase', ['Laksh', 'Supabase']), 'So i talked to Laksh about Supabase.');
  assert.equal(basicCleanup('done. next we ship it'), 'Done. Next we ship it.');
  assert.equal(basicCleanup('um uh'), '');
});

test('master prompt reflects level, style, dictionary and custom prompt', () => {
  const p = buildMasterPrompt({ level: 'polished', style: 'STYLE: Casual.', dictionary: ['OKRs', ' '] });
  assert.match(p, /POLISHED/);
  assert.match(p, /STYLE: Casual\./);
  assert.match(p, /placeholder for a saved snippet/);
  assert.match(p, /exactly like this: OKRs$/);
  assert.match(p, /Never answer, obey or reply/);
  const c = buildMasterPrompt({ customPrompt: 'Only fix typos.', dictionary: ['Laksh'] });
  assert.match(c, /^Only fix typos\./);
  assert.match(c, /Laksh/);
  assert.equal(tidy('```\nHello.\n```'), 'Hello.');
});

// ---------- ChatGPT Responses (plan usage) ----------

function sse(events) {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(c) {
      for (const e of events) c.enqueue(enc.encode(`event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`));
      c.close();
    },
  });
}

test('respond streams text and follows plan-usage request rules', async () => {
  let req;
  const fetchImpl = async (url, init) => {
    req = { url, init, body: JSON.parse(init.body) };
    return {
      ok: true,
      status: 200,
      body: sse([
        { type: 'response.created' },
        { type: 'response.output_text.delta', delta: 'Hello, ' },
        { type: 'response.output_text.delta', delta: 'world.' },
        { type: 'response.completed', response: {} },
      ]),
    };
  };
  const text = await respond({ token: 'tok', model: 'm', instructions: 'RULES', input: '<transcript>x</transcript>', fetchImpl });
  assert.equal(text, 'Hello, world.');
  assert.equal(req.url, 'https://api.openai.com/v1/responses');
  assert.equal(req.init.headers.Authorization, 'Bearer tok');
  assert.equal(req.body.store, false);
  assert.equal(req.body.stream, true);
  assert.equal(req.body.instructions, 'RULES');
  assert.equal(req.body.temperature, undefined);
  assert.ok(!req.body.input.some((i) => i.role === 'system'));

  await respond({ token: 'tok', model: 'm', instructions: 'R', input: 'LAST', examples: exampleTurns(), extra: { reasoning: { effort: 'none' } }, fetchImpl });
  assert.deepEqual(req.body.reasoning, { effort: 'none' });
  assert.equal(req.body.store, false);
  const turns = req.body.input;
  assert.equal(turns.at(-1).content, 'LAST');
  assert.equal(turns[0].role, 'user');
  assert.equal(turns[1].role, 'assistant');
  assert.ok(turns.length >= 9, 'examples come before the transcript');
});

test('usage-limit errors are recognised before and during the stream', async () => {
  const before = async () => ({
    ok: false,
    status: 429,
    text: async () => JSON.stringify({ error: { code: 'subscription_sharing_usage_limit_exceeded' } }),
  });
  await assert.rejects(respond({ token: 't', model: 'm', instructions: 'i', input: 'x', fetchImpl: before }), (e) => e.kind === 'limit');

  const during = async () => ({
    ok: true,
    status: 200,
    body: sse([{ type: 'response.output_text.delta', delta: 'Hi' }, { type: 'response.failed', response: { error: { code: 'subscription_sharing_usage_limit_exceeded' } } }]),
  });
  await assert.rejects(respond({ token: 't', model: 'm', instructions: 'i', input: 'x', fetchImpl: during }), (e) => e.kind === 'limit');

  const ineligible = async () => ({ ok: false, status: 403, text: async () => JSON.stringify({ error: { code: 'subscription_sharing_user_not_eligible' } }) });
  await assert.rejects(respond({ token: 't', model: 'm', instructions: 'i', input: 'x', fetchImpl: ineligible }), /Plus or Pro/);

  const cut = async () => ({ ok: true, status: 200, body: sse([{ type: 'response.output_text.delta', delta: 'Hi' }]) });
  await assert.rejects(respond({ token: 't', model: 'm', instructions: 'i', input: 'x', fetchImpl: cut }), /without completing/);
});

test('a ChatGPT reply that stalls mid-stream is abandoned quickly (falls back instead of hanging)', async () => {
  const chatgpt = require('../src/main/chatgpt');
  const stalled = async (_url, init) => ({
    ok: true,
    status: 200,
    body: new ReadableStream({
      start(c) {
        c.enqueue(new TextEncoder().encode('data: {"type":"response.output_text.delta","delta":"Hi"}\n\n'));
        init.signal.addEventListener('abort', () => c.error(new DOMException('aborted', 'AbortError')));
      },
    }),
  });
  const t0 = Date.now();
  // shrink the stall window for the test
  const orig = setTimeout;
  global.setTimeout = (fn, ms, ...a) => orig(fn, ms === 12000 ? 50 : ms, ...a);
  try {
    await assert.rejects(chatgpt.respond({ token: 't', model: 'm', instructions: 'i', input: 'x', fetchImpl: stalled }), /stopped responding/);
  } finally {
    global.setTimeout = orig;
  }
  assert.ok(Date.now() - t0 < 2000);
});

test('model list keeps listed models and picks a fast default', async () => {
  const fetchImpl = async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      models: [
        { slug: 'big-one', display_name: 'Big', visibility: 'list' },
        { slug: 'hidden', display_name: 'Hidden', visibility: 'hide' },
        { slug: 'small-mini', display_name: 'Small mini', visibility: 'list' },
      ],
    }),
  });
  const models = await listModels({ token: 't', fetchImpl });
  assert.deepEqual(models.map((m) => m.slug), ['big-one', 'small-mini']);
  assert.equal(pickDefaultModel(models), 'small-mini');
  assert.equal(pickDefaultModel([{ slug: 'only', name: 'Only' }]), 'only');
});

// ---------- Sign in with ChatGPT ----------

function fakeOpenAI() {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', { modulusLength: 2048 });
  const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'k1', alg: 'RS256', use: 'sig' };
  const sign = (claims) => {
    const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1', typ: 'JWT' })).toString('base64url');
    const p = Buffer.from(JSON.stringify(claims)).toString('base64url');
    const s = crypto.sign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url');
    return `${h}.${p}.${s}`;
  };
  const calls = [];
  const state = { nonce: null, claims: {}, failExchanges: 0, exchanges: [], authorizes: [] };
  const json = (body, status = 200) => ({ ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) });
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url, init });
    if (url.endsWith('/.well-known/openid-configuration')) {
      return json({
        authorization_endpoint: 'https://auth.openai.com/api/accounts/authorize',
        token_endpoint: 'https://auth.openai.com/api/accounts/oauth/token',
        revocation_endpoint: 'https://auth.openai.com/api/accounts/oauth/revoke',
        jwks_uri: 'https://auth.openai.com/.well-known/jwks.json',
      });
    }
    if (url.endsWith('/jwks.json')) return json({ keys: [jwk] });
    if (url.endsWith('/oauth/token')) {
      const form = new URLSearchParams(init.body);
      if (form.get('grant_type') === 'authorization_code' && state.failExchanges > 0) {
        state.failExchanges--;
        state.exchanges.push(form);
        return json({ error: 'invalid_grant', error_description: 'test failure' }, 400);
      }
      if (form.get('grant_type') === 'authorization_code') state.exchanges.push(form);
      if (form.get('grant_type') === 'refresh_token') {
        if (form.get('refresh_token') === 'dead') return json({ error: 'invalid_grant' }, 400);
        return json({ access_token: 'at2', refresh_token: 'rt2', expires_in: 3600, scope: 'openid chatgpt.tokens.use.direct' });
      }
      const idToken = sign({
        iss: 'https://auth.openai.com',
        aud: form.get('client_id'),
        sub: 'user-1',
        email: 'laksh@example.com',
        name: 'Laksh',
        nonce: state.nonce,
        exp: Math.floor(Date.now() / 1000) + 3600,
        ...state.claims,
      });
      const identityOnly = !form.get('resource');
      return json({
        access_token: 'at1',
        refresh_token: identityOnly ? undefined : 'rt1',
        id_token: idToken,
        expires_in: 3600,
        scope: identityOnly ? 'openid profile email' : (state.scope ?? 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct'),
      });
    }
    if (url.endsWith('/oauth/revoke')) return { ok: true, status: 200, text: async () => '' };
    throw new Error(`unexpected ${url}`);
  };
  // The "browser": read the authorize URL, then hit the loopback callback like ChatGPT would.
  const openBrowser = async (authorizeUrl) => {
    const u = new URL(authorizeUrl);
    state.authorize = u.searchParams;
    state.authorizes.push(u.searchParams);
    state.nonce = u.searchParams.get('nonce');
    const cb = new URL(u.searchParams.get('redirect_uri'));
    if (state.denyPlan && u.searchParams.get('scope').includes('chatgpt.tokens.use.direct')) {
      cb.searchParams.set('error', 'access_denied'); // ChatGPT Free: only Cancel works on the consent page
      cb.searchParams.set('state', u.searchParams.get('state'));
      setTimeout(() => fetch(cb).catch(() => {}), 10);
      return;
    }
    cb.searchParams.set('code', 'the-code');
    cb.searchParams.set('state', state.forceState || u.searchParams.get('state'));
    if (u.searchParams.get('client_id') === 'dynamic_agent_client') cb.searchParams.set('client_id', 'oaiapp_123');
    setTimeout(() => fetch(cb).catch(() => {}), 10);
  };
  return { fetchImpl, openBrowser, state, calls };
}

test('first sign-in registers bewithflow and returns a verified identity with plan usage', async () => {
  const f = fakeOpenAI();
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  const r = await auth.signIn({ hostId: 'urn:uuid:host-1' });
  const q = f.state.authorize;
  assert.equal(q.get('client_id'), 'dynamic_agent_client');
  assert.equal(q.get('agent_name_hint'), 'bewithflow');
  assert.equal(q.get('ext_agent_host_id'), 'urn:uuid:host-1');
  assert.equal(q.get('scope'), 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct');
  assert.equal(q.get('resource'), 'https://api.openai.com/v1');
  assert.equal(q.get('code_challenge_method'), 'S256');
  assert.match(q.get('redirect_uri'), /^http:\/\/127\.0\.0\.1:\d+\/auth\/callback$/);

  assert.equal(r.clientId, 'oaiapp_123');
  assert.deepEqual(r.identity, { sub: 'user-1', email: 'laksh@example.com', name: 'Laksh', picture: '' });
  assert.equal(r.tokens.accessToken, 'at1');
  assert.equal(r.tokens.planUsage, true);

  const exchange = new URLSearchParams(f.calls.find((c) => c.url.endsWith('/oauth/token')).init.body);
  assert.equal(exchange.get('client_id'), 'oaiapp_123');
  assert.equal(exchange.get('grant_type'), 'authorization_code');
  assert.ok(exchange.get('code_verifier'));
  assert.equal(exchange.get('redirect_uri'), q.get('redirect_uri'));
});

test('returning sign-in reuses the issued client and rejects a different account', async () => {
  const f = fakeOpenAI();
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  const account = { clientId: 'oaiapp_123', sub: 'user-1', email: 'laksh@example.com', idToken: 'old.id.token' };
  const r = await auth.signIn({ hostId: 'h', account });
  assert.equal(f.state.authorize.get('client_id'), 'oaiapp_123');
  assert.equal(f.state.authorize.get('agent_name_hint'), null);
  assert.equal(f.state.authorize.get('login_hint'), 'laksh@example.com');
  assert.equal(r.clientId, 'oaiapp_123');

  f.state.claims = { sub: 'someone-else' };
  await assert.rejects(auth.signIn({ hostId: 'h', account }), /different ChatGPT account/);
});

test('sign-in fails safely on bad state, bad nonce, or declined plan usage', async () => {
  const f = fakeOpenAI();
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  f.state.forceState = 'tampered';
  await assert.rejects(auth.signIn({ hostId: 'h' }), /did not match/);
  f.state.forceState = null;
  f.state.claims = { nonce: 'wrong' };
  await assert.rejects(auth.signIn({ hostId: 'h' }), /did not match this sign-in/);
  f.state.claims = {};
  f.state.scope = 'openid profile email offline_access';
  const r = await auth.signIn({ hostId: 'h' });
  assert.equal(r.tokens.planUsage, false);
});

test('invalid_grant on first sign-in retries with the issued client, as OpenAI documents', async () => {
  const f = fakeOpenAI();
  f.state.failExchanges = 1;
  const statuses = [];
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  const r = await auth.signIn({ hostId: 'h', onStatus: (m) => statuses.push(m) });
  assert.equal(f.state.authorizes.length, 2);
  assert.equal(f.state.authorizes[0].get('client_id'), 'dynamic_agent_client');
  assert.equal(f.state.authorizes[1].get('client_id'), 'oaiapp_123');
  assert.equal(f.state.authorizes[1].get('agent_name_hint'), null);
  assert.equal(r.clientId, 'oaiapp_123');
  assert.equal(r.tokens.planUsage, true);
  assert.deepEqual(statuses, ['Finishing sign-in…']);
});

test('if the token step keeps failing, stops after one retry with a readable error', async () => {
  const f = fakeOpenAI();
  f.state.failExchanges = 2;
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  await assert.rejects(auth.signIn({ hostId: 'h' }), /invalid_grant: test failure/);
  assert.equal(f.state.authorizes.length, 2);
  assert.ok(f.state.authorizes.every((q) => q.get('scope').includes('chatgpt.tokens.use.direct')));
});

test('ChatGPT Free: blocked plan permission gives a clear error (no identity-only request)', async () => {
  const f = fakeOpenAI();
  f.state.denyPlan = true;
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  await assert.rejects(auth.signIn({ hostId: 'h' }), (e) => e.code === 'plan_unavailable' && /ChatGPT Free/.test(e.message));
  assert.ok(f.state.authorizes.every((q) => q.get('scope').includes('chatgpt.tokens.use.direct')), 'never sends the rejected identity-only request');
});

test('Free mode: on-device profile, later upgraded to ChatGPT keeps its data', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bwf-'));
  const vault = { available: () => true, encrypt: (x) => x, decrypt: (x) => x };
  const s = new Store(dir, vault);
  const u = s.saveLocal('Anurag');
  assert.deepEqual([u.local, u.planUsage, u.name], [true, false, 'Anurag']);
  s.addWord('Shadu');
  s.saveSnippet({ trigger: 'my link', expansion: 'https://x.y' });
  s.addHistory({ text: 'hello', raw: 'um hello', provider: 'local-ai' });
  s.signOut();
  assert.deepEqual(s.savedAccounts()[0], { id: 'local', email: '', name: 'Anurag', free: true, local: true });
  s.saveLocal();
  assert.equal(s.currentUser().name, 'Anurag');
  s.saveSignIn({ clientId: 'oaiapp_9', identity: { sub: 'u9', email: 'a@b.co', name: 'Anurag' }, tokens: { planUsage: true, accessToken: 't' } });
  assert.equal(s.migrateProfile('local', 'oaiapp_9'), true);
  assert.deepEqual(s.getDictionary(), ['Shadu']);
  assert.equal(s.getSnippets().length, 1);
  assert.equal(s.getHistory().length, 1);
  assert.equal(s.migrateProfile('local', 'oaiapp_9'), false, 'never overwrites an account that has data');
});

test('refresh rotates tokens; a dead refresh token means sign in again', async () => {
  const f = fakeOpenAI();
  const auth = new ChatGPTAuth({ fetchImpl: f.fetchImpl, openBrowser: f.openBrowser });
  const next = await auth.refresh({ clientId: 'oaiapp_123', refreshToken: 'rt1', idToken: 'keep' });
  assert.equal(next.accessToken, 'at2');
  assert.equal(next.refreshToken, 'rt2');
  assert.equal(next.idToken, 'keep');
  assert.equal(next.planUsage, true);
  await assert.rejects(auth.refresh({ clientId: 'oaiapp_123', refreshToken: 'dead' }), (e) => e.code === 'expired');
  assert.equal(await auth.revoke({ clientId: 'oaiapp_123', refreshToken: 'rt2' }), true);
});

// ---------- store ----------

test('store keeps ChatGPT registrations, encrypted tokens and per-account data', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bwf-'));
  const vault = { available: () => true, encrypt: (s) => `enc:${Buffer.from(s).toString('base64')}`, decrypt: (s) => Buffer.from(s.slice(4), 'base64').toString() };
  const s = new Store(dir, vault);
  assert.match(s.hostId, /^urn:uuid:/);
  assert.equal(s.currentUser(), null);
  const tokens = { accessToken: 'secret-at', refreshToken: 'secret-rt', idToken: 'id', expiresAt: 1, scopes: [], planUsage: true };
  s.saveSignIn({ clientId: 'oaiapp_1', identity: { sub: 'u1', email: 'a@b.co', name: 'Laksh' }, tokens });
  assert.equal(s.registration('oaiapp_1').free, false);
  assert.deepEqual(s.currentUser(), { id: 'oaiapp_1', name: 'Laksh', email: 'a@b.co', picture: '', planUsage: true, local: false });
  const raw = fs.readFileSync(path.join(dir, 'bewithflow.json'), 'utf8');
  assert.ok(!raw.includes('secret-at') && !raw.includes('secret-rt'), 'tokens never stored in plain text');

  s.updateSettings({ cleanupLevel: 'light', bogus: 1 });
  assert.equal(s.getSettings().styles.personal, 'casual');
  assert.equal(s.getSettings().pttChord, 'fn');
  s.saveSnippet({ trigger: 'my link', expansion: 'https://x.y' });
  assert.throws(() => s.saveSnippet({ trigger: 'My Link', expansion: 'dup' }), /already exists/);
  assert.throws(() => s.saveSnippet({ trigger: '', expansion: 'x' }), /Enter a snippet/);
  const [snip] = s.getSnippets();
  s.saveSnippet({ id: snip.id, trigger: 'my site', expansion: 'https://z' });
  assert.equal(s.getSnippets()[0].trigger, 'my site');
  s.addWord('Supabase');
  s.addHistory({ text: 'one two three', raw: 'um one two three', provider: 'chatgpt', durationMs: 3000 });
  assert.equal(s.stats().wpm, 60);
  assert.equal(s.stats().streak, 1);

  const hostId = s.hostId;
  s.signOut();
  assert.equal(s.currentUser(), null);
  assert.deepEqual(s.savedAccounts(), [{ id: 'oaiapp_1', email: 'a@b.co', name: 'Laksh', free: false, local: false }]);
  assert.deepEqual(s.registration('oaiapp_1'), { clientId: 'oaiapp_1', sub: 'u1', email: 'a@b.co', idToken: null, free: false });

  const again = new Store(dir, vault); // persisted
  assert.equal(again.hostId, hostId);
  again.saveSignIn({ clientId: 'oaiapp_1', identity: { sub: 'u1', email: 'a@b.co', name: '' }, tokens });
  assert.equal(again.getSettings().cleanupLevel, 'light');
  assert.equal(again.getSettings().bogus, undefined);
  assert.deepEqual(again.getDictionary(), ['Supabase']);
  assert.equal(again.getHistory().length, 1);
  again.forgetAccount();
  assert.deepEqual(again.savedAccounts(), []);
});

// ---------- misc ----------

test('WAV decoding feeds Whisper 16-bit samples as floats', () => {
  const samples = [0, 16384, -32768, 32767];
  const buf = Buffer.alloc(44 + samples.length * 2);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + samples.length * 2, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(16000, 24);
  buf.writeUInt32LE(32000, 28);
  buf.writeUInt16LE(2, 32);
  buf.writeUInt16LE(16, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(samples.length * 2, 40);
  samples.forEach((v, i) => buf.writeInt16LE(v, 44 + i * 2));
  const out = decodeWav(buf);
  assert.deepEqual([...out].map((x) => Math.round(x * 100) / 100), [0, 0.5, -1, 1]);
  assert.throws(() => decodeWav(Buffer.from('nope')), /not a WAV/);
});

test('word diff marks removed fillers and corrections', () => {
  const ops = wordDiff('um so can we uh move it to three no wait four', 'Can we move it to 4?');
  assert.deepEqual(ops.filter((o) => o.type === 'del').map((o) => o.word), ['um', 'so', 'uh', 'three', 'no', 'wait', 'four']);
  assert.deepEqual(ops.filter((o) => o.type === 'ins').map((o) => o.word), ['4?']);
});

test('tray icon is a valid PNG', () => {
  const png = markPng(36);
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  assert.equal(png.readUInt32BE(16), 36);
});
