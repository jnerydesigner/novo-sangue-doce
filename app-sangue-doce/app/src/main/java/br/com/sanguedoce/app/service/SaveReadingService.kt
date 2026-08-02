package br.com.sanguedoce.app.service

import android.content.Context
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.CreateMeasurementRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class SaveReadingService(
    private val context: Context
) {

    suspend fun execute(
        value: Int,
        readingContext: String
    ) {
        val request = CreateMeasurementRequest(
            measuredAt = currentTimestamp(),
            glucoseValueMgDl = value,
            noteType = readingContext,
            timeZone = currentTimeZone()
        )

        RetrofitClient.api.createMeasurement(request)
    }

    suspend fun update(
        id: String,
        value: Int,
        readingContext: String
    ) {
        val request = CreateMeasurementRequest(
            measuredAt = currentTimestamp(),
            glucoseValueMgDl = value,
            noteType = readingContext,
            timeZone = currentTimeZone()
        )

        RetrofitClient.api.updateMeasurement(id, request)
    }

    private fun currentTimestamp(): String {
        val timeZone = TimeZone.getDefault()
        val formatter = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ss.SSS",
            Locale.US
        )

        formatter.timeZone = timeZone

        return formatter.format(Date())
    }

    private fun currentTimeZone(): String {
        return TimeZone.getDefault().id
    }
}
