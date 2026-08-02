package br.com.sanguedoce.app.model

data class CreateMeasurementRequest(
    val measuredAt: String,
    val glucoseValueMgDl: Int,
    val noteType: String,
    val timeZone: String
)
