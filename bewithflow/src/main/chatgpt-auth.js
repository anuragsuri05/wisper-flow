'use strict';

// "Sign in with ChatGPT" for a locally running app (OpenAI's open-source / local
// client flow): OAuth 2.0 authorization code + PKCE through the system browser,
// with a loopback callback on 127.0.0.1. The first sign-in registers bewithflow
// as a client on the user's ChatGPT account (client_id=dynamic_agent_client),
// and the callback returns the issued client id (oaiapp_...) we reuse afterwards.
// Docs: https://developers.openai.com/siwc/token-sharing-open-source/sign-in

const http = require('http');
const crypto = require('crypto');

const ISSUER = 'https://auth.openai.com';
const DISCOVERY = `${ISSUER}/.well-known/openid-configuration`;
const RESOURCE = 'https://api.openai.com/v1';
const APP_NAME = 'bewithflow';
const SCOPES = 'openid profile email offline_access resource.invoke chatgpt.tokens.use.direct';
const PLAN_SCOPE = 'chatgpt.tokens.use.direct';
const PREFERRED_PORT = 1455;
const CALLBACK_PATH = '/auth/callback';
const SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000;

class AuthError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code; // 'cancelled' | 'expired' | 'mismatch' | 'invalid' | 'network'
  }
}

const b64url = (buf) => Buffer.from(buf).toString('base64url');
const random = (bytes = 32) => b64url(crypto.randomBytes(bytes));

class ChatGPTAuth {
  /**
   * @param {{ fetchImpl?: typeof fetch, openBrowser: (url: string) => any, now?: () => number }} deps
   */
  constructor({ fetchImpl = fetch, openBrowser, now = Date.now, log = () => {} }) {
    this.log = log;
    this.fetch = fetchImpl;
    this.openBrowser = openBrowser;
    this.now = now;
    this.config = null;
    this.jwks = null;
    this.pending = null;
  }

  async discover() {
    if (this.config) return this.config;
    const res = await this.#get(DISCOVERY);
    this.config = res;
    return res;
  }

