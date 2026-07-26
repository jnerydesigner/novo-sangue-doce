package br.com.sanguedoce.app.ui.today

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import br.com.sanguedoce.app.repository.TodayRepository

class TodayViewModelFactory(
    private val repository: TodayRepository
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(
        modelClass: Class<T>
    ): T {
        if (
            modelClass.isAssignableFrom(
                TodayViewModel::class.java
            )
        ) {
            return TodayViewModel(repository) as T
        }

        throw IllegalArgumentException(
            "ViewModel desconhecido"
        )
    }
}