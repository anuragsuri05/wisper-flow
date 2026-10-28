package com.bewithflow.app

import android.app.Application
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class BewithflowApp : Application() {
    lateinit var engine: Engine
        private set

    val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)

    override fun onCreate() {
        super.onCreate()
        installCrashLog()
        engine = Engine(this)
        // keep the ChatGPT session fresh in the background while the process is alive
        scope.launch {
            while (true) {
                runCatching { engine.keepFresh() }
                delay(60_000)
            }
        }
    }

    /** Unexpected crashes go to files/logs/app.log (never dictation text), then the system handler runs. */
    private fun installCrashLog() {
        val previous = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, error ->
            runCatching {
                val f = File(filesDir, "logs/app.log")
                f.parentFile?.mkdirs()
                f.appendText("${java.time.Instant.now()} ${packageManager.getPackageInfo(packageName, 0).versionName} ${error.stackTraceToString()}\n")
            }
            previous?.uncaughtException(thread, error)
        }
    }

    companion object {
        fun from(context: android.content.Context) = context.applicationContext as BewithflowApp
    }
}
