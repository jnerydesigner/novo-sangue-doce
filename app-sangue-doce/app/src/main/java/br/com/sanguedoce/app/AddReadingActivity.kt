package br.com.sanguedoce.app

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.lifecycleScope
import br.com.sanguedoce.app.constants.MeasurementNoteType
import br.com.sanguedoce.app.service.SaveReadingService
import br.com.sanguedoce.app.service.UploadReadingImageService
import br.com.sanguedoce.app.ui.SangueDoceStatusBarScrim
import br.com.sanguedoce.app.ui.componentes.SangueDoceButton
import br.com.sanguedoce.app.ui.componentes.SangueDoceBottomBar
import br.com.sanguedoce.app.ui.configureSangueDoceSystemBars
import kotlinx.coroutines.launch
import retrofit2.HttpException

private val ScreenBackground = Color(0xFFF4F7FA)
private val Ink = Color(0xFF1D2D44)
private val MutedText = Color(0xFF5D6B7A)
private const val AddReadingLogTag = "AddReadingActivity"

class AddReadingActivity : ComponentActivity() {

    companion object {
        const val EXTRA_EDIT_MODE = "extra_edit_mode"
        const val EXTRA_MEASUREMENT_ID = "extra_measurement_id"
        const val EXTRA_GLUCOSE_VALUE = "extra_glucose_value"
        const val EXTRA_NOTE_TYPE = "extra_note_type"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureSangueDoceSystemBars()

        val editMode = intent.getBooleanExtra(EXTRA_EDIT_MODE, false)
        val measurementId = intent.getStringExtra(EXTRA_MEASUREMENT_ID)
        val initialValue = intent.getIntExtra(EXTRA_GLUCOSE_VALUE, 0)
            .takeIf { it > 0 }
            ?.toString()
            .orEmpty()
        val initialNoteType = intent.getStringExtra(EXTRA_NOTE_TYPE)
            ?.let(MeasurementNoteType::fromName)
            ?: MeasurementNoteType.ROUTINE_CHECK

        setContent {
            MaterialTheme {
                Box {
                    AddReadingScreen(
                        editMode = editMode,
                        initialValue = initialValue,
                        initialNoteType = initialNoteType,
                        onBackClick = ::finish,
                        onHomeClick = {
                            startActivity(Intent(this@AddReadingActivity, HomeActivity::class.java))
                            finish()
                        },
                        onMeasurementsClick = {
                            startActivity(Intent(this@AddReadingActivity, MainActivity::class.java))
                            finish()
                        },
                        onContentClick = {
                            startActivity(Intent(this@AddReadingActivity, MealsActivity::class.java))
                            finish()
                        },
                        onProfileClick = {
                            startActivity(Intent(this@AddReadingActivity, ProfileActivity::class.java))
                            finish()
                        },
                        onBloodClick = {
                            // Already on the new measurement screen.
                        },
                        onSaveReading = { value, noteType, onFinished ->
                            saveReading(
                                value = value,
                                noteType = noteType,
                                editMode = editMode,
                                measurementId = measurementId,
                                onFinished = onFinished
                            )
                        },
                        onUploadReadingImage = { imageUri, onFinished ->
                            uploadReadingImage(
                                imageUri = imageUri,
                                onFinished = onFinished
                            )
                        }
                    )

                    SangueDoceStatusBarScrim(
                        modifier = Modifier.align(Alignment.TopCenter)
                    )
                }
            }
        }
    }



    private fun saveReading(
        value: Int,
        noteType: MeasurementNoteType,
        editMode: Boolean,
        measurementId: String?,
        onFinished: () -> Unit
    ) {
        lifecycleScope.launch {
            try {
                val service = SaveReadingService(this@AddReadingActivity)
                if (editMode && !measurementId.isNullOrBlank()) {
                    service.update(
                        id = measurementId,
                        value = value,
                        readingContext = noteType.name
                    )
                } else {
                    service.execute(
                        value = value,
                        readingContext = noteType.name
                    )
                }

                Toast.makeText(
                    this@AddReadingActivity,
                    if (editMode) "Medição atualizada com sucesso" else "Medição salva com sucesso",
                    Toast.LENGTH_SHORT
                ).show()

                finish()
            } catch (exception: Exception) {
                Log.e(AddReadingLogTag, "Erro ao salvar medicao manual", exception)
                Toast.makeText(
                    this@AddReadingActivity,
                    "Erro ao salvar a medição",
                    Toast.LENGTH_SHORT
                ).show()

                onFinished()
            }
        }
    }

