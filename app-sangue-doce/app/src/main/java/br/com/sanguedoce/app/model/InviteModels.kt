package br.com.sanguedoce.app.model

data class InviteResponse(val id: String, val email: String?, val expiresAt: String, val createdAt: String)
data class CreateInviteRequest(val email: String)
