package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.LoginRequest
import br.com.sanguedoce.app.ui.SangueDoceBackground
import br.com.sanguedoce.app.ui.SangueDoceCard
import br.com.sanguedoce.app.ui.SangueDoceInk
import br.com.sanguedoce.app.ui.SangueDoceMutedText
import br.com.sanguedoce.app.ui.componentes.SangueDoceButton
import kotlinx.coroutines.launch

class LoginActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
//        if (AuthSession.isLoggedIn(this)) { openMain(); return }
        setContent {
            MaterialTheme {
                LoginScreen(
                    onLogin = { email, password, onFinished ->
                        login(
                            email = email,
                            password = password,
                            onFinished = onFinished
                        )
                    }
                )
            }
        }
    }

    private fun login(
        email: String,
        password: String,
        onFinished: (String?) -> Unit
    ) {
        lifecycleScope.launch {
            try {
                val response = RetrofitClient.api.login(
                    LoginRequest(
                        email = email,
                        password = password
                    )
                )

                RetrofitClient.setToken(response.accessToken)
                AuthSession.signIn(this@LoginActivity, response.accessToken, email)
                openMain()
            } catch (erro: Exception) {
                onFinished("Erro ao conectar com o servidor")
                Toast.makeText(
                    this@LoginActivity,
                    "Não foi possível fazer login",
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }

    private fun openMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun LoginScreen(
    initialEmail: String = "",
    initialPassword: String = "",
    onLogin: (String, String, (String?) -> Unit) -> Unit
) {
    var email by remember { mutableStateOf(initialEmail) }
    var password by remember { mutableStateOf(initialPassword) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isLoading by remember { mutableStateOf(false) }

    fun submit() {
        val normalizedEmail = email.trim()

        if (normalizedEmail.isBlank() || password.isBlank()) {
            errorMessage = "Informe e-mail e senha para continuar."
            return
        }

        isLoading = true
        errorMessage = null
        onLogin(normalizedEmail, password) { message ->
            isLoading = false
            errorMessage = message
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = SangueDoceBackground
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .imePadding()
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 24.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            LoginHeader()

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(// var email by remember { mutableStateOf("") }
                    containerColor = SangueDoceCard
                ),
                elevation = CardDefaults.cardElevation(
                    defaultElevation = 2.dp
                )
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "Acesse sua conta",
                        color = SangueDoceInk,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Text(
                        text = "Entre para registrar suas medições e acompanhar o seu dia.",
                        color = SangueDoceMutedText,
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )

                    OutlinedTextField(
                        value = email,
                        onValueChange = {
                            email = it
                            errorMessage = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("E-mail") },
                        singleLine = true,
                        isError = errorMessage != null,
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Email,
                            imeAction = ImeAction.Next
                        ),
                        enabled = !isLoading
                    )

                    OutlinedTextField(
                        value = password,
                        onValueChange = {
                            password = it
                            errorMessage = null
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text("Senha") },
                        singleLine = true,
                        isError = errorMessage != null,
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                if (!isLoading) submit()
                            }
                        ),
                        enabled = !isLoading
                    )

                    errorMessage?.let { message ->
                        Text(
                            text = message,
                            modifier = Modifier.fillMaxWidth(),
                            color = Color(0xFFB3261E),
                            fontSize = 13.sp
                        )
                    }

                    SangueDoceButton(
                        onClick = ::submit,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        enabled = !isLoading
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(20.dp),
                                color = Color.White,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Entrar",
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }

            FlowRow(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(
                    space = 8.dp,
                    alignment = Alignment.CenterHorizontally
                ),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                LoginPill("Medições")
                LoginPill("Carboidratos")
                LoginPill("Sono")
            }
        }
    }
}

@Composable
private fun LoginHeader() {
    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(112.dp)
                .clip(RoundedCornerShape(24.dp))
                .background(SangueDoceBackground),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = R.drawable.sangue_doce),
                contentDescription = "Sangue Doce",
                modifier = Modifier.size(88.dp),
                contentScale = ContentScale.Fit
            )
        }

        Spacer(modifier = Modifier.height(18.dp))

        Text(
            text = "Sangue Doce",
            color = SangueDoceInk,
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center
        )

        Text(
            text = "Seu caderno diário de cuidado com a glicemia.",
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 6.dp),
            color = SangueDoceMutedText,
            fontSize = 15.sp,
            lineHeight = 21.sp,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
private fun LoginPill(
    text: String
) {
    Surface(
        shape = RoundedCornerShape(999.dp),
        color = Color.White.copy(alpha = 0.74f)
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginScreenPreview() {
    MaterialTheme {
        LoginScreen(
            onLogin = { _, _, _ -> }
        )
    }
}
