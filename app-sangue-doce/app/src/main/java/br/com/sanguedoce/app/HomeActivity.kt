package br.com.sanguedoce.app

import android.content.Intent
import android.graphics.Paint
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.libs.hexToArgb
import br.com.sanguedoce.app.model.home.AppHomeCardResponse
import br.com.sanguedoce.app.model.home.AppHomeGraphResponse
import br.com.sanguedoce.app.model.home.AppHomeResponse
import br.com.sanguedoce.app.repository.HomeRepository
import br.com.sanguedoce.app.ui.SangueDoceBackground
import br.com.sanguedoce.app.ui.SangueDoceCard
import br.com.sanguedoce.app.ui.SangueDoceInk
import br.com.sanguedoce.app.ui.SangueDoceMutedText
import br.com.sanguedoce.app.ui.SangueDocePrimary
import br.com.sanguedoce.app.ui.componentes.SangueDoceBottomBar
import br.com.sanguedoce.app.ui.home.HomeUiState
import br.com.sanguedoce.app.ui.home.HomeViewModel
import br.com.sanguedoce.app.ui.home.HomeViewModelFactory

class HomeActivity : ComponentActivity() {

    private val viewModel: HomeViewModel by viewModels {
        HomeViewModelFactory(
            HomeRepository(RetrofitClient.api)
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

                HomeRoute(
                    uiState = uiState,
                    onRetry = viewModel::loadHome,
                    onHomeClick = {
                        // Already on the home screen.
                    },
                    onMeasurementsClick = {
                        startActivity(Intent(this@HomeActivity, MainActivity::class.java))
                    },
                    onContentClick = {
                        // Add navigation when the content screen is available.
                    },
                    onProfileClick = {
                        // Add navigation when the profile screen is available.
                    }
                )
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
            return
        }

        viewModel.loadHome()
    }
}

@Composable
private fun HomeRoute(
    uiState: HomeUiState,
    onRetry: () -> Unit,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    when (uiState) {
        HomeUiState.Loading -> LoadingContent()

        is HomeUiState.Success -> {
            HomeScreen(
                home = uiState.home,
                onHomeClick = onHomeClick,
                onMeasurementsClick = onMeasurementsClick,
                onContentClick = onContentClick,
                onProfileClick = onProfileClick
            )
        }

        is HomeUiState.Error -> {
            ErrorContent(
                message = uiState.message,
                onRetry = onRetry
            )
        }
    }
}

@Composable
private fun HomeScreen(
    home: AppHomeResponse,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onContentClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = SangueDoceBackground,
        bottomBar = {
            SangueDoceBottomBar(
                selectedItem = "home",
                onHomeClick = onHomeClick,
                onMeasurementsClick = onMeasurementsClick,
                onContentClick = onContentClick,
                onProfileClick = onProfileClick
            )
        }
    ) { innerPadding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SangueDoceBackground),
            contentPadding = PaddingValues(
                start = 8.dp,
                top = 12.dp,
                end = 8.dp,
                bottom = 24.dp
            ),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Resumo",
                    color = SangueDoceInk,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black
                )
            }

            item {
                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = home.greeting,
                    color = SangueDoceMutedText,
                    fontSize = 13.sp
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = home.title,
                        color = SangueDoceInk,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Switch(
                        checked = true,
                        onCheckedChange = {}
                    )
                }
            }

            if (home.graph.isNotEmpty()) {
                item {
                    GlucoseChartCard(readings = home.graph)
                }
            }

            items(
                items = home.cards,
                key = { card -> card.id }
            ) { card ->
                HomeSummaryCard(card = card)
            }
        }
    }
}

@Composable
fun TitleWithDot(
    title: String,
    dotColor: Color = SangueDocePrimary
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(
                    color = dotColor,
                    shape = CircleShape
                )
        )

        Text(
            text = title,
            color = SangueDoceInk,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium
        )
    }
}


@Composable
private fun HomeSummaryCard(
    card: AppHomeCardResponse
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = SangueDoceCard
        ),
        border = BorderStroke(
            width = 1.dp,
            color = Color(hexToArgb(card.tone))
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
//            Text(
//                text = card.title,
//                color = SangueDoceInk,
//                fontSize = 14.sp,
//                fontWeight = FontWeight.Medium
//            )

            TitleWithDot(
                title = card.title,
                dotColor = Color(hexToArgb(card.tone))
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Bottom
            ) {
                Text(
                    text = card.value,
                    color = Color(hexToArgb(card.tone)),
                    fontSize = 30.sp,
                    fontWeight = FontWeight.Black
                )

                Text(
                    text = card.status,
                    color = Color(hexToArgb(card.tone)),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.End
                )
            }
        }
    }
}

