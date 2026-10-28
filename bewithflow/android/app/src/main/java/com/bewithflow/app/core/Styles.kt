package com.bewithflow.app.core

/** Styles follow the app you dictate into: casual in WhatsApp, formal in email. */
object Styles {
    data class Style(val id: String, val label: String, val desc: String, val instruction: String)
    data class Category(val id: String, val label: String, val apps: String, val styles: List<String>, val default: String, val sample: String, val extra: String = "")

    val STYLES = listOf(
        Style("formal", "Formal.", "Caps + punctuation", "STYLE: Formal. Use full sentence capitalization and complete punctuation."),
        Style("casual", "Casual", "Caps + less punctuation", "STYLE: Casual. Capitalize sentences but keep punctuation light: no period after the final sentence, commas only where needed."),
        Style("veryCasual", "very casual", "No caps + less punctuation", "STYLE: Very casual. Write everything in lowercase, use minimal punctuation and no period at the end, like a quick text message. Keep question marks."),
        Style("excited", "Excited!", "More exclamations", "STYLE: Excited. Keep the same words, but end upbeat sentences with exclamation marks where it fits naturally."),
    ).associateBy { it.id }

    val CATEGORIES = listOf(
        Category("personal", "Personal messages", "WhatsApp, Messages, Telegram, Signal, Instagram", listOf("formal", "casual", "veryCasual"), "casual",
            "Hey, are you free for lunch tomorrow? Let's do 12 if that works for you."),
        Category("work", "Work messages", "Slack, Teams, Google Chat, Discord, LinkedIn", listOf("formal", "casual", "excited"), "casual",
            "Hey team, the build is green. Let's ship the update this afternoon."),
        Category("email", "Email", "Gmail, Outlook, Spark, Proton Mail", listOf("formal", "casual", "excited"), "formal",
            "Hi Sam,\n\nThanks for sending the proposal. I reviewed it and it looks great.\n\nBest,\nLaksh",
            "This is an email. When the speaker dictates a greeting or sign-off, put each on its own line with a blank line around the body."),
        Category("other", "Other", "Notes, documents, browsers and everything else", listOf("formal", "casual", "excited"), "formal",
            "Remember to book flights for the conference. Check prices on Friday."),
    ).associateBy { it.id }

    val DEFAULTS: Map<String, String> = CATEGORIES.mapValues { it.value.default }

    private val PERSONAL = Regex("whatsapp|com\\.google\\.android\\.apps\\.messaging|telegram|signal|com\\.facebook\\.orca|instagram|snapchat|viber|wechat|jp\\.naver\\.line|com\\.samsung\\.android\\.messaging|beeper", RegexOption.IGNORE_CASE)
    private val WORK = Regex("com\\.slack|com\\.microsoft\\.teams|com\\.google\\.android\\.apps\\.dynamite|discord|com\\.linkedin|zoom|webex|mattermost", RegexOption.IGNORE_CASE)
    private val EMAIL = Regex("com\\.google\\.android\\.gm|outlook|com\\.microsoft\\.office\\.outlook|readdle\\.spark|protonmail|ch\\.protonmail|com\\.yahoo\\.mobile\\.client\\.android\\.mail|superhuman|com\\.samsung\\.android\\.email", RegexOption.IGNORE_CASE)

    /** Category from the package name of the app showing the keyboard. */
    fun categorize(packageName: String?): String = when {
        packageName.isNullOrBlank() -> "other"
        PERSONAL.containsMatchIn(packageName) -> "personal"
        WORK.containsMatchIn(packageName) -> "work"
        EMAIL.containsMatchIn(packageName) -> "email"
        else -> "other"
    }

    /** Deterministic style pass for on-device cleanup and previews. */
    fun applyLocally(text: String, style: String?): String {
        var t = text
        if (t.isEmpty()) return t
        if (style == "casual" || style == "veryCasual") t = t.replace(Regex("\\.\\s*$"), "")
        if (style == "veryCasual") t = t.lowercase()
        if (style == "excited") t = t.replace(Regex("\\.(\\s*)$"), "!$1")
        return t
    }

    fun instruction(category: String, style: String?): String {
        val cat = CATEGORIES[category] ?: CATEGORIES.getValue("other")
        val s = STYLES[style ?: cat.default] ?: STYLES.getValue(cat.default)
        return listOf("WHERE: the speaker is writing in ${cat.label.lowercase()}.", s.instruction, cat.extra).filter { it.isNotBlank() }.joinToString(" ")
    }
}
