package com.bewithflow.app.core

/**
 * Snippets: say a trigger ("my calendly link") and the saved text is inserted.
 * Spoken triggers become ⟦n⟧ placeholders the AI is told to keep, then are swapped back.
 */
object Snippets {
    data class Snippet(val id: String, val trigger: String, val expansion: String)
    data class Protected(val text: String, val slots: List<String>)

    fun pattern(trigger: String): Regex? {
        val words = Regex("[\\p{L}\\p{N}']+").findAll(trigger.lowercase()).map { Regex.escape(it.value) }.toList()
        if (words.isEmpty()) return null
        val body = words.joinToString("[\\s,.!?;:\"'-]+")
        return Regex("(?<![\\p{L}\\p{N}_])$body(?![\\p{L}\\p{N}_])", setOf(RegexOption.IGNORE_CASE))
    }

    /** Replace spoken triggers with ⟦n⟧ placeholders. Longest trigger wins. */
    fun protect(raw: String, snippets: List<Snippet>): Protected {
        val slots = mutableListOf<String>()
        var text = raw
        for (s in snippets.filter { it.trigger.isNotBlank() && it.expansion.isNotBlank() }.sortedByDescending { it.trigger.length }) {
            val re = pattern(s.trigger) ?: continue
            text = re.replace(text) {
                slots += s.expansion
                "⟦${slots.size - 1}⟧"
            }
        }
        return Protected(text, slots)
    }

    /** Swap placeholders back; re-insert any the cleanup dropped. */
    fun restore(text: String, slots: List<String>): String {
        if (slots.isEmpty()) return text
        val used = mutableSetOf<Int>()
        var out = Regex("⟦\\s*(\\d+)\\s*⟧").replace(text) { m ->
            val i = m.groupValues[1].toInt()
            if (i in slots.indices) {
                used += i
                slots[i]
            } else m.value
        }
        slots.forEachIndexed { i, exp ->
            if (i !in used) out = if (out.isEmpty() || out.endsWith(" ")) out + exp else "$out $exp"
        }
        return out
    }
}
