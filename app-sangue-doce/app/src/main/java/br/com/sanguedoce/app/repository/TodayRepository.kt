package br.com.sanguedoce.app.repository

import br.com.sanguedoce.app.api.ApiService
import br.com.sanguedoce.app.model.TodayResponse
import java.util.TimeZone

class TodayRepository(
    private val apiService: ApiService
) {

    suspend fun getTodayReadings(): List<TodayResponse> {
        return apiService.getMeasurementsToday(
            timeZone = TimeZone.getDefault().id
        )
    }
}
