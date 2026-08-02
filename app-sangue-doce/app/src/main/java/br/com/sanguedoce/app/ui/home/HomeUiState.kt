package br.com.sanguedoce.app.ui.home

import br.com.sanguedoce.app.model.home.AppHomeResponse

sealed interface HomeUiState {

    data object Loading : HomeUiState

    data class Success(
        val home: AppHomeResponse,
        val isRefreshing: Boolean = false
    ) : HomeUiState

    data class Error(
        val message: String
    ) : HomeUiState
}
