package com.bewithflow.app.data

import com.bewithflow.app.auth.ChatGPTAuth
import com.bewithflow.app.core.Snippets
import com.bewithflow.app.core.Styles
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.util.Calendar
import java.util.UUID

/** Encrypts small secrets (tokens). On device: Android Keystore AES-GCM, see [KeystoreVault]. */
interface Vault {
    fun encrypt(plain: String): String
    fun decrypt(sealed: String): String
}

/**
 * Local data in one JSON file in the app's private storage. Accounts are ChatGPT sign-ins (issued
 * client id + verified identity + encrypted tokens) or the on-device Free profile. Settings,
 * dictionary, snippets and history are kept per account.
 */
class Store(private val file: File, private val vault: Vault) {

    data class User(val id: String, val name: String, val email: String, val planUsage: Boolean, val local: Boolean)
    data class Saved(val id: String, val name: String, val email: String, val local: Boolean)
    data class Settings(
        val cleanupLevel: String = "standard",
        val styles: Map<String, String> = Styles.DEFAULTS,
        val language: String = "", // BCP-47; empty = phone's language
        val chatgptModel: String = "",
        val customPrompt: String = "",
        val haptics: Boolean = true,
    )
    data class HistoryItem(val id: String, val at: Long, val text: String, val raw: String, val provider: String, val app: String, val category: String, val latencyMs: Long)
    data class Stats(val streak: Int, val dictations: Int, val totalWords: Int, val wordsThisWeek: Int)

    private var data: JSONObject = load()

    private fun load(): JSONObject = runCatching { JSONObject(file.readText()) }.getOrElse { JSONObject() }.apply {
        if (!has("accounts")) put("accounts", JSONObject())
        if (!has("profiles")) put("profiles", JSONObject())
        if (!has("hostId")) put("hostId", "urn:uuid:${UUID.randomUUID()}")
    }

    @Synchronized
    private fun save() {
        file.parentFile?.mkdirs()
        val tmp = File(file.parentFile, "${file.name}.tmp")
        tmp.writeText(data.toString())
        if (!tmp.renameTo(file)) {
            file.writeText(data.toString())
            tmp.delete()
        }
    }

    init {
        save()
    }

    val hostId: String get() = data.getString("hostId")
    private val accounts get() = data.getJSONObject("accounts")
    private val profiles get() = data.getJSONObject("profiles")
    private val activeId: String? get() = data.optString("active").ifBlank { null }

    // ---------- accounts ----------

    private fun sealTokens(t: ChatGPTAuth.Tokens?): String? = t?.let {
        vault.encrypt(
            JSONObject()
                .put("accessToken", it.accessToken ?: JSONObject.NULL)
                .put("refreshToken", it.refreshToken ?: JSONObject.NULL)
                .put("idToken", it.idToken ?: JSONObject.NULL)
                .put("expiresAt", it.expiresAt)
                .put("scopes", JSONArray(it.scopes))
                .put("planUsage", it.planUsage)
                .toString(),
        )
    }

    @Synchronized
    fun getTokens(id: String? = activeId): ChatGPTAuth.Tokens? {
        val sealed = id?.let { accounts.optJSONObject(it)?.optString("tokens") }?.ifBlank { null } ?: return null
        return runCatching {
            val j = JSONObject(vault.decrypt(sealed))
            val scopes = j.optJSONArray("scopes") ?: JSONArray()
            ChatGPTAuth.Tokens(
                j.optString("accessToken").takeIf { !j.isNull("accessToken") && it.isNotBlank() },
                j.optString("refreshToken").takeIf { !j.isNull("refreshToken") && it.isNotBlank() },
                j.optString("idToken").takeIf { !j.isNull("idToken") && it.isNotBlank() },
                j.optLong("expiresAt"),
                (0 until scopes.length()).map { scopes.getString(it) },
                j.optBoolean("planUsage"),
            )
        }.getOrNull() // unreadable (e.g. keystore reset): treat as signed out
    }

    @Synchronized
    fun setTokens(tokens: ChatGPTAuth.Tokens?, id: String? = activeId) {
        val acct = id?.let { accounts.optJSONObject(it) } ?: return
        acct.put("tokens", sealTokens(tokens) ?: "")
        save()
    }

    @Synchronized
    fun saveSignIn(r: ChatGPTAuth.SignInResult): User {
        val prev = accounts.optJSONObject(r.clientId)
        accounts.put(
            r.clientId,
            JSONObject()
                .put("clientId", r.clientId)
                .put("sub", r.identity.sub)
                .put("email", r.identity.email)
                .put("name", r.identity.name.ifBlank { prev?.optString("name")?.ifBlank { null } ?: r.identity.email.substringBefore("@").ifBlank { "there" } })
                .put("free", !r.tokens.planUsage)
                .put("addedAt", prev?.optLong("addedAt") ?: System.currentTimeMillis())
                .put("tokens", sealTokens(r.tokens)),
        )
        if (!profiles.has(r.clientId)) profiles.put(r.clientId, emptyProfile())
        data.put("active", r.clientId)
        save()
        return currentUser()!!
    }

