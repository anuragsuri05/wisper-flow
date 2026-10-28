package com.bewithflow.app.ime

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import androidx.core.content.ContextCompat

/**
 * Debug builds only: stand in for the speech recognizer so the keyboard can be tested end to end
 * on emulators, which have no voice input:
 *   adb shell am broadcast -a com.bewithflow.app.debug.DICTATE --es text "um hello"
 * @return unregisters the hook
 */
object TestHooks {
    fun install(context: Context, onDictation: (String) -> Unit): () -> Unit {
        val receiver = object : BroadcastReceiver() {
            override fun onReceive(c: Context, intent: Intent) {
                intent.getStringExtra("text")?.let(onDictation)
            }
        }
        ContextCompat.registerReceiver(context, receiver, IntentFilter("com.bewithflow.app.debug.DICTATE"), ContextCompat.RECEIVER_EXPORTED)
        return { context.unregisterReceiver(receiver) }
    }
}
