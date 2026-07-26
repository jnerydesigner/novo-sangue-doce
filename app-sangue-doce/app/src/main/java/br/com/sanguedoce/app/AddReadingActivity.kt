package br.com.sanguedoce.app

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import br.com.sanguedoce.app.service.SaveReadingService
import br.com.sanguedoce.app.ui.componentes.SangueDoceButton
import kotlinx.coroutines.launch

private val ScreenBackground = Color(0xFFF4F7FA)
private val PrimaryBlue = Color(0xFF2F80C9)
private val Ink = Color(0xFF1D2D44)
private val MutedText = Color(0xFF5D6B7A)

class AddReadingActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            MaterialTheme {
                AddReadingScreen(
                    onBackClick = ::finish,
                    onSaveReading = { value, onFinished ->
                        saveReading(
                            value = value,
                            onFinished = onFinished
                        )
                    }
                )
            }
        }
    }

    private fun saveReading(
        value: Int,
        onFinished: () -> Unit
    ) {
        lifecycleScope.launch {
            try {
                SaveReadingService(this@AddReadingActivity).execute(value)

                Toast.makeText(
                    this@AddReadingActivity,
                    "Medição salva com sucesso",
                    Toast.LENGTH_SHORT
                ).show()

                finish()
            } catch (exception: Exception) {
                Toast.makeText(
                    this@AddReadingActivity,
                    "Erro ao salvar a medição",
                    Toast.LENGTH_SHORT
                ).show()

                onFinished()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddReadingScreen(
    onBackClick: () -> Unit,
    onSaveReading: (Int, () -> Unit) -> Unit
) {
    var value by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isSaving by remember { mutableStateOf(false) }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = ScreenBackground,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Nova medição",
                        color = Ink,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        enabled = !isSaving
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Voltar",
                            tint = Ink
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ScreenBackground
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(ScreenBackground)
                .padding(innerPadding)
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Text(
                text = "Informe o valor medido agora.",
                color = MutedText,
                fontSize = 15.sp
            )

            OutlinedTextField(
                value = value,
                onValueChange = { newValue ->
                    value = newValue.filter { it.isDigit() }.take(3)
                    errorMessage = null
                },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("Glicemia") },
                suffix = { Text("mg/dL") },
                singleLine = true,
                isError = errorMessage != null,
                supportingText = {
                    errorMessage?.let { message ->
                        Text(message)
                    }
                },
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Number
                ),
                enabled = !isSaving
            )


            SangueDoceButton(
                onClick = {
                    val parsedValue = value.toIntOrNull()

                    if (parsedValue == null || parsedValue <= 0) {
                        errorMessage = "Informe um valor válido."
                    } else {
                        isSaving = true
                        onSaveReading(parsedValue) {
                            isSaving = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isSaving
            ) {
                if (isSaving) {
                    CircularProgressIndicator(
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Salvar medição")
                }
            }

            Text(
                text = "O horário será registrado automaticamente.",
                modifier = Modifier.fillMaxWidth(),
                color = MutedText,
                fontSize = 13.sp,
                textAlign = TextAlign.Center
            )
        }
    }
}
