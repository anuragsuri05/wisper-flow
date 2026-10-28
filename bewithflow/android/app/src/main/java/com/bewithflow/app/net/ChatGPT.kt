package com.bewithflow.app.net

import com.bewithflow.app.core.ChatGPTException
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Call
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

/**
 * Responses API on the user's ChatGPT plan (OAuth access token).
 * Plan-usage rules: store=false, stream=true, instructions instead of system messages.
 * Success only on `response.completed`.
 */
class ChatGPT(private val client: OkHttpClient = defaultClient) {

    data class Model(val slug: String, val name: String)

    companion object {
        private const val API = "https://api.openai.com/v1"
        const val USAGE_URL = "https://chatgpt.com/settings/usage"

        /** One shared client: connection reuse means no new TLS handshake per dictation. */
        val defaultClient: OkHttpClient = OkHttpClient.Builder()
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(12, TimeUnit.SECONDS) // no data for 12 s mid-reply: give up and fall back
            .callTimeout(30, TimeUnit.SECONDS)
            .retryOnConnectionFailure(true)
            .build()

        fun pickDefaultModel(models: List<Model>): String =
            (models.firstOrNull { Regex("mini|fast|instant|nano|lite|luna", RegexOption.IGNORE_CASE).containsMatchIn("${it.slug} ${it.name}") } ?: models.firstOrNull())?.slug ?: ""

        fun errorFor(status: Int, body: String?): ChatGPTException {
            val json = runCatching { JSONObject(body ?: "") }.getOrNull()
            val err = json?.optJSONObject("error")
            val code = err?.optString("code").orEmpty()
            val detail = err?.optString("message")?.takeIf { it.isNotBlank() } ?: json?.optString("detail").orEmpty()
            return when (code) {
                "subscription_sharing_usage_limit_exceeded" -> ChatGPTException("You reached the ChatGPT usage limit for bewithflow. Raise it in ChatGPT Settings → Usage.", "limit", code)
                "subscription_sharing_user_not_eligible" -> ChatGPTException("Your ChatGPT plan can’t be used in other apps. bewithflow needs ChatGPT Plus or Pro.", "ineligible", code)
                "subscription_sharing_usage_unavailable", "subscription_sharing_user_unavailable" -> ChatGPTException("ChatGPT couldn’t check your plan right now. Try again in a moment.", "unavailable", code)
                "subscription_sharing_unsupported_capability" -> ChatGPTException("ChatGPT doesn’t support this request. Pick another model in Settings.", "unsupported", code)
                "subscription_sharing_invalid_user" -> ChatGPTException("ChatGPT couldn’t verify your account. Sign in again.", "auth", code)
                else -> when {
                    status == 401 -> ChatGPTException("ChatGPT didn’t accept your sign-in. Sign in again.", "auth", code)
                    status == 403 -> ChatGPTException("ChatGPT blocked this request${if (detail.isNotBlank()) ": ${detail.take(140)}" else ""}.", "ineligible", code)
                    status == 404 -> ChatGPTException("That ChatGPT model isn’t available to your account. Pick another in Settings.", "unsupported", code)
                    status == 429 -> ChatGPTException("ChatGPT is rate limiting requests. Try again shortly.", "limit", code)
                    status >= 500 -> ChatGPTException("ChatGPT is having problems right now.", "unavailable", code)
                    else -> ChatGPTException("ChatGPT request failed ($status${if (detail.isNotBlank()) ": ${detail.take(140)}" else ""}).", "failed", code)
                }
            }
        }
    }

    suspend fun listModels(token: String): List<Model> = withContext(Dispatchers.IO) {
        val req = Request.Builder().url("$API/models").header("Authorization", "Bearer $token").build()
        val res = try {
            client.newCall(req).execute()
        } catch (e: IOException) {
            throw ChatGPTException("Can’t reach ChatGPT. Check your internet connection.", "network")
        }
        res.use {
            val body = it.body?.string()
            if (!it.isSuccessful) throw errorFor(it.code, body)
            val json = JSONObject(body ?: "{}")
            val arr = json.optJSONArray("models") ?: json.optJSONArray("data") ?: JSONArray()
            (0 until arr.length()).map { i -> arr.getJSONObject(i) }
                .filter { m -> !m.has("visibility") || m.optString("visibility") == "list" }
                .mapNotNull { m ->
                    val slug = m.optString("slug").ifBlank { m.optString("id") }
                    if (slug.isBlank()) null else Model(slug, m.optString("display_name").ifBlank { slug })
                }
        }
    }

