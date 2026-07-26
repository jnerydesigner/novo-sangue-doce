package br.com.sanguedoce.app.service

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi
import br.com.sanguedoce.app.AuthSession
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.CreateMeasurementRequest
import java.text.SimpleDateFormat
import kotlin.time.ExperimentalTime
import java.time.Instant
import java.util.Date
import java.util.Locale
import java.util.TimeZone


class SaveReadingService (private val context: Context) {
    suspend fun execute(value: Int){


        val request = CreateMeasurementRequest(
           measuredAt = currentTimestamp(),
           glucoseValueMgDl = value
       )

        RetrofitClient.api.createMeasurement(
            request
        )
    }

    private fun currentTimestamp (): String {
        val formatter = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            Locale.US
        )

        formatter.timeZone = TimeZone.getTimeZone("America/Sao_Paulo")

        return formatter.format(Date())
    }
}