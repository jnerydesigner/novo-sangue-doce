package br.com.sanguedoce.app.api

import okhttp3.OkHttpClient
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

object RetrofitClient {

//    private const val BASE_URL = "http://192.168.1.220:3011/"
//    private const val BASE_URL = "http://192.168.1.25:3011/"
    private const val BASE_URL = "https://api.sanguedoce.com.br/"
    private var token: String? = null

    val api: ApiService by lazy {
        Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
            .create(ApiService::class.java)
    }

    fun setToken(value: String) {
        token = value
    }

    fun clearToken() {
        token = null
    }

    private val client = OkHttpClient.Builder()
        .addInterceptor { chain ->
            val request = chain.request()
                .newBuilder()
                .apply {
                    token?.let {
                        addHeader("Authorization", "Bearer $it")
                    }
                }
                .build()

            chain.proceed(request)
        }
        .build()

}