    /** Opens the connection while you're still talking, so the cleanup request doesn't pay for it. */
    fun warm() {
        val req = Request.Builder().url("$API/models").head().build()
        client.newCall(req).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: Call, e: IOException) {}
            override fun onResponse(call: Call, response: okhttp3.Response) = response.close()
        })
    }

    /**
     * One cleanup. [reasoningOff] sends reasoning.effort=none (faster); models that reject it
     * are retried without.
     */
    suspend fun respond(
        token: String,
        model: String,
        instructions: String,
        input: String,
        examples: List<Pair<String, String>>,
        reasoningOff: Boolean = true,
    ): String = withContext(Dispatchers.IO) {
        try {
            stream(token, model, instructions, input, examples, reasoningOff)
        } catch (e: ChatGPTException) {
            if (reasoningOff && Regex("reasoning|effort", RegexOption.IGNORE_CASE).containsMatchIn(e.message.orEmpty())) {
                stream(token, model, instructions, input, examples, false)
            } else throw e
        }
    }

    private fun stream(token: String, model: String, instructions: String, input: String, examples: List<Pair<String, String>>, reasoningOff: Boolean): String {
        val messages = JSONArray()
        for ((role, content) in examples) messages.put(JSONObject().put("role", role).put("content", content))
        messages.put(JSONObject().put("role", "user").put("content", input))
        val body = JSONObject()
            .put("model", model)
            .put("instructions", instructions)
            .put("input", messages)
            .put("store", false)
            .put("stream", true)
        if (reasoningOff) body.put("reasoning", JSONObject().put("effort", "none"))

        val req = Request.Builder()
            .url("$API/responses")
            .header("Authorization", "Bearer $token")
            .header("Accept", "text/event-stream")
            .post(body.toString().toRequestBody("application/json".toMediaType()))
            .build()
        val res = try {
            client.newCall(req).execute()
        } catch (e: java.io.InterruptedIOException) {
            throw ChatGPTException("ChatGPT took too long to answer.", "network")
        } catch (e: IOException) {
            throw ChatGPTException("Can’t reach ChatGPT. Check your internet connection.", "network")
        }
        res.use { response ->
            if (!response.isSuccessful) throw errorFor(response.code, response.body?.string())
            val source = response.body?.source() ?: throw ChatGPTException("ChatGPT returned an empty response.", "failed")
            val text = StringBuilder()
            try {
                for (event in SseParser.events(source)) {
                    when (event.optString("type")) {
                        "response.output_text.delta" -> text.append(event.optString("delta"))
                        "response.completed" -> return text.toString().ifEmpty { textFromResponse(event.optJSONObject("response")) }
                        "response.failed" -> throw errorFor(200, JSONObject().put("error", event.optJSONObject("response")?.optJSONObject("error") ?: JSONObject()).toString())
                        "response.incomplete" -> throw ChatGPTException("ChatGPT stopped before finishing.", "failed")
                        "error" -> throw errorFor(200, JSONObject().put("error", event.optJSONObject("error") ?: event).toString())
                    }
                }
            } catch (e: ChatGPTException) {
                throw e
            } catch (e: java.io.InterruptedIOException) {
                throw ChatGPTException("ChatGPT stopped responding mid-answer.", "network")
            } catch (e: IOException) {
                throw ChatGPTException("The connection to ChatGPT dropped mid-answer.", "network")
            }
            throw ChatGPTException("ChatGPT ended the answer without completing it.", "failed")
        }
    }

    private fun textFromResponse(response: JSONObject?): String {
        val out = response?.optJSONArray("output") ?: return ""
        val sb = StringBuilder()
        for (i in 0 until out.length()) {
            val content = out.getJSONObject(i).optJSONArray("content") ?: continue
            for (j in 0 until content.length()) {
                val c = content.getJSONObject(j)
                if (c.optString("type") == "output_text") sb.append(c.optString("text"))
            }
        }
        return sb.toString()
    }
}

/** Server-Sent Events: yields each `data:` JSON payload. */
object SseParser {
    fun events(source: okio.BufferedSource): Sequence<JSONObject> = sequence {
        val data = StringBuilder()
        while (true) {
            val line = source.readUtf8Line() ?: break
            if (line.isEmpty()) {
                val payload = data.toString().trim()
                data.clear()
                if (payload.isNotEmpty() && payload != "[DONE]") runCatching { JSONObject(payload) }.getOrNull()?.let { yield(it) }
            } else if (line.startsWith("data:")) {
                if (data.isNotEmpty()) data.append('\n')
                data.append(line.removePrefix("data:").trimStart())
            }
        }
        val tail = data.toString().trim()
        if (tail.isNotEmpty() && tail != "[DONE]") runCatching { JSONObject(tail) }.getOrNull()?.let { yield(it) }
    }

    fun events(text: String): List<JSONObject> = events(okio.Buffer().writeUtf8(text)).toList()
}
