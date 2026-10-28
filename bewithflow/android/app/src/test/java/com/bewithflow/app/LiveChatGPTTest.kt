package com.bewithflow.app

import com.bewithflow.app.core.Cleanup
import com.bewithflow.app.core.Prompt
import com.bewithflow.app.core.Styles
import com.bewithflow.app.net.ChatGPT
import kotlinx.coroutines.runBlocking
import org.json.JSONObject
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File

/**
 * Real ChatGPT round trips through the Android networking and cleanup code. Skipped unless
 * BWF_LIVE_TOKEN_FILE points to {"token": "...", "model": "..."} for a signed-in Plus/Pro account.
 *   BWF_LIVE_TOKEN_FILE=/path/token.json ./gradlew testDebugUnitTest --tests '*LiveChatGPTTest*'
 */
class LiveChatGPTTest {
    private val creds = System.getenv("BWF_LIVE_TOKEN_FILE")?.let { File(it) }?.takeIf { it.exists() }?.let { JSONObject(it.readText()) }
    private val chatgpt = ChatGPT()
    private val settings = Cleanup.Settings("standard", Styles.DEFAULTS, "")

    private fun clean(raw: String, category: String): Cleanup.Result = runBlocking {
        val token = creds!!.getString("token")
        val model = creds.getString("model")
        val started = System.currentTimeMillis()
        Cleanup.process(raw, settings, category, emptyList(), emptyList()) { instructions, input ->
            chatgpt.respond(token, model, instructions, input, Prompt.exampleTurns())
        }.also { report("[$category] ${System.currentTimeMillis() - started} ms  ${it.provider}\n  in : $raw\n  out: ${it.text}") }
    }

    private fun report(line: String) {
        println(line)
        System.getenv("BWF_LIVE_OUT")?.let { File(it).appendText("$line\n") }
    }

    @Test fun cleansRealDictationsWithTheUsersPlan() {
        assumeTrue("no live ChatGPT token", creds != null)
        val models = runBlocking { chatgpt.listModels(creds!!.getString("token")) }
        report("models: ${models.joinToString { it.slug }}")
        assertTrue(models.isNotEmpty())

        val correction = clean("um so can we meet at three, no wait, four tomorrow", "personal")
        assertEquals("chatgpt", correction.provider)
        assertTrue(correction.text, correction.text.contains("4") || correction.text.contains("four", ignoreCase = true))
        assertFalse(correction.text, correction.text.contains("three", ignoreCase = true) || correction.text.contains("3"))

        val fillers = clean("hey uh can you like send me the uh report by friday thanks", "work")
        assertFalse(fillers.text, Regex("\\b(uh|um|like)\\b", RegexOption.IGNORE_CASE).containsMatchIn(fillers.text))

        val hinglish = clean("bhai kal ki meeting cancel ho gayi hai so let's catch up on friday", "personal")
        assertFalse("must stay in Latin letters: ${hinglish.text}", hinglish.text.any { it in 'ऀ'..'ॿ' })
        assertTrue(hinglish.text, hinglish.text.contains("kal", ignoreCase = true) && hinglish.text.contains("Friday"))

        val notAChatbot = clean("what time is the standup tomorrow", "work")
        assertTrue("must not answer the question: ${notAChatbot.text}", notAChatbot.text.length < 60 && Regex("stand-?up", RegexOption.IGNORE_CASE).containsMatchIn(notAChatbot.text))

        clean("hi sarah comma thanks for the update period I will review the draft and get back to you tomorrow period", "email")
        assertEquals("none", clean("um uh", "other").provider)
    }
}