    /** Free mode: a profile on this phone with no ChatGPT sign-in (ChatGPT Free can't power other apps). */
    @Synchronized
    fun saveLocal(name: String = "You"): User {
        val prev = accounts.optJSONObject("local")
        accounts.put(
            "local",
            JSONObject().put("clientId", "local").put("sub", "local").put("email", "").put("name", prev?.optString("name")?.ifBlank { null } ?: name)
                .put("free", true).put("local", true).put("addedAt", prev?.optLong("addedAt") ?: System.currentTimeMillis())
                .put("tokens", sealTokens(ChatGPTAuth.Tokens(null, null, null, Long.MAX_VALUE, emptyList(), false))),
        )
        if (!profiles.has("local")) profiles.put("local", emptyProfile())
        data.put("active", "local")
        save()
        return currentUser()!!
    }

    @Synchronized
    fun currentUser(): User? {
        val id = activeId ?: return null
        val a = accounts.optJSONObject(id) ?: return null
        val t = getTokens(id) ?: return null
        return User(id, a.optString("name"), a.optString("email"), t.planUsage, a.optBoolean("local"))
    }

    @Synchronized
    fun savedAccounts(): List<Saved> = accounts.keys().asSequence()
        .filter { it != activeId || getTokens(it) == null }
        .map { accounts.getJSONObject(it) }
        .map { Saved(it.getString("clientId"), it.optString("name"), it.optString("email"), it.optBoolean("local")) }
        .toList()

    @Synchronized
    fun registration(id: String): ChatGPTAuth.Account? {
        val a = accounts.optJSONObject(id) ?: return null
        return ChatGPTAuth.Account(a.getString("clientId"), a.optString("sub"), a.optString("email"), getTokens(id)?.idToken)
    }

    @Synchronized
    fun signOut() {
        activeId?.let { accounts.optJSONObject(it)?.put("tokens", "") }
        data.remove("active")
        save()
    }

    @Synchronized
    fun forget() {
        activeId?.let {
            accounts.remove(it)
            profiles.remove(it)
        }
        data.remove("active")
        save()
    }

    /** Copy the Free profile's data to a newly connected ChatGPT account that has none yet. */
    @Synchronized
    fun migrateProfile(fromId: String, toId: String): Boolean {
        val from = profiles.optJSONObject(fromId) ?: return false
        val to = profiles.optJSONObject(toId) ?: return false
        if (fromId == toId || to.getJSONArray("history").length() > 0 || to.getJSONArray("dictionary").length() > 0 || to.getJSONArray("snippets").length() > 0) return false
        profiles.put(toId, JSONObject(from.toString()))
        save()
        return true
    }

    // ---------- profile ----------

    private fun emptyProfile() = JSONObject().put("settings", JSONObject()).put("dictionary", JSONArray()).put("snippets", JSONArray()).put("history", JSONArray()).put("onboarded", false)

    private fun profile(): JSONObject {
        val id = activeId ?: throw IllegalStateException("Sign in first.")
        return profiles.optJSONObject(id) ?: emptyProfile().also { profiles.put(id, it) }
    }

    @Synchronized
    fun settings(): Settings {
        val s = profile().optJSONObject("settings") ?: JSONObject()
        val styles = Styles.DEFAULTS.toMutableMap()
        s.optJSONObject("styles")?.let { o -> o.keys().forEach { k -> styles[k] = o.getString(k) } }
        return Settings(
            cleanupLevel = s.optString("cleanupLevel", "standard"),
            styles = styles,
            language = s.optString("language", ""),
            chatgptModel = s.optString("chatgptModel", ""),
            customPrompt = s.optString("customPrompt", ""),
            haptics = s.optBoolean("haptics", true),
        )
    }

    @Synchronized
    fun updateSettings(change: (Settings) -> Settings): Settings {
        val n = change(settings())
        profile().put(
            "settings",
            JSONObject().put("cleanupLevel", n.cleanupLevel).put("styles", JSONObject(n.styles)).put("language", n.language)
                .put("chatgptModel", n.chatgptModel).put("customPrompt", n.customPrompt).put("haptics", n.haptics),
        )
        save()
        return n
    }

    @Synchronized fun isOnboarded() = profile().optBoolean("onboarded")

    @Synchronized
    fun setOnboarded(v: Boolean = true) {
        profile().put("onboarded", v)
        save()
    }

    // ---------- dictionary ----------

    @Synchronized
    fun dictionary(): List<String> = profile().getJSONArray("dictionary").let { a -> (0 until a.length()).map { a.getString(it) } }