@Composable
private fun GlucoseChartCard(
    readings: List<AppHomeGraphResponse>
) {
    val chartReadings = readings.take(4)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = SangueDoceCard
        ),
        border = BorderStroke(
            width = 1.dp,
            color = SangueDocePrimary
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = "Glicemia ao longo do dia",
                color = SangueDoceInk,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )

            GlucoseChart(
                readings = chartReadings,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(150.dp)
            )

            ChartHourLabels(readings = chartReadings)
        }
    }
}

@Composable
private fun GlucoseChart(
    readings: List<AppHomeGraphResponse>,
    modifier: Modifier = Modifier
) {
    if (readings.isEmpty()) return

    Canvas(modifier = modifier) {
        val values = readings.map { it.value }
        val maxValue = values.maxOrNull()?.toFloat() ?: 1f
        val minValue = values.minOrNull()?.toFloat() ?: 0f
        val range = (maxValue - minValue).coerceAtLeast(1f)
        val topPadding = 10f
        val bottomPadding = 10f
        val horizontalPadding = 14f
        val chartHeight = size.height - topPadding - bottomPadding
        val chartWidth = size.width - horizontalPadding * 2
        val stepX = if (values.size > 1) {
            chartWidth / (values.size - 1)
        } else {
            chartWidth
        }
        val gridColor = Color(0xFFD9E1E8)
        val lineColor = SangueDocePrimary

        repeat(4) { index ->
            val y = topPadding + (chartHeight / 3f) * index
            drawLine(
                color = gridColor,
                start = Offset(horizontalPadding, y),
                end = Offset(size.width - horizontalPadding, y),
                strokeWidth = 1.2f
            )
        }

        val path = Path()

        values.forEachIndexed { index, value ->
            val x = horizontalPadding + index * stepX
            val normalizedValue = (value.toFloat() - minValue) / range
            val y = topPadding + chartHeight - normalizedValue * chartHeight

            if (index == 0) {
                path.moveTo(x, y)
            } else {
                path.lineTo(x, y)
            }
        }

        drawPath(
            path = path,
            color = lineColor,
            style = Stroke(width = 4f)
        )

        values.forEachIndexed { index, value ->
            val x = horizontalPadding + index * stepX
            val normalizedValue = (value.toFloat() - minValue) / range
            val y = topPadding + chartHeight - normalizedValue * chartHeight

            drawContext.canvas.nativeCanvas.drawText(
                value.toString(),
                x,
                (y - 22f).coerceAtLeast(14f),
                Paint().apply {
                    color = android.graphics.Color.rgb(29, 45, 68)
                    textAlign = Paint.Align.CENTER
                    textSize = 24f
                    isAntiAlias = true
                    typeface = android.graphics.Typeface.DEFAULT_BOLD
                }
            )

            drawCircle(
                color = lineColor,
                radius = 8f,
                center = Offset(x, y)
            )

            drawCircle(
                color = Color.White,
                radius = 4.5f,
                center = Offset(x, y)
            )
        }
    }
}

@Composable
private fun ChartHourLabels(
    readings: List<AppHomeGraphResponse>
) {
    if (readings.isEmpty()) return

    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        readings.forEach { reading ->
            Text(
                text = reading.hour,
                color = SangueDoceMutedText,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}


@Composable
private fun LoadingContent() {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SangueDoceBackground),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = SangueDocePrimary
        )
    }
}

@Composable
private fun ErrorContent(
    message: String,
    onRetry: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(SangueDoceBackground)
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = message,
                color = SangueDoceInk,
                fontSize = 16.sp,
                textAlign = TextAlign.Center
            )

            Button(onClick = onRetry) {
                Text(text = "Tentar novamente")
            }
        }
    }
}

private fun String.asToneColor(color: String): Color {
    return when (lowercase()) {
        "success", "normal", "good", "ok" -> Color(hexToArgb(color))
        "warning", "alert", "attention" -> Color(hexToArgb(color))
        "danger", "error", "high", "low" -> Color(hexToArgb(color))
        else -> SangueDocePrimary
    }
}

@Preview(showBackground = true)
@Composable
private fun HomeScreenPreview() {
    MaterialTheme {
        HomeScreen(
            home = AppHomeResponse(
                greeting = "Bom dia, Jander!",
                title = "Resumo de hoje",
                graph = listOf(
                    AppHomeGraphResponse("08:00", 240),
                    AppHomeGraphResponse("12:00", 150),
                    AppHomeGraphResponse("16:00", 180),
                    AppHomeGraphResponse("18:00", 120)
                ),
                cards = listOf(
                    AppHomeCardResponse(
                        id = "glucose",
                        title = "Glicemia",
                        value = "125 mg/dL",
                        status = "Normal",
                        tone = "success"
                    )
                )
            ),
            onHomeClick = {},
            onMeasurementsClick = {},
            onContentClick = {},
            onProfileClick = {}
        )
    }
}
