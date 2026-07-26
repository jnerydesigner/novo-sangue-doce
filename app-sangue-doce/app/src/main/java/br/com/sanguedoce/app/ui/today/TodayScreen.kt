package br.com.sanguedoce.app.ui.today

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.sanguedoce.app.model.TodayResponse
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

private val ScreenBackground = Color(0xFFF4F7FA)
private val PrimaryBlue = Color(0xFF2F80C9)
private val Ink = Color(0xFF1D2D44)
private val MutedText = Color(0xFF5D6B7A)
private val CardSurface = Color.White

@Composable
fun TodayRoute(
    uiState: TodayUiState,
    onRetry: () -> Unit,
    onAddClick: () -> Unit
) {
    when (uiState) {
        TodayUiState.Loading -> LoadingContent()

        is TodayUiState.Success -> {
            TodayScreen(
                readings = uiState.readings,
                isRefreshing = uiState.isRefreshing,
                onRefresh = onRetry,
                onAddClick = onAddClick
            )
        }

        is TodayUiState.Error -> {
            ErrorContent(
                message = uiState.message,
                onRetry = onRetry
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun TodayScreen(
    readings: List<TodayResponse>,
    isRefreshing: Boolean,
    onRefresh: () -> Unit,
    onAddClick: () -> Unit
) {
    val currentDate = remember { currentDisplayDate() }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = ScreenBackground,
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = "Leituras de hoje",
                            color = Ink,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Text(
                            text = currentDate,
                            color = MutedText,
                            fontSize = 14.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = ScreenBackground
                )
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddClick,
                modifier = Modifier.navigationBarsPadding(),
                containerColor = PrimaryBlue,
                contentColor = Color.White
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Adicionar leitura"
                )
            }
        }
    ) { innerPadding ->
        PullToRefreshBox(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            isRefreshing = isRefreshing,
            onRefresh = onRefresh
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    top = 12.dp,
                    end = 16.dp,
                    bottom = 100.dp
                ),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (readings.isEmpty()) {
                    item {
                        EmptyContent(
                            modifier = Modifier.fillParentMaxSize(),
                            onAddClick = onAddClick
                        )
                    }
                } else {
                    item {
                        Text(
                            text = readingCountLabel(readings.size),
                            modifier = Modifier.padding(
                                start = 4.dp,
                                bottom = 2.dp
                            ),
                            color = MutedText,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    items(
                        items = readings,
                        key = { reading -> reading.id }
                    ) { reading ->
                        TodayCard(reading)
                    }
                }
            }
        }
    }
}

@Composable
private fun TodayCard(
    reading: TodayResponse
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = CardSurface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = reading.noteLabel,
                    color = Ink,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold
                )

                Text(
                    text = formatTime(reading.measuredAt),
                    color = MutedText,
                    fontSize = 14.sp
                )
            }

            Text(
                text = "${reading.glucoseValueMgDl} mg/dL",
                modifier = Modifier.padding(start = 16.dp),
                color = glucoseColor(reading.glucoseValueMgDl),
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun EmptyContent(
    modifier: Modifier = Modifier,
    onAddClick: () -> Unit
) {
    Box(
        modifier = modifier
            .background(ScreenBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Nenhuma leitura registrada hoje",
                color = Ink,
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center
            )

            Text(
                text = "Adicione sua primeira medição para acompanhar o dia.",
                color = MutedText,
                fontSize = 15.sp,
                textAlign = TextAlign.Center
            )

            Button(
                onClick = onAddClick,
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Text("Adicionar leitura")
            }
        }
    }
}

@Composable
private fun LoadingContent() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(ScreenBackground),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(color = PrimaryBlue)
    }
}

@Composable
private fun ErrorContent(
    message: String,
    onRetry: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(ScreenBackground)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = message,
            color = Ink,
            textAlign = TextAlign.Center
        )

        Button(
            onClick = onRetry,
            modifier = Modifier.padding(top = 12.dp)
        ) {
            Text("Tentar novamente")
        }
    }
}

private fun glucoseColor(value: Int): Color {
    return when {
        value < 80 -> Color(0xFFC62828)
        value <= 120 -> Color(0xFF00875A)
        value <= 180 -> Color(0xFFB26A00)
        else -> Color(0xFFC62828)
    }
}

private fun readingCountLabel(count: Int): String {
    return if (count == 1) {
        "1 registro"
    } else {
        "$count registros"
    }
}

private fun currentDisplayDate(): String {
    val formatter = SimpleDateFormat(
        "dd/MM/yyyy",
        Locale.getDefault()
    )

    return formatter.format(Date())
}

private fun formatTime(measuredAt: String): String {
    return measuredAt
        .substringAfter("T", measuredAt)
        .substringBefore(".")
        .removeSuffix("Z")
        .substringBeforeLast(":")
}
