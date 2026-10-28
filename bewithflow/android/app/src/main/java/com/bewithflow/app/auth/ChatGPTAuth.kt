package com.bewithflow.app.auth

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.FormBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.IOException
import java.math.BigInteger
import java.net.InetAddress
import java.net.ServerSocket
import java.net.SocketTimeoutException
import java.net.URI
import java.net.URLDecoder
import java.net.URLEncoder
import java.security.KeyFactory
import java.security.MessageDigest
import java.security.SecureRandom
import java.security.Signature
import java.security.spec.RSAPublicKeySpec
import java.util.Base64
import java.util.concurrent.TimeUnit

/**
 * "Sign in with ChatGPT" for apps that run on the user's device (OpenAI's open-source flow):
 * OAuth 2.0 authorization code + PKCE in the browser, with a loopback callback on 127.0.0.1.
 * The first sign-in registers bewithflow on the user's ChatGPT account
 * (client_id=dynamic_agent_client) and the callback returns the issued client id.
 * Docs: https://developers.openai.com/siwc/token-sharing-open-source/sign-in
 */
class ChatGPTAuth(
    private val http: OkHttpClient = OkHttpClient.Builder().callTimeout(20, TimeUnit.SECONDS).build(),
    private val now: () -> Long = System::currentTimeMillis,
    private val log: (String) -> Unit = {},
) {
    class AuthException(message: String, val code: String, val clientId: String? = null) : Exception(message)

    data class Identity(val sub: String, val email: String, val name: String)
    data class Tokens(
        val accessToken: String?, val refreshToken: String?, val idToken: String?,
        val expiresAt: Long, val scopes: List<String>, val planUsage: Boolean,
    )
    data class SignInResult(val clientId: String, val identity: Identity, val tokens: Tokens)
    data class Account(val clientId: String, val sub: String?, val email: String?, val idToken: String?)

    companion object {
        const val ISSUER = "https://auth.openai.com"
        const val RESOURCE = "https://api.openai.com/v1"
        const val APP_NAME = "bewithflow"
        const val SCOPES = "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct"
        const val PLAN_SCOPE = "chatgpt.tokens.use.direct"
        private const val PREFERRED_PORT = 1455
        private const val CALLBACK_PATH = "/auth/callback"
        private const val SIGN_IN_TIMEOUT_MS = 5 * 60 * 1000

        fun b64url(bytes: ByteArray): String = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes)
        fun random(n: Int = 32): String = b64url(ByteArray(n).also { SecureRandom().nextBytes(it) })
        fun challenge(verifier: String): String = b64url(MessageDigest.getInstance("SHA-256").digest(verifier.toByteArray()))
        private fun enc(s: String) = URLEncoder.encode(s, "UTF-8").replace("+", "%20")
    }

    @Volatile private var pending: ServerSocket? = null
    @Volatile private var pendingUrl: String? = null
    private var config: JSONObject? = null
    private var jwks: List<JSONObject>? = null

    private fun get(url: String): JSONObject {
        val res = try {
            http.newCall(Request.Builder().url(url).build()).execute()
        } catch (e: IOException) {
            throw AuthException("Can't reach ChatGPT. Check your internet connection.", "network")
        }
        res.use {
            if (!it.isSuccessful) throw AuthException("ChatGPT sign-in service returned ${it.code}.", "network")
            return JSONObject(it.body?.string() ?: "{}")
        }
    }

    private fun postForm(url: String, fields: Map<String, String>): Pair<Int, JSONObject> {
        val form = FormBody.Builder().apply { fields.forEach { (k, v) -> add(k, v) } }.build()
        val res = try {
            http.newCall(Request.Builder().url(url).header("Accept", "application/json").post(form).build()).execute()
        } catch (e: IOException) {
            throw AuthException("Can't reach ChatGPT. Check your internet connection.", "network")
        }
        res.use {
            val text = it.body?.string().orEmpty()
            val json = runCatching { JSONObject(text) }.getOrElse { JSONObject().put("detail", text) }
            return it.code to json
        }
    }

    private fun discover(): JSONObject = config ?: get("$ISSUER/.well-known/openid-configuration").also { config = it }

    /** Opens the browser and waits for the callback. Recovers from invalid_grant as OpenAI documents. */
    suspend fun signIn(
        hostId: String,
        account: Account?,
        consent: Boolean,
        openBrowser: (String) -> Unit,
        onStatus: (String) -> Unit = {},
    ): SignInResult = withContext(Dispatchers.IO) {
        var current = account
        try {
            attempt(hostId, current, consent, openBrowser)
        } catch (e: AuthException) {
            if (e.code != "invalid_grant" || e.clientId == null) throw e
            onStatus("Finishing sign-in…")
            current = Account(e.clientId, account?.sub, account?.email, null)
            attempt(hostId, current, false, openBrowser)
        }
    }

    fun cancel() {
        runCatching { pending?.close() }
        pending = null
    }

    fun reopen(openBrowser: (String) -> Unit) {
        pendingUrl?.let(openBrowser)
    }

    private fun listen(port: Int): ServerSocket = try {
        ServerSocket(port, 1, InetAddress.getByName("127.0.0.1"))
    } catch (e: IOException) {
        if (port != 0) ServerSocket(0, 1, InetAddress.getByName("127.0.0.1")) else throw e
    }

    private fun attempt(hostId: String, account: Account?, consent: Boolean, openBrowser: (String) -> Unit): SignInResult {
        cancel()
        val cfg = discover()
        val state = random()
        val nonce = random()
        val verifier = random(48)
        val server = listen(if (account == null) PREFERRED_PORT else 0)
        pending = server
        val redirectUri = "http://127.0.0.1:${server.localPort}$CALLBACK_PATH"

        val params = linkedMapOf(
            "client_id" to (account?.clientId ?: "dynamic_agent_client"),
            "ext_agent_host_id" to hostId,
            "response_type" to "code",
            "redirect_uri" to redirectUri,
            "scope" to SCOPES,
            "resource" to RESOURCE,
            "state" to state,
            "nonce" to nonce,
            "code_challenge" to challenge(verifier),
            "code_challenge_method" to "S256",
        )
        if (account == null) params["agent_name_hint"] = APP_NAME
        account?.idToken?.let { params["id_token_hint"] = it }
        account?.email?.takeIf { it.isNotBlank() }?.let { params["login_hint"] = it }
        if (consent) params["prompt"] = "consent"
        val url = cfg.getString("authorization_endpoint") + "?" + params.entries.joinToString("&") { "${it.key}=${enc(it.value)}" }
        pendingUrl = url
        log("authorize: ${if (account == null) "new registration" else "returning client"}, port=${server.localPort}")
        openBrowser(url)

        val query = try {
            waitForCallback(server)
        } finally {
            runCatching { server.close() }
            if (pending === server) pending = null
        }

        if (query["state"] != state) throw AuthException("Sign-in response did not match this attempt. Try again.", "invalid")
        val error = query["error"]
        log("callback: ${error ?: "code received"}, client_id=${query["client_id"] ?: "-"}")
        if (error == "access_denied") {
            // On ChatGPT Free the plan permission is unavailable and only Cancel works on that page
            throw AuthException("Sign-in didn't finish. If you use ChatGPT Free, use bewithflow free on this phone instead.", "plan_unavailable")
        }
        if (error != null) throw AuthException("ChatGPT sign-in failed ($error).", error, account?.clientId ?: query["client_id"])

        val clientId = if (account != null) {
            val returned = query["client_id"]
            if (returned != null && returned != account.clientId) throw AuthException("ChatGPT returned a different app registration. Try signing in again.", "mismatch")
            account.clientId
        } else {
            query["client_id"] ?: throw AuthException("ChatGPT did not finish registering bewithflow. Try again.", "invalid")
        }

        val (status, body) = postForm(
            cfg.getString("token_endpoint"),
            mapOf(
                "grant_type" to "authorization_code",
                "client_id" to clientId,
                "code" to (query["code"] ?: ""),
                "code_verifier" to verifier,
                "redirect_uri" to redirectUri,
                "resource" to RESOURCE,
            ),
        )
        log("token: status=$status ${if (status in 200..299) "" else "error=${body.optString("error")}"}")
        if (status !in 200..299) {
            val code = body.optString("error").ifBlank { "http_$status" }
            val why = body.optString("error_description").takeIf { it.isNotBlank() }?.let { ": $it" } ?: ""
            throw AuthException("ChatGPT sign-in failed at the token step ($code$why). Try again.", code, clientId)
        }
        val claims = verifyIdToken(body.optString("id_token"), clientId, nonce)
        if (account?.sub != null && claims.getString("sub") != account.sub) {
            throw AuthException("You signed in as a different ChatGPT account than ${account.email ?: "the one selected"}.", "mismatch")
        }
        return SignInResult(
            clientId,
            Identity(claims.getString("sub"), claims.optString("email"), claims.optString("name").ifBlank { claims.optString("given_name") }),
            tokenSet(body, null, null),
        )
    }

    /** Accept connections on the loopback socket until the OAuth callback arrives. */
    private fun waitForCallback(server: ServerSocket): Map<String, String> {
        server.soTimeout = SIGN_IN_TIMEOUT_MS
        while (true) {
            val socket = try {
                server.accept()
            } catch (e: SocketTimeoutException) {
                throw AuthException("Sign-in timed out. Try again.", "cancelled")
            } catch (e: IOException) {
                throw AuthException("Sign-in cancelled.", "cancelled")
            }
            socket.use { s ->
                val requestLine = s.getInputStream().bufferedReader().readLine().orEmpty()
                val target = requestLine.split(" ").getOrNull(1).orEmpty()
                val uri = runCatching { URI(target) }.getOrNull()
                val out = s.getOutputStream()
                if (uri?.path != CALLBACK_PATH) {
                    out.write("HTTP/1.1 404 Not Found\r\nContent-Length: 0\r\nConnection: close\r\n\r\n".toByteArray())
                    return@use
                }
                val query = (uri.rawQuery ?: "").split("&").filter { it.contains("=") }.associate {
                    val (k, v) = it.split("=", limit = 2)
                    URLDecoder.decode(k, "UTF-8") to URLDecoder.decode(v, "UTF-8")
                }
                val failed = query.containsKey("error")
                val html = page(
                    if (failed) "Sign-in didn’t finish" else "You’re signed in",
                    if (failed) "Go back to bewithflow to try again." else "Go back to bewithflow and start dictating.",
                ).toByteArray()
                out.write("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nCache-Control: no-store\r\nContent-Length: ${html.size}\r\nConnection: close\r\n\r\n".toByteArray())
                out.write(html)
                out.flush()
                return query
            }
        }
    }

    private fun page(title: String, body: String) = """
        <!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>$title</title>
        <style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#161514;color:#f4f2ee;font:16px/1.5 -apple-system,Roboto,sans-serif}
        main{max-width:420px;padding:28px;text-align:center}h1{font:400 34px Georgia,serif;margin:0 0 8px}p{color:#b9b4ab;margin:0 0 22px}
        a{display:inline-block;padding:14px 22px;border-radius:12px;background:#fff;color:#111;text-decoration:none;font-weight:600}</style></head>
        <body><main><h1>$title</h1><p>$body</p><a href="bewithflow://signed-in">Return to bewithflow</a></main>
        <script>setTimeout(function(){location.href='bewithflow://signed-in'},400)</script></body></html>
    """.trimIndent()

    private fun tokenSet(body: JSONObject, prevRefresh: String?, prevId: String?): Tokens {
        val scopes = body.optString("scope").split(Regex("\\s+")).filter { it.isNotBlank() }
        return Tokens(
            accessToken = body.optString("access_token").ifBlank { null },
            refreshToken = body.optString("refresh_token").ifBlank { prevRefresh },
            idToken = body.optString("id_token").ifBlank { prevId },
            expiresAt = now() + body.optLong("expires_in", 3600) * 1000,
            scopes = scopes,
            planUsage = PLAN_SCOPE in scopes,
        )
    }

    /** Refresh (the refresh token rotates). Throws code "expired" when the user must sign in again. */
    suspend fun refresh(clientId: String, refreshToken: String, idToken: String?): Tokens = withContext(Dispatchers.IO) {
        val (status, body) = postForm(
            discover().getString("token_endpoint"),
            mapOf("grant_type" to "refresh_token", "client_id" to clientId, "refresh_token" to refreshToken, "resource" to RESOURCE),
        )
        if (status !in 200..299) {
            val code = body.optString("error").ifBlank { body.optString("code") }
            val terminal = Regex("invalid_grant|invalid_refresh_token|token_expired|refresh_token_").containsMatchIn(code) || status == 400 || status == 401
            if (terminal) throw AuthException("Your ChatGPT session ended. Sign in again.", "expired")
            throw AuthException("Couldn't renew your ChatGPT session (${code.ifBlank { status.toString() }}).", "network")
        }
        tokenSet(body, refreshToken, idToken)
    }

    /** Revoke the renewable session. True when OpenAI confirmed it. */
    suspend fun revoke(clientId: String, refreshToken: String?): Boolean = withContext(Dispatchers.IO) {
        if (refreshToken == null) return@withContext true
        runCatching {
            postForm(discover().getString("revocation_endpoint"), mapOf("token" to refreshToken, "token_type_hint" to "refresh_token", "client_id" to clientId)).first in 200..299
        }.getOrDefault(false)
    }

    private fun keys(force: Boolean = false): List<JSONObject> {
        if (!force) jwks?.let { return it }
        val arr = get(discover().getString("jwks_uri")).getJSONArray("keys")
        return (0 until arr.length()).map { arr.getJSONObject(it) }.also { jwks = it }
    }

    /** Verify an RS256 ID token against OpenAI's JWKS and check iss/aud/exp/nonce. */
    fun verifyIdToken(idToken: String, clientId: String, nonce: String): JSONObject {
        val parts = idToken.split(".")
        if (parts.size != 3) throw AuthException("ChatGPT returned an invalid identity token.", "invalid")
        val dec = Base64.getUrlDecoder()
        val header = JSONObject(String(dec.decode(parts[0])))
        val claims = JSONObject(String(dec.decode(parts[1])))
        if (header.optString("alg") != "RS256") throw AuthException("Unexpected identity token algorithm.", "invalid")
        val kid = header.optString("kid")
        val jwk = keys().firstOrNull { it.optString("kid") == kid } ?: keys(force = true).firstOrNull { it.optString("kid") == kid }
            ?: throw AuthException("Could not find the key that signed your identity token.", "invalid")
        val key = KeyFactory.getInstance("RSA").generatePublic(
            RSAPublicKeySpec(BigInteger(1, dec.decode(jwk.getString("n"))), BigInteger(1, dec.decode(jwk.getString("e")))),
        )
        val ok = Signature.getInstance("SHA256withRSA").run {
            initVerify(key)
            update("${parts[0]}.${parts[1]}".toByteArray())
            verify(dec.decode(parts[2]))
        }
        if (!ok) throw AuthException("Identity token signature is invalid.", "invalid")
        val aud = claims.opt("aud")
        val audiences = if (aud is org.json.JSONArray) (0 until aud.length()).map { aud.getString(it) } else listOf(aud.toString())
        val nowSec = now() / 1000
        if (claims.optString("iss") != ISSUER) throw AuthException("Identity token came from an unexpected issuer.", "invalid")
        if (clientId !in audiences) throw AuthException("Identity token was issued for a different app.", "invalid")
        if (claims.optLong("exp", 0) + 60 < nowSec) throw AuthException("Identity token has expired. Sign in again.", "invalid")
        if (claims.optString("nonce") != nonce) throw AuthException("Identity token did not match this sign-in attempt.", "invalid")
        if (claims.optString("sub").isBlank()) throw AuthException("Identity token has no account id.", "invalid")
        return claims
    }
}
