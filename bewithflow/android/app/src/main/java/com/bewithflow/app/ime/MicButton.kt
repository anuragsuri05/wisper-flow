package com.bewithflow.app.ime

import android.animation.ValueAnimator
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.RectF
import android.view.View
import android.view.animation.LinearInterpolator

/** The big round mic key. Idle: mic glyph. Listening: live level bars. Working: sweeping dots. */
class MicButton(context: Context, private val ink: Int, private val onInk: Int, private val accent: Int) : View(context) {
    enum class Mode { IDLE, LISTENING, WORKING }

    var mode = Mode.IDLE
        set(value) {
            field = value
            if (value == Mode.IDLE) anim.cancel() else if (!anim.isRunning) anim.start()
            invalidate()
        }
    private var level = 0f
    private var phase = 0f
    private val levels = FloatArray(7)
    private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
    private val anim = ValueAnimator.ofFloat(0f, 1f).apply {
        duration = 900
        repeatCount = ValueAnimator.INFINITE
        interpolator = LinearInterpolator()
        addUpdateListener {
            phase = it.animatedValue as Float
            invalidate()
        }
    }

    fun setLevel(l: Float) {
        level = l
        System.arraycopy(levels, 1, levels, 0, levels.size - 1)
        levels[levels.size - 1] = l
        invalidate()
    }

    override fun onDraw(canvas: Canvas) {
        val cx = width / 2f
        val cy = height / 2f
        val r = minOf(width, height) / 2f
        // ring that breathes with your voice
        if (mode == Mode.LISTENING) {
            paint.color = accent
            paint.alpha = 60
            canvas.drawCircle(cx, cy, r * (0.86f + 0.14f * level), paint)
            paint.alpha = 255
        }
        paint.color = if (mode == Mode.LISTENING) accent else ink
        canvas.drawCircle(cx, cy, r * 0.8f, paint)
        paint.color = onInk
        val d = resources.displayMetrics.density
        when (mode) {
            Mode.IDLE -> drawMic(canvas, cx, cy, d)
            Mode.LISTENING -> {
                val w = 4f * d
                val gap = 4f * d
                val total = levels.size * w + (levels.size - 1) * gap
                levels.forEachIndexed { i, v ->
                    val centre = 1f - kotlin.math.abs(i - (levels.size - 1) / 2f) / levels.size
                    val h = (6f * d) + v * 28f * d * (0.5f + centre * 0.6f)
                    val x = cx - total / 2 + i * (w + gap)
                    canvas.drawRoundRect(RectF(x, cy - h / 2, x + w, cy + h / 2), w, w, paint)
                }
            }
            Mode.WORKING -> for (i in 0..2) {
                val t = ((phase + i * 0.15f) % 1f)
                val lift = kotlin.math.sin(t * Math.PI).toFloat() * 6f * d
                canvas.drawCircle(cx + (i - 1) * 12f * d, cy - lift, 3.5f * d, paint)
            }
        }
    }

    private fun drawMic(canvas: Canvas, cx: Float, cy: Float, d: Float) {
        val w = 12f * d
        val h = 20f * d
        canvas.drawRoundRect(RectF(cx - w / 2, cy - h * 0.75f, cx + w / 2, cy + h * 0.25f), w / 2, w / 2, paint)
        val stroke = Paint(paint).apply {
            style = Paint.Style.STROKE
            strokeWidth = 2.4f * d
            strokeCap = Paint.Cap.ROUND
        }
        canvas.drawArc(RectF(cx - 11f * d, cy - 10f * d, cx + 11f * d, cy + 9f * d), 20f, 140f, false, stroke)
        canvas.drawLine(cx, cy + 9f * d, cx, cy + 14f * d, stroke)
    }
}
