package br.com.sanguedoce.app.ui

import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import br.com.sanguedoce.app.model.reading.ReadingUi

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar

import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp


@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReadingsScreen(
    readings: List<ReadingUi>,
    onAddClick: () -> Unit
) {
    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = Color(0xFFF4F7FA),

        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Sangue Doce",
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        },

        floatingActionButton = {
            FloatingActionButton(
                onClick = onAddClick,
                modifier = Modifier.navigationBarsPadding(),
                containerColor = Color(0xFF2F80C9),
                contentColor = Color.White
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = "Adicionar leitura"
                )
            }
        }
    ) { innerPadding ->

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding),
            contentPadding = PaddingValues(
                start = 16.dp,
                top = 16.dp,
                end = 16.dp,
                bottom = 96.dp
            ),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Leituras de hoje",
                    modifier = Modifier.padding(
                        start = 4.dp,
                        bottom = 4.dp
                    ),
                    color = Color(0xFF1D2D44),
                    fontSize = 24.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            items(
                items = readings,
                key = { reading -> reading.id }
            ) { reading ->
                ReadingCard(reading = reading)
            }
        }
    }
}

@Composable
private fun ReadingCard(
    reading: ReadingUi
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Text(
                text = reading.period,
                color = Color(0xFF203D63),
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "${reading.glucose} mg/dL",
                modifier = Modifier.padding(top = 6.dp),
                color = glucoseColor(reading.glucose),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = reading.time,
                modifier = Modifier.padding(top = 4.dp),
                color = Color(0xFF777777),
                fontSize = 14.sp
            )
        }
    }
}

private fun glucoseColor(value: Int): Color {
    return when {
        value < 80 -> Color(0xFFD63031)
        value <= 120 -> Color(0xFF00B894)
        value <= 180 -> Color(0xFFF39C12)
        else -> Color(0xFFD63031)
    }
}