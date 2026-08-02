package br.com.sanguedoce.app.ui.home

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.sanguedoce.app.repository.HomeRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class HomeViewModel(
    private val repository: HomeRepository
) : ViewModel() {

    private val _uiState =
        MutableStateFlow<HomeUiState>(
            HomeUiState.Loading
        )

    val uiState: StateFlow<HomeUiState> =
        _uiState.asStateFlow()

    fun loadHome() {
        viewModelScope.launch {
            val currentState = _uiState.value

            if (currentState is HomeUiState.Success) {
                _uiState.value = currentState.copy(
                    isRefreshing = true
                )
            } else {
                _uiState.value = HomeUiState.Loading
            }

            _uiState.value = try {
                HomeUiState.Success(repository.getAppHome())
            } catch (exception: Exception) {
                if (currentState is HomeUiState.Success) {
                    currentState.copy(isRefreshing = false)
                } else {
                    HomeUiState.Error(
                        message = "Nao foi possivel carregar o resumo. Tente novamente."
                    )
                }
            }
        }
    }
}
