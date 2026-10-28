package com.bewithflow.app.core

/**
 * Voice -> clean text. The phone's speech recognizer produces the raw transcript; the
 * user's ChatGPT plan cleans it with the master prompt; if that isn't available
 * (Free mode, offline, limit reached) a rule-based cleanup still produces usable text.
 */
object Cleanup {
    private val NOISE = Regex("^[\\s.,!?-]*$|^\\s*[\\[(].*[\\])]\\s*$", RegexOption.IGNORE_CASE)
    private val FILLERS = Regex("\\b(?:u+m+|u+h+|e+r+m*|a+h+|h+m+|mhm)\\b[,.]?\\s*", RegexOption.IGNORE_CASE)

    // fillers only ("um, uh") is nothing to clean
    fun isNoise(text: String) = NOISE.matches(text) || NOISE.matches(FILLERS.replace(text, ""))

    /** Minimal offline cleanup: fillers, stutters, dictionary spellings, capitals, end punctuation. */
    fun basic(raw: String, dictionary: List<String> = emptyList()): String {
        var t = " $raw "
        t = FILLERS.replace(t, " ")
        t = Regex("\\b(\\w+)(\\s+\\1\\b)+", RegexOption.IGNORE_CASE).replace(t, "$1")
        for (word in dictionary.map { it.trim() }.filter { it.isNotEmpty() }) {
            t = Regex("(?<![\\p{L}\\p{N}])${Regex.escape(word)}(?![\\p{L}\\p{N}])", RegexOption.IGNORE_CASE).replace(t, Regex.escapeReplacement(word))
        }
        t = Regex("\\s+([,.!?;:])").replace(t, "$1").replace(Regex("\\s{2,}"), " ").trim()
        t = t.replace(Regex("^[,.;:\\s]+"), "")
        if (t.isEmpty()) return ""
        t = t.replaceFirstChar { it.uppercaseChar() }
        t = Regex("([.!?]\\s+)(\\p{Ll})").replace(t) { it.groupValues[1] + it.groupValues[2].uppercase() }
        if (!Regex("[.!?…:\"')\\]]$").containsMatchIn(t)) t += "."
        return t
    }

    /** Strip anything the model wraps around the answer despite instructions. */
    fun tidy(text: String): String = text.trim()
        .replace(Regex("^```[a-z]*\\n?|\\n?```$", RegexOption.IGNORE_CASE), "").trim()
        .replace(Regex("^</?transcript>|</?transcript>$", RegexOption.IGNORE_CASE), "").trim()

    data class Result(val text: String, val raw: String, val provider: String, val warning: String? = null, val errorKind: String? = null)

    data class Settings(val cleanupLevel: String, val styles: Map<String, String>, val customPrompt: String)

    /**
     * @param cleanup ChatGPT call (instructions, input) -> text; null when plan usage isn't available.
     */
    suspend fun process(
        raw: String,
        settings: Settings,
        category: String,
        dictionary: List<String>,
        snippets: List<Snippets.Snippet>,
        cleanup: (suspend (instructions: String, input: String) -> String)?,
    ): Result {
        val trimmed = raw.trim()
        if (trimmed.isEmpty() || isNoise(trimmed)) return Result("", trimmed, "none")
        val (spoken, slots) = Snippets.protect(trimmed, snippets)
        val styleKey = settings.styles[category]
        var warning: String? = null
        var errorKind: String? = null
        if (cleanup != null) {
            val instructions = Prompt.build(settings.cleanupLevel, Styles.instruction(category, styleKey), dictionary, settings.customPrompt)
            try {
                val cleaned = tidy(cleanup(instructions, Prompt.wrapTranscript(spoken)))
                if (cleaned.isNotEmpty()) return Result(Snippets.restore(cleaned, slots), trimmed, "chatgpt")
                warning = "ChatGPT returned no text"
            } catch (e: ChatGPTException) {
                warning = e.message
                errorKind = e.kind
            } catch (e: Exception) {
                warning = e.message
            }
        }
        val text = Snippets.restore(Styles.applyLocally(basic(spoken, dictionary), styleKey), slots)
        return Result(text, trimmed, "local", warning, errorKind)
    }
}

/** kind: auth | limit | ineligible | unsupported | unavailable | network | failed */
class ChatGPTException(message: String, val kind: String, val code: String? = null) : Exception(message)
