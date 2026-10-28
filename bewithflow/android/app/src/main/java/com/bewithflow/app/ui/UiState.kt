package com.bewithflow.app.ui

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import com.bewithflow.app.Engine
import com.bewithflow.app.core.Snippets
import com.bewithflow.app.data.Store
import com.bewithflow.app.net.ChatGPT

/** Snapshot of everything the screens show, refreshed from the store when it changes. */
class UiState {
    lateinit var engine: Engine
    lateinit var actions: Actions

    var user by mutableStateOf<Store.User?>(null)
    var saved by mutableStateOf<List<Store.Saved>>(emptyList())
    var onboarded by mutableStateOf(false)
    var settings by mutableStateOf(Store.Settings())
    var history by mutableStateOf<List<Store.HistoryItem>>(emptyList())
    var stats by mutableStateOf(Store.Stats(0, 0, 0, 0))
    var dictionary by mutableStateOf<List<String>>(emptyList())
    var snippets by mutableStateOf<List<Snippets.Snippet>>(emptyList())
    var models by mutableStateOf<List<ChatGPT.Model>?>(null)
    var hasMic by mutableStateOf(false)
    var keyboardEnabled by mutableStateOf(false)
    var keyboardSelected by mutableStateOf(false)
    var version by mutableIntStateOf(0)

    // sign-in progress
    var signingIn by mutableStateOf(false)
    var signInStatus by mutableStateOf("")
    var signInError by mutableStateOf<String?>(null)
    var planUnavailable by mutableStateOf(false)

    fun bind(engine: Engine, actions: Actions) {
        this.engine = engine
        this.actions = actions
        refresh()
    }

    fun refresh() {
        val s = engine.store
        user = s.currentUser()
        saved = s.savedAccounts()
        if (user != null) {
            onboarded = s.isOnboarded()
            settings = s.settings()
            history = s.history()
            stats = s.stats()
            dictionary = s.dictionary()
            snippets = s.snippets()
        }
        hasMic = actions.hasMic()
        keyboardEnabled = actions.keyboardEnabled()
        keyboardSelected = actions.keyboardSelected()
        version++
    }
}
