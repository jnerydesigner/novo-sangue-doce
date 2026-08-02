package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.systemBars
import androidx.compose.foundation.layout.windowInsetsTopHeight
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.repository.TodayRepository
import br.com.sanguedoce.app.ui.today.TodayRoute
import br.com.sanguedoce.app.ui.today.TodayViewModel
import br.com.sanguedoce.app.ui.today.TodayViewModelFactory

import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch


class MainActivity : ComponentActivity() {
    private var sessionCheckJob: Job? = null
    private var redirectingToLogin = false


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
                Box {
                    val uiState by viewModel
                        .uiState
                        .collectAsStateWithLifecycle()

                    TodayRoute(
                        uiState = uiState,
                        onRetry = viewModel::loadReadings,
                        onHomeClick = {
                            startActivity(Intent(this@MainActivity, HomeActivity::class.java))
                            finish()
                        },
                        onAddClick = {
                            startActivity(Intent(this@MainActivity, AddReadingActivity::class.java))
                        },
                        onLogoutClick = {
                            AuthSession.signOut(this@MainActivity)
                            RetrofitClient.clearToken()
                            startActivity(Intent(this@MainActivity, LoginActivity::class.java))
                            finish()
                        },
                        onEditClick = { reading ->
                            startActivity(Intent(this@MainActivity, AddReadingActivity::class.java).apply {
                                putExtra(AddReadingActivity.EXTRA_EDIT_MODE, true)
                                putExtra(AddReadingActivity.EXTRA_MEASUREMENT_ID, reading.id)
                                putExtra(AddReadingActivity.EXTRA_GLUCOSE_VALUE, reading.glucoseValueMgDl)
                                putExtra(AddReadingActivity.EXTRA_NOTE_TYPE, reading.noteType)
                            })
                        },
                        onDeleteClick = { reading ->
                            Toast.makeText(this@MainActivity, "Excluir: ${reading.id}", Toast.LENGTH_SHORT).show()
                        }
                    )

                    // Android 15+ draws edge-to-edge and ignores statusBarColor.
                    // This scrim keeps the system-information area visually distinct.
                    Box(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .fillMaxWidth()
                            .background(Color(0xFF102746))
                            .windowInsetsTopHeight(WindowInsets.systemBars)
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()

        checkSession()
        if(!redirectingToLogin){
            viewModel.loadReadings()
            startSessionChecker()
        }
        viewModel.loadReadings()
    }

    private fun checkSession() {
        if (!AuthSession.isLoggedIn(this)) {
            redirectToLogin()
        }
    }

    private fun redirectToLogin() {
        if (redirectingToLogin) return

        redirectingToLogin = true

        AuthSession.signOut(this)
        RetrofitClient.clearToken()

        startActivity(Intent(this, LoginActivity::class.java))
        finish()
    }

    private fun startSessionChecker() {
        sessionCheckJob?.cancel()

        sessionCheckJob = lifecycleScope.launch {
            while (isActive) {
                delay(5 * 60 * 1000L)
                checkSession()
            }
        }
    }




}
