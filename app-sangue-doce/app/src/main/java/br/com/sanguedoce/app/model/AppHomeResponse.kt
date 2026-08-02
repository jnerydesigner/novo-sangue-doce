package br.com.sanguedoce.app.model

data class AppHomeResponse(
    val greeting: String,
    val title: String,
    val cards: List<AppHomeCard>
)

data class AppHomeCard(
    val id: String,
    val title: String,
    val value: String,
    val status: String,
    val detail: String,
    val tone: String
)
