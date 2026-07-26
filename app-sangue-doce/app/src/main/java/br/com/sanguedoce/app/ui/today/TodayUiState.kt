package br.com.sanguedoce.app.ui.today

import br.com.sanguedoce.app.model.TodayResponse

sealed interface TodayUiState {

    data object Loading : TodayUiState

    data class Success(
        val readings: List<TodayResponse>,
        val isRefreshing: Boolean = false
    ) : TodayUiState

    data class Error(
        val message: String
    ) : TodayUiState
}
