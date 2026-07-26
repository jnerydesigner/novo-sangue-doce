package br.com.sanguedoce.app.model

data class TodayResponse(
    val id : String,
    val userId: String,
    val measuredAt : String,
    val glucoseValueMgDl : Number,
    val readingContext : String,
    val source : String,
    val noteType : String,
    val noteLabel : String,
    val createdAt : String,
    val updatedAt: String

)
