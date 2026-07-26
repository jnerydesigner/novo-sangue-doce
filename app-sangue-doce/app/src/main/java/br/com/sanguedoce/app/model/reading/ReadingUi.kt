package br.com.sanguedoce.app.model.reading

data class ReadingUi(
    val id: Int,
    val period: String,
    val glucose: Int,
    val time: String
)