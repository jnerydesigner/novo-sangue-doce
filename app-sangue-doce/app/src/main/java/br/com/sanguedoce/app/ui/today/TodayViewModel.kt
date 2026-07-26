package br.com.sanguedoce.app.ui.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.sanguedoce.app.repository.TodayRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class TodayViewModel(
    private val repository: TodayRepository
) : ViewModel() {

    private val _uiState =
        MutableStateFlow<TodayUiState>(
            TodayUiState.Loading
        )

    val uiState: StateFlow<TodayUiState> =
        _uiState.asStateFlow()

    fun loadReadings() {
        viewModelScope.launch {
            val currentState = _uiState.value

            if (currentState is TodayUiState.Success) {
                _uiState.value = currentState.copy(
                    isRefreshing = true
                )
            } else {
                _uiState.value = TodayUiState.Loading
            }

            _uiState.value = try {
                val readings = repository.getTodayReadings()

                TodayUiState.Success(readings)
            } catch (exception: Exception) {
                if (currentState is TodayUiState.Success) {
                    currentState.copy(isRefreshing = false)
                } else {
                    TodayUiState.Error(
                        message = "Nao foi possivel carregar as leituras. Tente novamente."
                    )
                }
            }
        }
    }
}
