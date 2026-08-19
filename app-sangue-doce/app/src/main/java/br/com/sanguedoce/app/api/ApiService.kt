package br.com.sanguedoce.app.api

import br.com.sanguedoce.app.model.CreateMeasurementRequest
import br.com.sanguedoce.app.model.LoginRequest
import br.com.sanguedoce.app.model.LoginResponse
import br.com.sanguedoce.app.model.ProfileResponse
import br.com.sanguedoce.app.model.CreateInviteRequest
import br.com.sanguedoce.app.model.InviteResponse
import br.com.sanguedoce.app.model.InviteSendResponse
import br.com.sanguedoce.app.model.TodayResponse
import br.com.sanguedoce.app.model.consumptions.FoodConsumptions
import br.com.sanguedoce.app.model.consumptions.FoodSearchResult
import br.com.sanguedoce.app.model.consumptions.SaveFoodConsumptionRequest
import br.com.sanguedoce.app.model.home.AppHomeResponse
import okhttp3.MultipartBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Part
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

    @GET("invites")
    suspend fun getInvites(): List<InviteResponse>

    @POST("invites")
    suspend fun createInvite(@Body request: CreateInviteRequest): InviteSendResponse

    @POST("invites/{id}/resend")
    suspend fun resendInvite(@Path("id") id: String): InviteResponse

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

    @Multipart
    @POST("measurements/upload/image/measurement")
    suspend fun createMeasurementFromImage(
        @Part image: MultipartBody.Part
    ): TodayResponse

    @GET("food-consumptions/today/meal")
    suspend fun getFoodConsumptionsTodayMeal(
        @Query("meal") mealType: String
    ): FoodConsumptions

    @GET("food-consumptions/today")
    suspend fun getFoodConsumptionsToday(): List<FoodConsumptions>

    @GET("foods")
    suspend fun searchFoods(
        @Query("name") name: String
    ): List<FoodSearchResult>

    @POST("food-consumptions")
    suspend fun createFoodConsumption(
        @Body request: SaveFoodConsumptionRequest
    ): FoodConsumptions

}
