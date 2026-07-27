package br.com.sanguedoce.app.ui.drawer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.ui.ProfileUiState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

class DrawerViewModel : ViewModel() {

    private val _profileState =
        MutableStateFlow<ProfileUiState>(ProfileUiState.Loading)

    val profileState: StateFlow<ProfileUiState> =
        _profileState.asStateFlow()

    init {
        loadProfile()
    }

    fun loadProfile() {
        viewModelScope.launch {
            _profileState.value = ProfileUiState.Loading

            try {
                val profile = RetrofitClient.api.getProfile()

                _profileState.value = ProfileUiState.Success(
                    profile = profile
                )
            } catch (exception: Exception) {
                _profileState.value = ProfileUiState.Error(
                    message = exception.message
                        ?: "Não foi possível carregar o perfil"
                )
            }
        }
    }
}