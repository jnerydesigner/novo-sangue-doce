package br.com.sanguedoce.app.model

import com.google.gson.annotations.SerializedName

data class LoginResponse (
    @SerializedName("access_token")
    val accessToken: String
)