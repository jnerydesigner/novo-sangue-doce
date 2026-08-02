package br.com.sanguedoce.app.model.home

data class AppHomeResponse(
    val greeting: String,
    val title: String,
    val cards: List<AppHomeCardResponse>,
    val graph: List<AppHomeGraphResponse>
)

data class AppHomeCardResponse(
    val id: String,
    val title: String,
    val value: String,
    val status: String,
    val tone: String
)

data class AppHomeGraphResponse (
    val hour : String,
    val value : Int
)