  async #get(url) {
    let res;
    try {
      res = await this.fetch(url, { signal: AbortSignal.timeout(15_000) });
    } catch {
      throw new AuthError("Can't reach ChatGPT. Check your internet connection.", 'network');
    }
    if (!res.ok) throw new AuthError(`ChatGPT sign-in service returned ${res.status}.`, 'network');
    return res.json();
  }

  async #postForm(url, fields) {
    let res;
    try {
      res = await this.fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams(fields).toString(),
        signal: AbortSignal.timeout(20_000),
      });
    } catch {
      throw new AuthError("Can't reach ChatGPT. Check your internet connection.", 'network');
    }
    const text = await res.text();
    let body = {};
    try {
      body = text ? JSON.parse(text) : {};
    } catch {
      body = { detail: text };
    }
    return { status: res.status, ok: res.ok, body };
  }

  /**
   * Opens the browser and waits for the user to sign in.
   *
   * Recovery, per OpenAI's docs: if the code exchange returns invalid_grant,
   * discard the code and authorize again with the issued client id. If plan
   * usage still can't be granted (e.g. a ChatGPT Free account), sign in with
   * identity scopes only so the account can still use bewithflow.
   *
   * @param {{ hostId: string, account?: {clientId: string, sub?: string, email?: string, idToken?: string}, consent?: boolean, onStatus?: (msg: string) => void }} opts
   * @returns {Promise<{clientId, identity: {sub,email,name,picture}, tokens}>}
   */
  async signIn({ hostId, account, consent = false, onStatus = () => {} }) {
    // The dynamic (open-source) client only accepts the plan-usage request: identity-only
    // requests are rejected with invalid_client, and ChatGPT Free can't grant plan usage.
    // Free users therefore use bewithflow without signing in (see Store.saveLocal).
    const plan = [{ scopes: SCOPES }, { scopes: SCOPES, retry: true }];
    let current = account;
    let lastError;
    for (const step of plan) {
      try {
        if (step.retry) onStatus('Finishing sign-in…');
        return await this.#attempt({ hostId, account: current, consent: consent && !step.retry, scopes: step.scopes });
      } catch (err) {
        lastError = err;
        const recoverable = err.code === 'invalid_grant';
        if (!recoverable || !err.clientId) throw err;
        // reuse the registration ChatGPT just issued instead of registering again
        current = { clientId: err.clientId, sub: account?.sub, email: account?.email };
      }
    }
    throw lastError;
  }

  async #attempt({ hostId, account, consent, scopes }) {
    this.cancel();
    const cfg = await this.discover();
    const state = random();
    const nonce = random();
    const verifier = random(48);
    const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());

    const { server, port } = await listenLoopback(account ? 0 : PREFERRED_PORT);
    const redirectUri = `http://127.0.0.1:${port}${CALLBACK_PATH}`;

    const params = new URLSearchParams({
      client_id: account ? account.clientId : 'dynamic_agent_client',
      ext_agent_host_id: hostId,
      response_type: 'code',
      redirect_uri: redirectUri,
      scope: scopes,
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });
    if (scopes === SCOPES) params.set('resource', RESOURCE);
    if (!account) params.set('agent_name_hint', APP_NAME);
    if (account?.idToken) params.set('id_token_hint', account.idToken);
    if (account?.email) params.set('login_hint', account.email);
    if (consent) params.set('prompt', 'consent');
    const authorizeUrl = `${cfg.authorization_endpoint}?${params.toString()}`;

    this.log(`authorize: ${account ? 'returning client' : 'new registration'}, scopes="${scopes}", port=${port}`);
    const callback = waitForCallback(server, SIGN_IN_TIMEOUT_MS);
    this.pending = { server, authorizeUrl, reject: callback.reject };
    await this.openBrowser(authorizeUrl);

    let query;
    try {
      query = await callback.promise;
    } finally {
      this.pending = null;
      server.close();
    }

    if (query.get('state') !== state) throw new AuthError('Sign-in response did not match this attempt. Try again.', 'invalid');
    const error = query.get('error');
    this.log(`callback: ${error ? `error=${error} ${query.get('error_description') || ''}` : 'code received'}, client_id=${query.get('client_id') || '-'}, scope="${query.get('scope') || ''}"`);
    if (error === 'access_denied') {
      // On ChatGPT Free the plan permission is unavailable and only Cancel works on that page.
      throw new AuthError('Sign-in didn’t finish. If you use ChatGPT Free, use bewithflow free on this computer instead.', 'plan_unavailable');
    }
    if (error) {
      const e = new AuthError(`ChatGPT sign-in failed (${error}${query.get('error_description') ? `: ${query.get('error_description')}` : ''}).`, error);
      e.clientId = account?.clientId || query.get('client_id');
      throw e;
    }

    const returnedClient = query.get('client_id');
    let clientId;
    if (account) {
      if (returnedClient && returnedClient !== account.clientId) {
        throw new AuthError('ChatGPT returned a different app registration. Try signing in again.', 'mismatch');
      }
      clientId = account.clientId;
    } else {
      if (!returnedClient) throw new AuthError('ChatGPT did not finish registering bewithflow. Try again.', 'invalid');
      clientId = returnedClient;
    }

    const fields = {
      grant_type: 'authorization_code',
      client_id: clientId,
      code: query.get('code') || '',
      code_verifier: verifier,
      redirect_uri: redirectUri,
    };
    if (scopes === SCOPES) fields.resource = RESOURCE;
    const exchange = await this.#postForm(cfg.token_endpoint, fields);
    this.log(`token: status=${exchange.status} ${exchange.ok ? `scope="${exchange.body.scope || ''}"` : `error=${exchange.body.error || '-'} ${exchange.body.error_description || exchange.body.detail || ''}`}`);
    if (!exchange.ok) {
      const code = exchange.body.error || `http_${exchange.status}`;
      const why = exchange.body.error_description ? `: ${exchange.body.error_description}` : '';
      const e = new AuthError(`ChatGPT sign-in failed at the token step (${code}${why}). Try again.`, code);
      e.clientId = clientId;
      throw e;
    }

    const claims = await this.verifyIdToken(exchange.body.id_token, { clientId, nonce });
    if (account?.sub && claims.sub !== account.sub) {
      throw new AuthError(`You signed in as a different ChatGPT account than ${account.email || 'the one selected'}.`, 'mismatch');
    }
    return {
      clientId,
      identity: { sub: claims.sub, email: claims.email || '', name: claims.name || claims.given_name || '', picture: claims.picture || '' },
      tokens: this.#tokenSet(exchange.body),
    };
  }

  /** Stop a sign-in that is waiting for the browser. */
  cancel() {
    if (!this.pending) return;
    this.pending.reject(new AuthError('Sign-in cancelled.', 'cancelled'));
    this.pending.server.close();
    this.pending = null;
  }

  reopenBrowser() {
    if (this.pending) this.openBrowser(this.pending.authorizeUrl);
  }

  #tokenSet(body) {
    const scopes = String(body.scope || '').split(/\s+/).filter(Boolean);
    return {
      accessToken: body.access_token,
      refreshToken: body.refresh_token,
      idToken: body.id_token,
      expiresAt: this.now() + (Number(body.expires_in) || 3600) * 1000,
      scopes,
      planUsage: scopes.includes(PLAN_SCOPE),
    };
  }

  /** Exchange a refresh token for a fresh token set (the refresh token rotates). */
  async refresh({ clientId, refreshToken, idToken }) {
    const cfg = await this.discover();
    const r = await this.#postForm(cfg.token_endpoint, {
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
      resource: RESOURCE,
    });
    if (!r.ok) {
      const code = r.body.error || r.body.code || '';
      const terminal = /invalid_grant|invalid_refresh_token|token_expired|refresh_token_/.test(code) || r.status === 400 || r.status === 401;
      if (terminal) throw new AuthError('Your ChatGPT session ended. Sign in again.', 'expired');
      throw new AuthError(`Couldn't renew your ChatGPT session (${code || r.status}).`, 'network');
    }
    const set = this.#tokenSet(r.body);
    if (!set.idToken) set.idToken = idToken;
    if (!set.refreshToken) set.refreshToken = refreshToken;
    return set;
  }

  /** Revoke the renewable session. Resolves true when OpenAI confirmed it. */
  async revoke({ clientId, refreshToken }) {
    if (!refreshToken) return true;
    try {
      const cfg = await this.discover();
      const r = await this.#postForm(cfg.revocation_endpoint, { token: refreshToken, token_type_hint: 'refresh_token', client_id: clientId });
      return r.ok;
    } catch {
      return false;
    }
  }

  async #keys(force = false) {
    if (this.jwks && !force) return this.jwks;
    const cfg = await this.discover();
    this.jwks = (await this.#get(cfg.jwks_uri)).keys || [];
    return this.jwks;
  }

  /** Verify an RS256 ID token against OpenAI's JWKS and check iss/aud/exp/nonce. */
  async verifyIdToken(idToken, { clientId, nonce }) {
    const parts = String(idToken || '').split('.');
    if (parts.length !== 3) throw new AuthError('ChatGPT returned an invalid identity token.', 'invalid');
    const [h, p, s] = parts;
    const header = JSON.parse(Buffer.from(h, 'base64url').toString());
    const claims = JSON.parse(Buffer.from(p, 'base64url').toString());
    if (header.alg !== 'RS256') throw new AuthError('Unexpected identity token algorithm.', 'invalid');

    let jwk = (await this.#keys()).find((k) => k.kid === header.kid);
    if (!jwk) jwk = (await this.#keys(true)).find((k) => k.kid === header.kid);
    if (!jwk) throw new AuthError('Could not find the key that signed your identity token.', 'invalid');
    const ok = crypto.verify('RSA-SHA256', Buffer.from(`${h}.${p}`), crypto.createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(s, 'base64url'));
    if (!ok) throw new AuthError('Identity token signature is invalid.', 'invalid');

    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const nowSec = Math.floor(this.now() / 1000);
    if (claims.iss !== ISSUER) throw new AuthError('Identity token came from an unexpected issuer.', 'invalid');
    if (!aud.includes(clientId)) throw new AuthError('Identity token was issued for a different app.', 'invalid');
    if (typeof claims.exp !== 'number' || claims.exp + 60 < nowSec) throw new AuthError('Identity token has expired. Sign in again.', 'invalid');
    if (claims.nonce !== nonce) throw new AuthError('Identity token did not match this sign-in attempt.', 'invalid');
    if (!claims.sub) throw new AuthError('Identity token has no account id.', 'invalid');
    return claims;
  }
}

// ---------- loopback callback server ----------

function listenLoopback(port) {
  return new Promise((resolve, reject) => {
    const server = http.createServer();
    const tryListen = (p) => {
      server.once('error', (err) => {
        if (p !== 0 && err.code === 'EADDRINUSE') tryListen(0); // preferred port busy: any free port
        else reject(err);
      });
      server.listen(p, '127.0.0.1', () => resolve({ server, port: server.address().port }));
    };
    tryListen(port);
  });
}

const PAGE = (title, body) => `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#241a28;color:#f1e9f2;font:16px/1.5 -apple-system,'Segoe UI',sans-serif}
main{max-width:420px;padding:32px;text-align:center}h1{font-size:26px;margin:0 0 8px;letter-spacing:-.02em}p{color:#b9abbe;margin:0}
.bars{display:flex;gap:5px;justify-content:center;align-items:center;height:40px;margin-bottom:18px}.bars i{width:6px;border-radius:3px;background:#dcac4e}</style></head>
<body><main><div class="bars"><i style="height:14px"></i><i style="height:26px"></i><i style="height:38px"></i><i style="height:22px"></i><i style="height:12px"></i></div>
<h1>${title}</h1><p>${body}</p></main></body></html>`;

function waitForCallback(server, timeoutMs) {
  let reject;
  const promise = new Promise((resolve, rej) => {
    reject = rej;
    const timer = setTimeout(() => rej(new AuthError('Sign-in timed out. Try again.', 'cancelled')), timeoutMs);
    server.on('request', (req, res) => {
      const url = new URL(req.url, 'http://127.0.0.1');
      if (url.pathname !== CALLBACK_PATH) {
        res.writeHead(404).end();
        return;
      }
      const failed = url.searchParams.get('error');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(
        failed
          ? PAGE('Sign-in didn’t finish', 'Go back to bewithflow to try again. You can close this tab.')
          : PAGE('You’re signed in', 'Go back to bewithflow and start dictating. You can close this tab.'),
      );
      clearTimeout(timer);
      resolve(url.searchParams);
    });
  });
  return { promise, reject: (e) => reject(e) };
}

module.exports = { ChatGPTAuth, AuthError, PLAN_SCOPE, RESOURCE };
