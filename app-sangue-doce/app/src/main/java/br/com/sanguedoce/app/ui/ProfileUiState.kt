package br.com.sanguedoce.app.ui

import br.com.sanguedoce.app.model.ProfileResponse

sealed interface  ProfileUiState {
    data object Loading : ProfileUiState

    data class Success(
        val profile: ProfileResponse
    ) : ProfileUiState

    data class Error(
        val message: String
    ) : ProfileUiState
}