package br.com.sanguedoce.app.api

import br.com.sanguedoce.app.model.CreateMeasurementRequest
import br.com.sanguedoce.app.model.LoginRequest
import br.com.sanguedoce.app.model.LoginResponse
import br.com.sanguedoce.app.model.ProfileResponse
import br.com.sanguedoce.app.model.TodayResponse
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Header
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path

interface ApiService {

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse

    @GET("auth/profile")
    suspend fun getProfile(): ProfileResponse

    @GET("measurements/today")
    suspend fun getMeasurementsToday(): List<TodayResponse>

    @POST("measurements")
    suspend fun createMeasurement(
        @Body request: CreateMeasurementRequest
    ): TodayResponse

    @PATCH("measurements/{id}")
    suspend fun updateMeasurement(
        @Path("id") id: String,
        @Body request: CreateMeasurementRequest
    ): TodayResponse

}

