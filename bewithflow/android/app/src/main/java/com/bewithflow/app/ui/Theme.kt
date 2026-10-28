package com.bewithflow.app.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object Brand {
    val violet = Color(0xFF6E56F8)
    val green = Color(0xFF23864F)
    val amber = Color(0xFFA46710)
    val red = Color(0xFFD3433A)
}

private val Light = lightColorScheme(
    primary = Color(0xFF191817), onPrimary = Color(0xFFFBFBFA),
    secondary = Brand.violet, onSecondary = Color.White,
    background = Color(0xFFFBFBFA), onBackground = Color(0xFF191817),
    surface = Color(0xFFFFFFFF), onSurface = Color(0xFF191817),
    surfaceVariant = Color(0xFFF2F0EC), onSurfaceVariant = Color(0xFF76726B),
    outline = Color(0xFFE8E5DF), error = Brand.red,
)

private val Dark = darkColorScheme(
    primary = Color(0xFFF2F0EC), onPrimary = Color(0xFF151413),
    secondary = Color(0xFF9F8CFF), onSecondary = Color(0xFF151413),
    background = Color(0xFF151413), onBackground = Color(0xFFF2F0EC),
    surface = Color(0xFF211F1D), onSurface = Color(0xFFF2F0EC),
    surfaceVariant = Color(0xFF272523), onSurfaceVariant = Color(0xFFA19C94),
    outline = Color(0xFF33302C), error = Color(0xFFFF8A80),
)

/** Serif display for headings (like the desktop app), system sans for everything else. */
val Display = TextStyle(fontFamily = FontFamily.Serif, fontWeight = FontWeight.Normal, fontSize = 34.sp, lineHeight = 38.sp)

@Composable
fun BewithflowTheme(content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (isSystemInDarkTheme()) Dark else Light, content = content)
}
