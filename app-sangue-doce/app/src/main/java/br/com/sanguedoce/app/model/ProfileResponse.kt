package br.com.sanguedoce.app.model

data class ProfileResponse(
    val sub: String,
    val name: String,
    val email: String,
    val avatarUrl: String,
    val birthDate: String,
    val diabetesType: String,
    val role: String,
    val roles: List<String>,
    val passwordSetupRequired: Boolean,
    val createdAt: String,
    val updatedAt: String

)
