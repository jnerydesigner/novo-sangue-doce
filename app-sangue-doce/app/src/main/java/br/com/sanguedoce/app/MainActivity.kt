package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.repository.TodayRepository
import br.com.sanguedoce.app.ui.today.TodayRoute
import br.com.sanguedoce.app.ui.today.TodayViewModel
import br.com.sanguedoce.app.ui.today.TodayViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: TodayViewModel by viewModels {
        TodayViewModelFactory(
            TodayRepository(RetrofitClient.api)
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val token = AuthSession.getToken(this)

        if (token == null) {
            startActivity(
                Intent(this, LoginActivity::class.java)
            )

            finish()
            return
        }

        RetrofitClient.setToken(token)

        setContent {
            MaterialTheme {
                val uiState by viewModel
                    .uiState
                    .collectAsStateWithLifecycle()

                TodayRoute(
                    uiState = uiState,
                    onRetry = viewModel::loadReadings,
                    onAddClick = {
                        startActivity(
                            Intent(
                                this,
                                AddReadingActivity::class.java
                            )
                        )
                    }
                )
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.loadReadings()
    }
}
