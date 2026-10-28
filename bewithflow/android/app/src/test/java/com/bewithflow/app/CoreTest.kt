package com.bewithflow.app

import com.bewithflow.app.auth.ChatGPTAuth
import com.bewithflow.app.core.ChatGPTException
import com.bewithflow.app.core.Cleanup
import com.bewithflow.app.core.Prompt
import com.bewithflow.app.core.Snippets
import com.bewithflow.app.core.Styles
import com.bewithflow.app.data.Store
import com.bewithflow.app.data.Vault
import com.bewithflow.app.net.ChatGPT
import com.bewithflow.app.net.SseParser
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File
import java.math.BigInteger
import java.security.KeyPairGenerator
import java.security.Signature
import java.security.interfaces.RSAPublicKey
import java.util.Base64

class CoreTest {
    private val settings = Cleanup.Settings("standard", Styles.DEFAULTS, "")

    @Test fun masterPromptCarriesRulesStyleAndDictionary() {
        val p = Prompt.build("polished", Styles.instruction("personal", "veryCasual"), listOf("Laksh"))
        assertTrue(p.contains("Self-corrections"))
        assertTrue(p.contains("POLISHED"))
        assertTrue(p.contains("Very casual"))
        assertTrue(p.endsWith("exactly like this: Laksh"))
        assertEquals(8, Prompt.exampleTurns().size)
        assertTrue(Prompt.build(customPrompt = "Only fix typos.").startsWith("Only fix typos."))
    }

    @Test fun stylesFollowTheApp() {
        assertEquals("personal", Styles.categorize("com.whatsapp"))
        assertEquals("personal", Styles.categorize("com.whatsapp.w4b"))
        assertEquals("work", Styles.categorize("com.Slack"))
        assertEquals("email", Styles.categorize("com.google.android.gm"))
        assertEquals("other", Styles.categorize("com.android.chrome"))
        assertEquals("other", Styles.categorize(null))
        assertEquals("are you free at 8? see you then", Styles.applyLocally("Are you free at 8? See you then.", "veryCasual"))
        assertEquals("Shipped it!", Styles.applyLocally("Shipped it.", "excited"))
    }

    @Test fun snippetsExpandAndSurviveCleanup() {
        val list = listOf(Snippets.Snippet("1", "my calendly link", "https://calendly.com/laksh"), Snippets.Snippet("2", "my link", "SHORT"))
        val p = Snippets.protect("Sure, here is My Calendly Link. Thanks", list)
        assertEquals("Sure, here is ⟦0⟧. Thanks", p.text)
        assertEquals("Sure, here is https://calendly.com/laksh. Thanks!", Snippets.restore("Sure, here is ⟦0⟧. Thanks!", p.slots))
        assertEquals("Hi https://calendly.com/laksh", Snippets.restore("Hi", p.slots))
        assertEquals(0, Snippets.protect("the mylink thing", list).slots.size)
    }

    @Test fun basicCleanupRemovesFillersAndFixesCase() {
        assertEquals("So i talked to Laksh about Supabase.", Cleanup.basic("um so i talked to laksh uh about supabase", listOf("Laksh", "Supabase")))
        assertEquals("Send the invoice.", Cleanup.basic("uh send the the invoice"))
        assertEquals("", Cleanup.basic("um uh"))
    }

    @Test fun pipelineUsesChatGPTThenFallsBack() = runTest {
        var seen = ""
        val ok = Cleanup.process("um lets meet at three no wait four", settings, "personal", emptyList(), emptyList()) { ins, input ->
            seen = ins + input
            "Let's meet at 4"
        }
        assertEquals("chatgpt", ok.provider)
        assertTrue(seen.contains("<transcript>"))
        val failed = Cleanup.process("uh send the the invoice", settings, "other", emptyList(), emptyList()) { _, _ -> throw ChatGPTException("limit", "limit") }
        assertEquals("local", failed.provider)
        assertEquals("limit", failed.errorKind)
        assertEquals("Send the invoice.", failed.text)
        val free = Cleanup.process("hello there", settings, "other", emptyList(), emptyList(), null)
        assertEquals("Hello there.", free.text)
        val empty = Cleanup.process("[noise]", settings, "other", emptyList(), emptyList(), null)
        assertEquals("", empty.text)
        val blankAi = Cleanup.process("that is fine", settings, "other", emptyList(), emptyList()) { _, _ -> "" }
        assertEquals("That is fine.", blankAi.text) // an empty AI reply never types nothing
    }