    @Synchronized
    fun addWord(word: String): List<String> {
        val w = word.trim()
        require(w.isNotEmpty()) { "Type a word or phrase first." }
        require(w.length <= 80) { "Keep entries under 80 characters." }
        if (dictionary().none { it.equals(w, ignoreCase = true) }) profile().getJSONArray("dictionary").put(w)
        save()
        return dictionary()
    }

    @Synchronized
    fun removeWord(word: String): List<String> {
        profile().put("dictionary", JSONArray(dictionary().filter { it != word }))
        save()
        return dictionary()
    }

    // ---------- snippets ----------

    @Synchronized
    fun snippets(): List<Snippets.Snippet> = profile().getJSONArray("snippets").let { a ->
        (0 until a.length()).map { a.getJSONObject(it) }.map { Snippets.Snippet(it.getString("id"), it.getString("trigger"), it.getString("expansion")) }
    }

    @Synchronized
    fun saveSnippet(id: String?, trigger: String, expansion: String): List<Snippets.Snippet> {
        val t = trigger.trim()
        val e = expansion.trim()
        require(t.isNotEmpty() && e.isNotEmpty()) { "Enter a snippet and its expansion." }
        require(t.length <= 60) { "Keep the snippet under 60 characters." }
        require(e.length <= 4000) { "This expansion is too long. Please shorten it and try again." }
        require(Regex("[\\p{L}\\p{N}]").containsMatchIn(t)) { "The snippet needs at least one letter or number." }
        val list = snippets().toMutableList()
        require(list.none { it.trigger.equals(t, ignoreCase = true) && it.id != id }) { "\"$t\" already exists in your snippets." }
        if (id != null) {
            val i = list.indexOfFirst { it.id == id }
            require(i >= 0) { "That snippet no longer exists." }
            list[i] = Snippets.Snippet(id, t, e)
        } else list.add(0, Snippets.Snippet(UUID.randomUUID().toString(), t, e))
        profile().put("snippets", JSONArray(list.map { JSONObject().put("id", it.id).put("trigger", it.trigger).put("expansion", it.expansion) }))
        save()
        return snippets()
    }

    @Synchronized
    fun removeSnippet(id: String): List<Snippets.Snippet> {
        profile().put("snippets", JSONArray(snippets().filter { it.id != id }.map { JSONObject().put("id", it.id).put("trigger", it.trigger).put("expansion", it.expansion) }))
        save()
        return snippets()
    }

    // ---------- history ----------

    @Synchronized
    fun addHistory(text: String, raw: String, provider: String, app: String, category: String, latencyMs: Long) {
        val arr = profile().getJSONArray("history")
        val item = JSONObject().put("id", UUID.randomUUID().toString()).put("at", System.currentTimeMillis()).put("text", text).put("raw", raw)
            .put("provider", provider).put("app", app).put("category", category).put("latencyMs", latencyMs)
        val list = mutableListOf(item)
        for (i in 0 until minOf(arr.length(), 499)) list += arr.getJSONObject(i)
        profile().put("history", JSONArray(list))
        save()
    }

    @Synchronized
    fun history(): List<HistoryItem> = profile().getJSONArray("history").let { a ->
        (0 until a.length()).map { a.getJSONObject(it) }.map {
            HistoryItem(it.getString("id"), it.getLong("at"), it.getString("text"), it.optString("raw"), it.optString("provider"), it.optString("app"), it.optString("category"), it.optLong("latencyMs"))
        }
    }

    @Synchronized
    fun deleteHistory(id: String?) {
        profile().put("history", if (id == null) JSONArray() else JSONArray(history().filter { it.id != id }.map { h ->
            JSONObject().put("id", h.id).put("at", h.at).put("text", h.text).put("raw", h.raw).put("provider", h.provider).put("app", h.app).put("category", h.category).put("latencyMs", h.latencyMs)
        }))
        save()
    }

    @Synchronized
    fun stats(): Stats {
        val h = history()
        val words = { t: String -> t.trim().split(Regex("\\s+")).count { it.isNotBlank() } }
        val weekAgo = System.currentTimeMillis() - 7L * 24 * 3600 * 1000
        val days = h.map { dayKey(it.at) }.toSet()
        var streak = 0
        val c = Calendar.getInstance()
        if (dayKey(c.timeInMillis) !in days) c.add(Calendar.DAY_OF_YEAR, -1)
        while (dayKey(c.timeInMillis) in days) {
            streak++
            c.add(Calendar.DAY_OF_YEAR, -1)
        }
        return Stats(streak, h.size, h.sumOf { words(it.text) }, h.filter { it.at >= weekAgo }.sumOf { words(it.text) })
    }

    private fun dayKey(ms: Long): Int = Calendar.getInstance().apply { timeInMillis = ms }.let { it.get(Calendar.YEAR) * 1000 + it.get(Calendar.DAY_OF_YEAR) }
}
