package com.bewithflow.app

import android.content.Context
import com.bewithflow.app.auth.ChatGPTAuth
import com.bewithflow.app.core.ChatGPTException
import com.bewithflow.app.core.Cleanup
import com.bewithflow.app.core.Prompt
import com.bewithflow.app.core.Styles
import com.bewithflow.app.data.KeystoreVault
import com.bewithflow.app.data.Store
import com.bewithflow.app.net.ChatGPT
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import java.io.File

/**
 * Everything the keyboard and the app share: account, ChatGPT session, settings and the
 * dictation pipeline. One instance per process (see [BewithflowApp]).
 */
class Engine(context: Context) {
    private val logFile = File(context.filesDir, "logs/signin.log")
    val store = Store(File(context.filesDir, "bewithflow.json"), KeystoreVault())
    val auth = ChatGPTAuth(log = { line ->
        runCatching {
            logFile.parentFile?.mkdirs()
            logFile.appendText("${java.time.Instant.now()} $line\n")
        }
    })
    val chatgpt = ChatGPT()

    private val _changes = MutableSharedFlow<String>(extraBufferCapacity = 8)
    /** Emits "history", "account" or "settings" when something the UI shows changed. */
    val changes = _changes.asSharedFlow()
    fun notify(what: String) { _changes.tryEmit(what) }

    // ---------- ChatGPT session ----------

    private val refreshLock = Mutex()
    private var models: List<ChatGPT.Model>? = null

    /** A valid access token, refreshed when close to expiry. */
    suspend fun accessToken(force: Boolean = false): String = refreshLock.withLock {
        val user = store.currentUser() ?: throw ChatGPTException("Sign in with ChatGPT first.", "auth")
        val tokens = store.getTokens() ?: throw ChatGPTException("Sign in with ChatGPT first.", "auth")
        if (!force && tokens.accessToken != null && tokens.expiresAt - 2 * 60 * 1000 > System.currentTimeMillis()) return tokens.accessToken
        val refresh = tokens.refreshToken ?: throw ChatGPTException("Sign in with ChatGPT again.", "auth")
        try {
            val next = auth.refresh(user.id, refresh, tokens.idToken)
            store.setTokens(next, user.id)
            next.accessToken ?: throw ChatGPTException("Sign in with ChatGPT again.", "auth")
        } catch (e: ChatGPTAuth.AuthException) {
            if (e.code == "expired") {
                store.signOut()
                notify("account")
            }
            throw ChatGPTException(e.message ?: "Sign in again.", "auth")
        }
    }

    private suspend fun <T> withToken(block: suspend (String) -> T): T = try {
        block(accessToken())
    } catch (e: ChatGPTException) {
        if (e.kind != "auth") throw e
        block(accessToken(force = true)) // one retry with a renewed token
    }

    suspend fun models(refresh: Boolean = false): List<ChatGPT.Model> {
        if (!refresh) models?.let { return it }
        val list = withToken { chatgpt.listModels(it) }
        models = list
        val s = store.settings()
        if (s.chatgptModel.isBlank() || list.none { it.slug == s.chatgptModel }) store.updateSettings { it.copy(chatgptModel = ChatGPT.pickDefaultModel(list)) }
        return list
    }

    /** Renew the session in the background so it never happens mid-dictation. */
    suspend fun keepFresh() {
        val user = store.currentUser() ?: return
        if (!user.planUsage) return
        val t = store.getTokens() ?: return
        if (t.refreshToken != null && t.expiresAt - System.currentTimeMillis() < 10 * 60 * 1000) runCatching { accessToken(force = true) }
    }

    /** Called when the mic opens: warm the connection so cleanup doesn't pay for the handshake. */
    fun onListeningStarted() {
        if (store.currentUser()?.planUsage == true) chatgpt.warm()
    }

    // ---------- sign-in ----------

    suspend fun signIn(accountId: String?, openBrowser: (String) -> Unit, onStatus: (String) -> Unit): Store.User {
        val previous = store.currentUser()
        val account = accountId?.let { store.registration(it) }
        val result = auth.signIn(store.hostId, account, consent = false, openBrowser = openBrowser, onStatus = onStatus)
        store.saveSignIn(result)
        if (previous?.local == true) store.migrateProfile(previous.id, result.clientId)
        models = null
        if (result.tokens.planUsage) runCatching { models(refresh = true) }
        notify("account")
        return store.currentUser()!!
    }

    fun useFree(name: String) {
        store.saveLocal(name)
        notify("account")
    }

    suspend fun signOut(): Boolean {
        val user = store.currentUser()
        val revoked = if (user != null && !user.local) auth.revoke(user.id, store.getTokens()?.refreshToken) else true
        store.signOut()
        models = null
        notify("account")
        return revoked
    }

    suspend fun forget() {
        val user = store.currentUser()
        if (user != null && !user.local) auth.revoke(user.id, store.getTokens()?.refreshToken)
        store.forget()
        models = null
        notify("account")
    }

    // ---------- dictation ----------

    /**
     * Clean one transcript for the app it's typed into, record it in history.
     * @param releasedAt when the user finished speaking (for the latency shown in history)
     */
    suspend fun process(raw: String, packageName: String?, appLabel: String, releasedAt: Long): Cleanup.Result {
        val user = store.currentUser() ?: throw IllegalStateException("Open bewithflow to sign in.")
        val s = store.settings()
        val category = Styles.categorize(packageName)
        val cleanup: (suspend (String, String) -> String)? = if (user.planUsage) { instructions, input ->
            var model = store.settings().chatgptModel
            if (model.isBlank()) {
                models(refresh = true)
                model = store.settings().chatgptModel
            }
            if (model.isBlank()) throw ChatGPTException("Your ChatGPT account has no models available to bewithflow.", "unsupported")
            withToken { token -> chatgpt.respond(token, model, instructions, input, Prompt.exampleTurns()) }
        } else null
        val result = Cleanup.process(
            raw,
            Cleanup.Settings(s.cleanupLevel, s.styles, s.customPrompt),
            category,
            store.dictionary(),
            store.snippets(),
            cleanup,
        )
        if (result.text.isNotEmpty()) {
            store.addHistory(result.text, result.raw, result.provider, appLabel, category, System.currentTimeMillis() - releasedAt)
            notify("history")
        }
        return result
    }
}
