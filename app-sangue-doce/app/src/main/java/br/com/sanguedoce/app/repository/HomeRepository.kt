package br.com.sanguedoce.app.repository

import br.com.sanguedoce.app.api.ApiService
import br.com.sanguedoce.app.model.home.AppHomeResponse

class HomeRepository(
    private val apiService: ApiService
) {

    suspend fun getAppHome(): AppHomeResponse {
        return apiService.getAppHome()
    }
}
