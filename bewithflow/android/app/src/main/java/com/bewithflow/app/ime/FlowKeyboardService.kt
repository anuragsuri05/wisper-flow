package com.bewithflow.app.ime

import android.Manifest
import android.annotation.SuppressLint
import android.content.Intent
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.inputmethodservice.InputMethodService
import android.os.Handler
import android.os.Looper
import android.os.Build
import android.view.Gravity
import android.view.HapticFeedbackConstants
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.view.WindowInsets
import android.view.inputmethod.EditorInfo
import android.widget.FrameLayout
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import com.bewithflow.app.BewithflowApp
import com.bewithflow.app.core.Styles
import com.bewithflow.app.speech.Recognizer
import com.bewithflow.app.ui.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * The bewithflow Keyboard: hold the mic and speak, release to type the cleaned-up text
 * into whatever app you're in (WhatsApp, Gmail, Slack…). Tap the mic for hands-free.
 */
class FlowKeyboardService : InputMethodService() {

    private val engine get() = BewithflowApp.from(this).engine
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val main = Handler(Looper.getMainLooper())
    private lateinit var recognizer: Recognizer

    private lateinit var status: TextView
    private lateinit var mic: MicButton
    private var listening = false
    private var handsFree = false
    private var pressedAt = 0L
    private var releasedAt = 0L

    // palette follows the system light/dark setting
    private val dark get() = (resources.configuration.uiMode and Configuration.UI_MODE_NIGHT_MASK) == Configuration.UI_MODE_NIGHT_YES
    private val bg get() = if (dark) Color.parseColor("#1B1A18") else Color.parseColor("#F3F2EF")
    private val keyBg get() = if (dark) Color.parseColor("#2B2926") else Color.WHITE
    private val ink get() = if (dark) Color.parseColor("#F2F0EC") else Color.parseColor("#191817")
    private val muted get() = if (dark) Color.parseColor("#A19C94") else Color.parseColor("#76726B")
    private val accent = Color.parseColor("#6E56F8")

    private var testHook: (() -> Unit)? = null

    override fun onCreate() {
        super.onCreate()
        recognizer = Recognizer(this)
        // debug builds: lets emulator tests stand in for the recognizer (no-op in release)
        testHook = TestHooks.install(this) { text ->
            if (listening) recognizer.cancel()
            releasedAt = System.currentTimeMillis()
            deliver(text)
        }
    }

    override fun onDestroy() {
        testHook?.invoke()
        recognizer.cancel()
        scope.cancel()
        super.onDestroy()
    }

    private fun dp(v: Float) = (v * resources.displayMetrics.density).toInt()

    // A dictation keyboard is still needed with a hardware keyboard attached (Bluetooth keyboards,
    // Chromebooks, foldable covers); the default hides the input view whenever one is present.
    override fun onEvaluateInputViewShown(): Boolean {
        super.onEvaluateInputViewShown()
        return true
    }