    @Test fun sseParserAndErrors() {
        val events = SseParser.events("event: x\ndata: {\"type\":\"response.output_text.delta\",\"delta\":\"Hi\"}\n\ndata: {\"type\":\"response.completed\"}\n\n")
        assertEquals(listOf("response.output_text.delta", "response.completed"), events.map { it.getString("type") })
        assertEquals("limit", ChatGPT.errorFor(429, "{\"error\":{\"code\":\"subscription_sharing_usage_limit_exceeded\"}}").kind)
        assertEquals("ineligible", ChatGPT.errorFor(403, "{\"error\":{\"code\":\"subscription_sharing_user_not_eligible\"}}").kind)
        assertEquals("small-mini", ChatGPT.pickDefaultModel(listOf(ChatGPT.Model("big", "Big"), ChatGPT.Model("small-mini", "Small"))))
    }

    @Test fun pkceAndIdTokenVerification() {
        assertEquals("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM", ChatGPTAuth.challenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk")) // RFC 7636 test vector
        val kp = KeyPairGenerator.getInstance("RSA").apply { initialize(2048) }.genKeyPair()
        val pub = kp.public as RSAPublicKey
        val enc = Base64.getUrlEncoder().withoutPadding()
        fun b64(i: BigInteger) = enc.encodeToString(i.toByteArray().let { if (it[0] == 0.toByte()) it.copyOfRange(1, it.size) else it })
        val header = enc.encodeToString("""{"alg":"RS256","kid":"k1"}""".toByteArray())
        val now = System.currentTimeMillis()
        fun token(nonce: String): String {
            val claims = enc.encodeToString("""{"iss":"https://auth.openai.com","aud":"oaiapp_1","sub":"u1","email":"a@b.co","nonce":"$nonce","exp":${now / 1000 + 3600}}""".toByteArray())
            val sig = Signature.getInstance("SHA256withRSA").apply { initSign(kp.private); update("$header.$claims".toByteArray()) }.sign()
            return "$header.$claims.${enc.encodeToString(sig)}"
        }
        val auth = ChatGPTAuth()
        val f = ChatGPTAuth::class.java.getDeclaredField("jwks").apply { isAccessible = true }
        f.set(auth, listOf(org.json.JSONObject().put("kid", "k1").put("n", b64(pub.modulus)).put("e", b64(pub.publicExponent))))
        val cfg = ChatGPTAuth::class.java.getDeclaredField("config").apply { isAccessible = true }
        cfg.set(auth, org.json.JSONObject().put("jwks_uri", "https://example.invalid/jwks"))
        assertEquals("u1", auth.verifyIdToken(token("n1"), "oaiapp_1", "n1").getString("sub"))
        val bad = runCatching { auth.verifyIdToken(token("other"), "oaiapp_1", "n1") }.exceptionOrNull()
        assertTrue(bad is ChatGPTAuth.AuthException)
        val wrongAud = runCatching { auth.verifyIdToken(token("n1"), "oaiapp_2", "n1") }.exceptionOrNull()
        assertTrue(wrongAud is ChatGPTAuth.AuthException)
    }

    @Test fun storeKeepsAccountsTokensAndProfiles() {
        val dir = createTempDir()
        val vault = object : Vault {
            override fun encrypt(plain: String) = "enc:" + Base64.getEncoder().encodeToString(plain.toByteArray())
            override fun decrypt(sealed: String) = String(Base64.getDecoder().decode(sealed.removePrefix("enc:")))
        }
        val file = File(dir, "bewithflow.json")
        val s = Store(file, vault)
        assertNull(s.currentUser())
        s.saveLocal("Anurag")
        s.addWord("Shadu")
        s.saveSnippet(null, "my link", "https://x.y")
        s.addHistory("hello", "um hello", "local", "WhatsApp", "personal", 900)
        assertEquals(1, s.stats().streak)
        val tokens = ChatGPTAuth.Tokens("secret-at", "secret-rt", "id", System.currentTimeMillis() + 3_600_000, listOf("chatgpt.tokens.use.direct"), true)
        s.saveSignIn(ChatGPTAuth.SignInResult("oaiapp_9", ChatGPTAuth.Identity("u9", "a@b.co", "Anurag"), tokens))
        assertTrue(s.migrateProfile("local", "oaiapp_9"))
        assertEquals(listOf("Shadu"), s.dictionary())
        assertEquals(1, s.history().size)
        assertTrue(s.currentUser()!!.planUsage)
        assertFalse(file.readText().contains("secret-at"))
        val again = Store(file, vault)
        assertEquals("secret-rt", again.getTokens()!!.refreshToken)
        again.signOut()
        assertNull(again.currentUser())
        assertEquals(2, again.savedAccounts().size)
        val bad = runCatching { again.saveLocal(); again.saveSnippet(null, "My Link", "dup") }.exceptionOrNull()
        assertTrue(bad?.message?.contains("already exists") == true)
    }
}
