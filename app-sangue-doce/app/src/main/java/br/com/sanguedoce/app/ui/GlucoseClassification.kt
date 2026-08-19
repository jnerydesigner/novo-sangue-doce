package br.com.sanguedoce.app.ui

import androidx.compose.ui.graphics.Color

fun glucoseClassificationColor(value: Int): Color {
    return when {
        value < 54 -> Color(0xFFF72900)
        value < 70 -> Color(0xFFF7A200)
        value <= 180 -> Color(0xFF00B200)
        value <= 250 -> Color(0xFFF7A200)
        else -> Color(0xFFF72900)
    }
}