    @SuppressLint("ClickableViewAccessibility")
    override fun onCreateInputView(): View {
        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(bg)
            setPadding(dp(10f), dp(8f), dp(10f), dp(10f))
            // The keyboard window is edge-to-edge on Android 15+: keep the keys above the navigation bar.
            setOnApplyWindowInsetsListener { v, insets ->
                val nav = if (Build.VERSION.SDK_INT >= 30) insets.getInsets(WindowInsets.Type.navigationBars()).bottom
                    else @Suppress("DEPRECATION") insets.systemWindowInsetBottom
                v.setPadding(dp(10f), dp(8f), dp(10f), dp(10f) + nav)
                insets
            }
        }
        status = TextView(this).apply {
            setTextColor(muted)
            textSize = 13f
            gravity = Gravity.CENTER
            maxLines = 3
            setPadding(dp(8f), dp(4f), dp(8f), dp(6f))
            minHeight = dp(40f)
        }
        root.addView(status, LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT))

        mic = MicButton(this, ink, if (dark) Color.parseColor("#191817") else Color.WHITE, accent).apply {
            contentDescription = "Hold to dictate. Tap for hands-free."
            setOnTouchListener { v, e -> onMicTouch(v, e) }
        }
        root.addView(FrameLayout(this).apply { addView(mic, FrameLayout.LayoutParams(dp(112f), dp(112f), Gravity.CENTER)) },
            LinearLayout.LayoutParams(LinearLayout.LayoutParams.MATCH_PARENT, dp(124f)))

        val row = LinearLayout(this).apply { orientation = LinearLayout.HORIZONTAL }
        row.addView(key("🌐", "Switch keyboard") { switchKeyboard() }, keyParams(1f))
        row.addView(key("space", "Space") { currentInputConnection?.commitText(" ", 1) }, keyParams(3.2f))
        row.addView(repeatKey("⌫", "Delete") { deleteBack() }, keyParams(1.2f))
        row.addView(key("⏎", "Return") { sendEnter() }, keyParams(1.2f))
        root.addView(row)
        return root
    }

    private fun keyParams(weight: Float) = LinearLayout.LayoutParams(0, dp(46f), weight).apply { setMargins(dp(3f), 0, dp(3f), 0) }

    private fun keyBackground() = GradientDrawable().apply {
        cornerRadius = dp(10f).toFloat()
        setColor(keyBg)
    }

    private fun key(label: String, description: String, action: () -> Unit) = TextView(this).apply {
        text = label
        contentDescription = description
        gravity = Gravity.CENTER
        textSize = if (label.length > 2) 14f else 18f
        setTextColor(ink)
        typeface = Typeface.DEFAULT_BOLD
        background = keyBackground()
        setOnClickListener {
            haptic(it)
            action()
        }
    }

    @SuppressLint("ClickableViewAccessibility")
    private fun repeatKey(label: String, description: String, action: () -> Unit) = key(label, description) {}.apply {
        val repeat = object : Runnable {
            override fun run() {
                action()
                main.postDelayed(this, 60)
            }
        }
        setOnTouchListener { v, e ->
            when (e.action) {
                MotionEvent.ACTION_DOWN -> {
                    haptic(v)
                    action()
                    main.postDelayed(repeat, 400)
                }
                MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> main.removeCallbacks(repeat)
            }
            true
        }
    }

    private fun haptic(v: View) {
        if (runCatching { engine.store.currentUser() != null && engine.store.settings().haptics }.getOrDefault(true)) {
            v.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
        }
    }

    override fun onStartInputView(info: EditorInfo?, restarting: Boolean) {
        super.onStartInputView(info, restarting)
        if (!listening) showIdleHint()
    }

    override fun onFinishInputView(finishingInput: Boolean) {
        if (listening) cancelListening()
        super.onFinishInputView(finishingInput)
    }

    private fun appLabel(): String {
        val pkg = currentInputEditorInfo?.packageName ?: return ""
        return runCatching { packageManager.getApplicationLabel(packageManager.getApplicationInfo(pkg, 0)).toString() }.getOrDefault(pkg)
    }

    private fun showIdleHint() {
        mic.mode = MicButton.Mode.IDLE
        val user = runCatching { engine.store.currentUser() }.getOrNull()
        status.setTextColor(muted)
        status.text = when {
            user == null -> "Open bewithflow to sign in"
            !hasMic() -> "Open bewithflow to allow the microphone"
            else -> {
                val category = Styles.categorize(currentInputEditorInfo?.packageName)
                val style = Styles.STYLES[engine.store.settings().styles[category]]?.label?.trimEnd('.', '!')
                val where = appLabel().ifBlank { "this app" }
                "Hold to talk · tap for hands-free\n$where · $style"
            }
        }
    }

    private fun hasMic() = ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED

    private fun openApp() {
        startActivity(Intent(this, MainActivity::class.java).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    }

    // ---------- dictation ----------

    @SuppressLint("ClickableViewAccessibility")
    private fun onMicTouch(v: View, e: MotionEvent): Boolean {
        when (e.action) {
            MotionEvent.ACTION_DOWN -> {
                haptic(v)
                pressedAt = System.currentTimeMillis()
                if (listening && handsFree) {
                    finishListening()
                } else if (!listening) {
                    handsFree = false
                    startListening()
                }
            }
            MotionEvent.ACTION_UP, MotionEvent.ACTION_CANCEL -> {
                if (!listening || handsFree) return true
                if (System.currentTimeMillis() - pressedAt < 350) {
                    // a quick tap: stay on, hands-free
                    handsFree = true
                    status.setTextColor(muted)
                    status.text = "Listening… tap the mic when you’re done"
                } else finishListening()
            }
        }
        return true
    }

    private fun startListening() {
        val user = runCatching { engine.store.currentUser() }.getOrNull()
        if (user == null || !hasMic()) {
            openApp()
            return
        }
        if (!recognizer.available) {
            status.text = "Speech recognition isn’t available on this phone"
            return
        }
        listening = true
        mic.mode = MicButton.Mode.LISTENING
        status.setTextColor(muted)
        status.text = "Listening…"
        engine.onListeningStarted()
        recognizer.start(engine.store.settings().language, object : Recognizer.Listener {
            override fun onLevel(level: Float) = mic.setLevel(level)
            override fun onPartial(text: String) {
                status.setTextColor(ink)
                status.text = text
            }
            override fun onFinal(text: String) = deliver(text)
            override fun onError(message: String, code: Int) {
                listening = false
                mic.mode = MicButton.Mode.IDLE
                status.setTextColor(muted)
                status.text = message
                main.postDelayed({ if (!listening) showIdleHint() }, 2500)
            }
        })
    }

    private fun finishListening() {
        releasedAt = System.currentTimeMillis()
        mic.mode = MicButton.Mode.WORKING
        status.setTextColor(muted)
        status.text = "Finishing…"
        recognizer.stop()
    }

    private fun cancelListening() {
        recognizer.cancel()
        listening = false
        handsFree = false
        mic.mode = MicButton.Mode.IDLE
    }

    private fun deliver(raw: String) {
        listening = false
        handsFree = false
        if (releasedAt == 0L) releasedAt = System.currentTimeMillis() // recognizer ended on its own
        val released = releasedAt
        releasedAt = 0L
        if (raw.isBlank()) {
            mic.mode = MicButton.Mode.IDLE
            status.text = "No speech heard"
            main.postDelayed({ if (!listening) showIdleHint() }, 2000)
            return
        }
        mic.mode = MicButton.Mode.WORKING
        status.setTextColor(muted)
        status.text = "Cleaning up…"
        val pkg = currentInputEditorInfo?.packageName
        val label = appLabel()
        scope.launch {
            val result = runCatching { engine.process(raw, pkg, label, released) }
            result.onSuccess { r ->
                if (r.text.isNotEmpty()) type(r.text)
                mic.mode = MicButton.Mode.IDLE
                status.setTextColor(muted)
                status.text = when {
                    r.provider == "local" && r.warning != null -> "Typed with basic cleanup · ${r.warning}"
                    else -> "Typed in ${label.ifBlank { "this app" }}"
                }
            }.onFailure { err ->
                type(raw) // never lose what was said
                mic.mode = MicButton.Mode.IDLE
                status.text = err.message ?: "Couldn’t clean up; typed what was heard"
            }
            main.postDelayed({ if (!listening) showIdleHint() }, 2500)
        }
    }

    /** Insert at the cursor, adding a space when it would otherwise run into the previous word. */
    private fun type(text: String) {
        val ic = currentInputConnection ?: return
        val before = ic.getTextBeforeCursor(1, 0)?.toString().orEmpty()
        val needsSpace = before.isNotEmpty() && !before.last().isWhitespace() && !text.first().isWhitespace()
        ic.commitText(if (needsSpace) " $text" else text, 1)
    }

    private fun deleteBack() {
        val ic = currentInputConnection ?: return
        val selected = ic.getSelectedText(0)
        if (!selected.isNullOrEmpty()) ic.commitText("", 1) else ic.deleteSurroundingText(1, 0)
    }

    private fun sendEnter() {
        val ic = currentInputConnection ?: return
        val info = currentInputEditorInfo
        val action = info?.imeOptions?.and(EditorInfo.IME_MASK_ACTION) ?: EditorInfo.IME_ACTION_NONE
        val noEnterAction = (info?.imeOptions ?: 0) and EditorInfo.IME_FLAG_NO_ENTER_ACTION != 0
        if (!noEnterAction && action != EditorInfo.IME_ACTION_NONE && action != EditorInfo.IME_ACTION_UNSPECIFIED) {
            ic.performEditorAction(action)
        } else {
            ic.sendKeyEvent(KeyEvent(KeyEvent.ACTION_DOWN, KeyEvent.KEYCODE_ENTER))
            ic.sendKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER))
        }
    }

    private fun switchKeyboard() {
        if (!switchToNextInputMethod(false)) {
            (getSystemService(INPUT_METHOD_SERVICE) as android.view.inputmethod.InputMethodManager).showInputMethodPicker()
        }
    }
}
