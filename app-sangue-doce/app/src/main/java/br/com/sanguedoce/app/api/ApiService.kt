package br.com.sanguedoce.app.api

import br.com.sanguedoce.app.model.CreateMeasurementRequest
import br.com.sanguedoce.app.model.LoginRequest
import br.com.sanguedoce.app.model.LoginResponse
import br.com.sanguedoce.app.model.ProfileResponse
import br.com.sanguedoce.app.model.TodayResponse
import br.com.sanguedoce.app.model.home.AppHomeResponse
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    @GET("app/home")
    suspend fun getAppHome(): AppHomeResponse

    @POST("auth/login")
    suspend fun login(
        @Body request: LoginRequest
    ): LoginResponse

    @GET("auth/profile")
    suspend fun getProfile(): ProfileResponse

    @GET("measurements/today")
    suspend fun getMeasurementsToday(
        @Query("timeZone") timeZone: String
    ): List<TodayResponse>

    @POST("measurements")
    suspend fun createMeasurement(
        @Body request: CreateMeasurementRequest
    ): TodayResponse

    @PATCH("measurements/{id}")
    suspend fun updateMeasurement(
        @Path("id") id: String,
        @Body request: CreateMeasurementRequest
    ): TodayResponse

    @DELETE("measurements/{id}/measurement")
    suspend fun deleteMeasurement(
        @Path("id") id: String
    ): List<TodayResponse>


}
