package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ExitToApp
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.ProfileResponse
import br.com.sanguedoce.app.ui.ProfileUiState
import br.com.sanguedoce.app.ui.SangueDoceBackground
import br.com.sanguedoce.app.ui.SangueDoceCard
import br.com.sanguedoce.app.ui.SangueDoceInk
import br.com.sanguedoce.app.ui.SangueDoceMutedText
import br.com.sanguedoce.app.ui.SangueDocePrimary
import br.com.sanguedoce.app.ui.SangueDoceStatusBarScrim
import br.com.sanguedoce.app.ui.componentes.SangueDoceBottomBar
import br.com.sanguedoce.app.ui.configureSangueDoceSystemBars
import coil3.compose.AsyncImage
import kotlinx.coroutines.launch

private const val S3_BASE_URL = "https://sangue-doce.s3.us-east-1.amazonaws.com"

class ProfileActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureSangueDoceSystemBars()

        val token = AuthSession.getToken(this)

        if (token == null) {
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
            return
        }

        RetrofitClient.setToken(token)

        setContent {
            MaterialTheme {
                var profileState by remember { mutableStateOf<ProfileUiState>(ProfileUiState.Loading) }
                val scope = rememberCoroutineScope()

                fun loadProfile() {
                    scope.launch {
                        profileState = ProfileUiState.Loading
                        profileState = try {
                            ProfileUiState.Success(RetrofitClient.api.getProfile())
                        } catch (error: Exception) {
                            ProfileUiState.Error(
                                message = error.message ?: "Nao foi possivel carregar o perfil."
                            )
                        }
                    }
                }

                LaunchedEffect(Unit) {
                    loadProfile()
                }

                Box {
                    ProfileScreen(
                        profileState = profileState,
                        onRetry = ::loadProfile,
                        onHomeClick = {
                            startActivity(Intent(this@ProfileActivity, HomeActivity::class.java))
                            finish()
                        },
                        onMeasurementsClick = {
                            startActivity(Intent(this@ProfileActivity, MainActivity::class.java))
                            finish()
                        },
                        onContentClick = {
                            startActivity(Intent(this@ProfileActivity, MealsActivity::class.java))
                            finish()
                        },
                        onBloodClick = {
                            startActivity(Intent(this@ProfileActivity, AddReadingActivity::class.java))
                        },
                        onLogoutClick = {
                            AuthSession.signOut(this@ProfileActivity)
                            RetrofitClient.clearToken()
                            startActivity(Intent(this@ProfileActivity, LoginActivity::class.java))
                            finish()
                        }
                    )

                    SangueDoceStatusBarScrim(
                        modifier = Modifier.align(Alignment.TopCenter)
                    )
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()

        if (!AuthSession.isLoggedIn(this)) {
            AuthSession.signOut(this)
            RetrofitClient.clearToken()
            startActivity(Intent(this, LoginActivity::class.java))
            finish()
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ProfileScreen(
    profileState: ProfileUiState,
    onRetry: () -> Unit,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onBloodClick: () -> Unit,
    onLogoutClick: () -> Unit
) {
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = SangueDoceBackground,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Perfil",
                        color = SangueDoceInk,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = SangueDoceBackground
                )
            )
        },
        bottomBar = {
            SangueDoceBottomBar(
                selectedItem = "profile",
                onHomeClick = onHomeClick,
                onMeasurementsClick = onMeasurementsClick,
                onContentClick = onContentClick,
                onProfileClick = {
                    // Already on profile.
                },
                onBloodClick = onBloodClick
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SangueDoceBackground),
            contentPadding = PaddingValues(
                start = 16.dp,
                top = 12.dp,
                end = 16.dp,
                bottom = 24.dp
            ),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                when (profileState) {
                    ProfileUiState.Loading -> LoadingProfileCard()
                    is ProfileUiState.Error -> ErrorProfileCard(
                        message = profileState.message,
                        onRetry = onRetry
                    )
                    is ProfileUiState.Success -> ProfileSummaryCard(profileState.profile)
                }
            }

            item {
                SettingsCard()
            }

            item {
                OutlinedButton(
                    onClick = onLogoutClick,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ExitToApp,
                        contentDescription = null
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Sair")
                }
            }
        }
    }
}

