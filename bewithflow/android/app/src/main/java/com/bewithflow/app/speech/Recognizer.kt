package com.bewithflow.app.speech

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer

/**
 * Speech-to-text with the phone's recognizer. Prefers the on-device engine (Android 12+, fast,
 * audio never leaves the phone); falls back to the standard recognizer when on-device isn't
 * available for the chosen language. Must be used from the main thread.
 */
class Recognizer(private val context: Context) {

    interface Listener {
        fun onReady() {}
        fun onLevel(level: Float) {}
        fun onPartial(text: String) {}
        fun onFinal(text: String)
        fun onError(message: String, code: Int)
    }

    private var recognizer: SpeechRecognizer? = null
    private var listener: Listener? = null
    private var language: String = ""
    private var onDevice = false
    private var triedFallback = false
    private var lastPartial = ""
    private var stopping = false
    private val main = Handler(Looper.getMainLooper())
    // some recognizers never answer after stopListening(); don't leave the keyboard waiting
    private val watchdog = Runnable { if (active) finishWith(lastPartial) }
    var active = false
        private set

    val available: Boolean get() = SpeechRecognizer.isRecognitionAvailable(context) || onDeviceAvailable()

    private fun onDeviceAvailable() = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S && SpeechRecognizer.isOnDeviceRecognitionAvailable(context)

    fun start(language: String, listener: Listener) {
        cancel()
        this.listener = listener
        this.language = language
        triedFallback = false
        stopping = false
        lastPartial = ""
        begin(preferOnDevice = true)
    }

    private fun begin(preferOnDevice: Boolean) {
        onDevice = preferOnDevice && onDeviceAvailable()
        recognizer = (if (onDevice) SpeechRecognizer.createOnDeviceSpeechRecognizer(context) else SpeechRecognizer.createSpeechRecognizer(context)).also {
            it.setRecognitionListener(callbacks)
            it.startListening(intent())
        }
        active = true
    }

    private fun intent() = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
        putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
        putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE, true)
        putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
        // dictation pauses: don't end the moment the speaker takes a breath
        putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 2500L)
        putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS, 2000L)
        if (language.isNotBlank()) putExtra(RecognizerIntent.EXTRA_LANGUAGE, language)
        if (Build.VERSION.SDK_INT >= 33) putExtra(RecognizerIntent.EXTRA_ENABLE_FORMATTING, RecognizerIntent.FORMATTING_OPTIMIZE_QUALITY)
    }

    /** Stop listening and deliver the final result (onFinal). */
    fun stop() {
        if (!active) return
        stopping = true
        recognizer?.stopListening()
        main.postDelayed(watchdog, STOP_TIMEOUT_MS)
    }

    private fun finishWith(text: String) {
        val l = listener
        cancel()
        l?.onFinal(text)
    }

    fun cancel() {
        active = false
        main.removeCallbacks(watchdog)
        recognizer?.run {
            runCatching { cancel() }
            runCatching { destroy() }
        }
        recognizer = null
    }

    private val callbacks = object : RecognitionListener {
        override fun onReadyForSpeech(params: Bundle?) { listener?.onReady() }
        override fun onBeginningOfSpeech() {}
        override fun onRmsChanged(rmsdB: Float) { listener?.onLevel(((rmsdB + 2f) / 12f).coerceIn(0f, 1f)) }
        override fun onBufferReceived(buffer: ByteArray?) {}
        override fun onEndOfSpeech() {}
        override fun onEvent(eventType: Int, params: Bundle?) {}

        override fun onPartialResults(partialResults: Bundle?) {
            val text = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty()
            if (text.isNotBlank()) {
                lastPartial = text
                listener?.onPartial(text)
            }
        }

        override fun onResults(results: Bundle?) {
            finishWith(results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull().orEmpty().ifBlank { lastPartial })
        }

        override fun onError(error: Int) {
            // on-device model missing for this language: try the regular recognizer once
            val languageProblem = error == 12 || error == 13 // ERROR_LANGUAGE_NOT_SUPPORTED / ERROR_LANGUAGE_UNAVAILABLE
            // (never after the user stopped: that would quietly start listening again)
            if (onDevice && !triedFallback && !stopping && (languageProblem || error == SpeechRecognizer.ERROR_SERVER || error == SpeechRecognizer.ERROR_CLIENT)) {
                triedFallback = true
                recognizer?.destroy()
                begin(preferOnDevice = false)
                return
            }
            val l = listener
            val partial = lastPartial
            cancel()
            // stopping right after speaking can surface as "no match" while a partial exists
            if (partial.isNotBlank() && (error == SpeechRecognizer.ERROR_NO_MATCH || error == SpeechRecognizer.ERROR_SPEECH_TIMEOUT)) {
                l?.onFinal(partial)
                return
            }
            l?.onError(messageFor(error), error)
        }
    }

    companion object {
        const val STOP_TIMEOUT_MS = 3000L

        fun messageFor(error: Int): String = when (error) {
            SpeechRecognizer.ERROR_NO_MATCH, SpeechRecognizer.ERROR_SPEECH_TIMEOUT -> "No speech heard"
            SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS -> "Allow the microphone in bewithflow"
            SpeechRecognizer.ERROR_NETWORK, SpeechRecognizer.ERROR_NETWORK_TIMEOUT -> "Speech recognition needs a connection on this phone"
            SpeechRecognizer.ERROR_RECOGNIZER_BUSY -> "The microphone is busy. Try again"
            SpeechRecognizer.ERROR_AUDIO -> "Couldn’t record audio"
            12, 13 -> "This language isn’t available for speech on this phone"
            else -> "Speech recognition failed ($error)"
        }
    }
}