    private fun uploadReadingImage(
        imageUri: Uri,
        onFinished: () -> Unit
    ) {
        lifecycleScope.launch {
            try {
                val measurement = UploadReadingImageService(this@AddReadingActivity).execute(imageUri)
                Log.i(
                    AddReadingLogTag,
                    "Medição importada pelo print. id=${measurement.id} measuredAt=${measurement.measuredAt} glucoseValueMgDl=${measurement.glucoseValueMgDl} noteType=${measurement.noteType}"
                )

                Toast.makeText(
                    this@AddReadingActivity,
                    "Medição importada com sucesso",
                    Toast.LENGTH_SHORT
                ).show()

                startActivity(Intent(this@AddReadingActivity, MainActivity::class.java))
                finish()
            } catch (exception: Exception) {
                Log.e(AddReadingLogTag, "Erro ao importar medicao pelo print", exception)
                val message = exception.toUploadErrorMessage()
                Toast.makeText(
                    this@AddReadingActivity,
                    message,
                    Toast.LENGTH_LONG
                ).show()

                onFinished()
            }
        }
    }
}

private fun Exception.toUploadErrorMessage(): String {
    if (this is HttpException) {
        val errorBody = response()?.errorBody()?.string()
        return "Erro ao importar print (${code()}): ${errorBody ?: message()}"
    }

    return "Erro ao importar print: ${message ?: "falha desconhecida"}"
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun AddReadingScreen(
    editMode: Boolean,
    initialValue: String,
    initialNoteType: MeasurementNoteType,
    onBackClick: () -> Unit,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onProfileClick: () -> Unit,
    onBloodClick: () -> Unit,
    onSaveReading: (
        value: Int,
        noteType: MeasurementNoteType,
        onFinished: () -> Unit
    ) -> Unit,
    onUploadReadingImage: (
        imageUri: Uri,
        onFinished: () -> Unit
    ) -> Unit
) {
    var value by remember { mutableStateOf(initialValue) }
    var errorMessage by remember { mutableStateOf<String?>(null) }
    var isSaving by remember { mutableStateOf(false) }
    var isUploadingImage by remember { mutableStateOf(false) }

    var selectedNoteType by remember {
        mutableStateOf(initialNoteType)
    }

    var noteTypeExpanded by remember {
        mutableStateOf(false)
    }
    val isBusy = isSaving || isUploadingImage
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { imageUri ->
        if (imageUri != null) {
            isUploadingImage = true
            onUploadReadingImage(imageUri) {
                isUploadingImage = false
            }
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = ScreenBackground,
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = if (editMode) "Editar medição" else "Nova medição",
                        color = Ink,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold
                    )
                },
                navigationIcon = {
                    IconButton(
                        onClick = onBackClick,
                        enabled = !isBusy
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
        },
        bottomBar = {
            SangueDoceBottomBar(
                selectedItem = "measurements",
                onHomeClick = onHomeClick,
                onMeasurementsClick = onMeasurementsClick,
                onContentClick = onContentClick,
                onProfileClick = onProfileClick,
                onBloodClick = onBloodClick
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
                    value = newValue
                        .filter { it.isDigit() }
                        .take(3)

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
                enabled = !isBusy
            )

            ExposedDropdownMenuBox(
                expanded = noteTypeExpanded,
                onExpandedChange = {
                    if (!isBusy) {
                        noteTypeExpanded = !noteTypeExpanded
                    }
                }
            ) {
                OutlinedTextField(
                    value = selectedNoteType.label,
                    onValueChange = {},
                    modifier = Modifier
                        .menuAnchor(
                            type = ExposedDropdownMenuAnchorType.PrimaryNotEditable,
                            enabled = !isBusy
                        )
                        .fillMaxWidth(),
                    readOnly = true,
                    enabled = !isBusy,
                    label = {
                        Text("Contexto da medição")
                    },
                    trailingIcon = {
                        ExposedDropdownMenuDefaults.TrailingIcon(
                            expanded = noteTypeExpanded
                        )
                    }
                )

                ExposedDropdownMenu(
                    expanded = noteTypeExpanded,
                    onDismissRequest = {
                        noteTypeExpanded = false
                    }
                ) {
                    MeasurementNoteType.entries.forEach { noteType ->
                        DropdownMenuItem(
                            text = {
                                Text(noteType.label)
                            },
                            onClick = {
                                selectedNoteType = noteType
                                noteTypeExpanded = false
                            }
                        )
                    }
                }
            }

            SangueDoceButton(
                onClick = {
                    val parsedValue = value.toIntOrNull()

                    if (parsedValue == null || parsedValue <= 0) {
                        errorMessage = "Informe um valor válido."
                    } else {
                        isSaving = true

                        onSaveReading(
                            parsedValue,
                            selectedNoteType
                        ) {
                            isSaving = false
                        }
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                enabled = !isBusy
            ) {
                if (isSaving) {
                    CircularProgressIndicator(
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(if (editMode) "Atualizar medição" else "Salvar medição")
                }
            }

            if (!editMode) {
                OutlinedButton(
                    onClick = {
                        imagePickerLauncher.launch("image/*")
                    },
                    modifier = Modifier.fillMaxWidth(),
                    enabled = !isBusy
                ) {
                    if (isUploadingImage) {
                        CircularProgressIndicator(
                            strokeWidth = 2.dp
                        )
                    } else {
                        Text("Importar medição por print")
                    }
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
