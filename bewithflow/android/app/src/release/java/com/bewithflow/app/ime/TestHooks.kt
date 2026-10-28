package com.bewithflow.app.ime

import android.content.Context

/** Release builds have no test hooks (see the debug source set). */
object TestHooks {
    @Suppress("UNUSED_PARAMETER")
    fun install(context: Context, onDictation: (String) -> Unit): (() -> Unit)? = null
}
