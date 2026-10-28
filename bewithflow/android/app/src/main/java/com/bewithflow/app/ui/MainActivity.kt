package com.bewithflow.app.ui

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Bundle
import android.provider.Settings
import android.view.inputmethod.InputMethodManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.bewithflow.app.BewithflowApp
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    private val engine get() = BewithflowApp.from(this).engine
    private val micPermission = registerForActivityResult(ActivityResultContracts.RequestPermission()) { ui.refresh() }
    private val ui = UiState()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        ui.bind(engine, actions)
        lifecycleScope.launch { engine.changes.collect { ui.refresh() } }
        setContent { BewithflowTheme { App(ui) } }
    }

    override fun onResume() {
        super.onResume()
        ui.refresh() // permissions or keyboard settings may have changed while away
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        ui.refresh() // back from the browser after signing in
    }

    val actions = object : Actions {
        override fun openBrowser(url: String) {
            CustomTabsIntent.Builder().setShowTitle(true).build().launchUrl(this@MainActivity, Uri.parse(url))
        }
        override fun open(url: String) {
            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
        }
        override fun requestMic() = micPermission.launch(Manifest.permission.RECORD_AUDIO)
        override fun hasMic() = ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED
        override fun openKeyboardSettings() = startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
        override fun showKeyboardPicker() = (getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager).showInputMethodPicker()
        override fun keyboardEnabled(): Boolean {
            val imm = getSystemService(INPUT_METHOD_SERVICE) as InputMethodManager
            return imm.enabledInputMethodList.any { it.packageName == packageName }
        }
        override fun keyboardSelected(): Boolean =
            Settings.Secure.getString(contentResolver, Settings.Secure.DEFAULT_INPUT_METHOD)?.startsWith("$packageName/") == true
        override fun copy(text: String) {
            val cm = getSystemService(CLIPBOARD_SERVICE) as android.content.ClipboardManager
            cm.setPrimaryClip(android.content.ClipData.newPlainText("bewithflow", text))
        }
        override fun deviceName(): String = runCatching { Settings.Global.getString(contentResolver, "device_name") }.getOrNull() ?: "You"
    }
}

interface Actions {
    fun openBrowser(url: String)
    fun open(url: String)
    fun requestMic()
    fun hasMic(): Boolean
    fun openKeyboardSettings()
    fun showKeyboardPicker()
    fun keyboardEnabled(): Boolean
    fun keyboardSelected(): Boolean
    fun copy(text: String)
    fun deviceName(): String
}
