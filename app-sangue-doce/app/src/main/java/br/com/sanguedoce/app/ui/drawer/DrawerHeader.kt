package br.com.sanguedoce.app.ui.drawer

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import br.com.sanguedoce.app.ui.ProfileUiState
import br.com.sanguedoce.app.ui.SangueDocePrimary

@Composable
fun DrawerHeader(
    state: ProfileUiState,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    when (state) {
        ProfileUiState.Loading -> {
            Box(
                modifier = modifier
                    .fillMaxWidth()
                    .height(160.dp)
                    .background(SangueDocePrimary)
                    .statusBarsPadding(),
                contentAlignment = Alignment.Center
            ) {
                CircularProgressIndicator(
                    color = Color.White
                )
            }
        }

        is ProfileUiState.Success -> {
            DrawerUserHeader(
                profile = state.profile,
                modifier = modifier
            )
        }

        is ProfileUiState.Error -> {
            Column(
                modifier = modifier
                    .fillMaxWidth()
                    .background(SangueDocePrimary)
                    .statusBarsPadding()
                    .padding(
                        horizontal = 20.dp,
                        vertical = 28.dp
                    )
            ) {
                Text(
                    text = "Não foi possível carregar seu perfil",
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = state.message,
                    color = Color.White.copy(alpha = 0.85f),
                    style = MaterialTheme.typography.bodySmall
                )

                TextButton(
                    onClick = onRetry
                ) {
                    Text(
                        text = "Tentar novamente",
                        color = Color.White
                    )
                }
            }
        }
    }
}