@Composable
private fun ProfileSummaryCard(profile: ProfileResponse) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SangueDoceCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                ProfileAvatar(profile = profile)

                Spacer(modifier = Modifier.width(14.dp))

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = profile.name,
                        color = SangueDoceInk,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis
                    )

                    Text(
                        text = profile.email,
                        color = SangueDoceMutedText,
                        fontSize = 14.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
            }

            HorizontalDivider(color = Color(0xFFE1E8F0))

            ProfileInfoRow(label = "Tipo de diabetes", value = profile.diabetesType.ifBlank { "-" })
            ProfileInfoRow(label = "Perfil", value = profile.role.ifBlank { "-" })
            ProfileInfoRow(label = "Nascimento", value = profile.birthDate.ifBlank { "-" })
        }
    }
}

@Composable
private fun ProfileAvatar(profile: ProfileResponse) {
    val avatarUrl = profile.avatarUrl
        .takeIf { it.isNotBlank() }
        ?.let { path ->
            if (path.startsWith("http://") || path.startsWith("https://")) {
                path
            } else {
                "$S3_BASE_URL/${path.trimStart('/')}"
            }
        }
    var avatarLoadFailed by remember(avatarUrl) {
        mutableStateOf(false)
    }

    Box(
        modifier = Modifier
            .size(68.dp)
            .clip(CircleShape)
            .background(SangueDocePrimary.copy(alpha = 0.12f)),
        contentAlignment = Alignment.Center
    ) {
        if (avatarUrl != null && !avatarLoadFailed) {
            AsyncImage(
                model = avatarUrl,
                contentDescription = "Foto de ${profile.name}",
                contentScale = ContentScale.Crop,
                onError = {
                    avatarLoadFailed = true
                },
                modifier = Modifier.fillMaxSize()
            )
        } else {
            Icon(
                imageVector = Icons.Default.Person,
                contentDescription = null,
                tint = SangueDocePrimary,
                modifier = Modifier.size(36.dp)
            )
        }
    }
}

@Composable
private fun ProfileInfoRow(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            color = SangueDoceMutedText,
            fontSize = 14.sp
        )

        Text(
            text = value,
            color = SangueDoceInk,
            fontSize = 14.sp,
            fontWeight = FontWeight.SemiBold,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun SettingsCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SangueDoceCard),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.Settings,
                    contentDescription = null,
                    tint = SangueDocePrimary
                )
                Spacer(modifier = Modifier.width(10.dp))
                Text(
                    text = "Configurações",
                    color = SangueDoceInk,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            HorizontalDivider(color = Color(0xFFE1E8F0))

            ProfileInfoRow(label = "Faixas de glicose", value = "Padrão")
            ProfileInfoRow(label = "Unidade", value = "mg/dL")
            ProfileInfoRow(label = "Fuso horário", value = "America/Manaus")
        }
    }
}

@Composable
private fun LoadingProfileCard() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SangueDoceCard)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(180.dp),
            contentAlignment = Alignment.Center
        ) {
            CircularProgressIndicator(color = SangueDocePrimary)
        }
    }
}

@Composable
private fun ErrorProfileCard(
    message: String,
    onRetry: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SangueDoceCard)
    ) {
        Column(
            modifier = Modifier.padding(18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Nao foi possivel carregar o perfil",
                color = SangueDoceInk,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = message,
                color = SangueDoceMutedText,
                fontSize = 14.sp
            )

            Button(onClick = onRetry) {
                Text("Tentar novamente")
            }
        }
    }
}
