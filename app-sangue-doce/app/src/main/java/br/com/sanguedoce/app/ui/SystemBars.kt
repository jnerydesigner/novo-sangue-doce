package br.com.sanguedoce.app.ui

import android.graphics.Color.parseColor
import androidx.activity.SystemBarStyle
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.statusBars
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color

val SangueDoceSystemBarColor = Color(0xFF102746)

fun ComponentActivity.configureSangueDoceSystemBars() {
    val systemBarColor = parseColor("#102746")
    val systemBarStyle = SystemBarStyle.dark(systemBarColor)

    enableEdgeToEdge(
        statusBarStyle = systemBarStyle,
        navigationBarStyle = systemBarStyle
    )
}

@Composable
fun SangueDoceStatusBarScrim(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(SangueDoceSystemBarColor)
            .windowInsetsTopHeight(WindowInsets.statusBars)
    )
}
