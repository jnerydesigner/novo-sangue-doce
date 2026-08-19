package br.com.sanguedoce.app

import android.content.Intent
import android.os.Bundle
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.AssistChipDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.pulltorefresh.PullToRefreshBox
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.com.sanguedoce.app.api.RetrofitClient
import br.com.sanguedoce.app.model.consumptions.FoodConsumptionItem
import br.com.sanguedoce.app.model.consumptions.FoodConsumptions
import br.com.sanguedoce.app.model.consumptions.FoodSearchResult
import br.com.sanguedoce.app.model.consumptions.SaveFoodConsumptionItemRequest
import br.com.sanguedoce.app.model.consumptions.SaveFoodConsumptionRequest
import br.com.sanguedoce.app.ui.SangueDoceBackground
import br.com.sanguedoce.app.ui.SangueDoceBorderColor
import br.com.sanguedoce.app.ui.SangueDoceCard
import br.com.sanguedoce.app.ui.SangueDoceInk
import br.com.sanguedoce.app.ui.SangueDoceMutedText
import br.com.sanguedoce.app.ui.SangueDocePrimary
import br.com.sanguedoce.app.ui.SangueDoceStatusBarScrim
import br.com.sanguedoce.app.ui.componentes.SangueDoceBottomBar
import br.com.sanguedoce.app.ui.configureSangueDoceSystemBars
import kotlinx.coroutines.launch
import java.text.DecimalFormat
import java.text.DecimalFormatSymbols
import java.text.SimpleDateFormat
import java.util.Locale
import java.util.TimeZone
import androidx.compose.foundation.text.KeyboardOptions

private val Green = Color(0xFF2F8A52)
private val SoftGreen = Color(0xFF35D07F)
private val Orange = Color(0xFFF59F00)
private val Purple = Color(0xFF9B59C8)
private val Red = Color(0xFFF54E45)
private val DarkBlue = Color(0xFF26384C)

private data class NutrientSummary(
    val label: String,
    val value: String,
    val color: Color,
    val amount: Float
)

private data class DraftFoodItem(
    val food: FoodSearchResult,
    val quantity: String = "100",
    val unit: String = "GRAM",
    val weightG: String = "100"
)

private sealed class FoodConsumptionUiState {
    object Loading : FoodConsumptionUiState()
    data class Success(
        val consumptions: List<FoodConsumptions>,
        val selectedConsumption: FoodConsumptions? = null,
        val isRefreshing: Boolean = false,
        val isLoadingDetail: Boolean = false
    ) : FoodConsumptionUiState()
    data class Error(val message: String) : FoodConsumptionUiState()
}

private enum class MealsDestination {
    Overview,
    Detail,
    Create
}

class MealsActivity : ComponentActivity() {
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
                val scope = rememberCoroutineScope()
                var uiState by remember { mutableStateOf<FoodConsumptionUiState>(FoodConsumptionUiState.Loading) }
                var reloadKey by remember { mutableStateOf(0) }
                var destination by remember { mutableStateOf(MealsDestination.Overview) }
                var selectedMealType by remember { mutableStateOf<String?>(null) }
                var detailLoadRequest by remember { mutableStateOf(0) }
                var draftMealType by remember { mutableStateOf("LUNCH") }
                var draftNotes by remember { mutableStateOf("") }
                var draftFoodSearch by remember { mutableStateOf("") }
                var foodResults by remember { mutableStateOf<List<FoodSearchResult>>(emptyList()) }
                var draftItems by remember { mutableStateOf<List<DraftFoodItem>>(emptyList()) }
                var searchingFoods by remember { mutableStateOf(false) }
                var savingMeal by remember { mutableStateOf(false) }

                LaunchedEffect(reloadKey) {
                    uiState = when (val currentState = uiState) {
                        is FoodConsumptionUiState.Success -> currentState.copy(isRefreshing = true)
                        else -> FoodConsumptionUiState.Loading
                    }

                    uiState = try {
                        val consumptions = RetrofitClient.api.getFoodConsumptionsToday()

                        FoodConsumptionUiState.Success(
                            consumptions = consumptions,
                            selectedConsumption = selectedMealType?.let { mealType ->
                                consumptions.firstOrNull { it.mealType == mealType }
                            }
                        )
                    } catch (error: Exception) {
                        FoodConsumptionUiState.Error(
                            error.message ?: "Nao foi possivel carregar as refeicoes."
                        )
                    }
                }

                LaunchedEffect(selectedMealType, detailLoadRequest) {
                    val mealType = selectedMealType ?: return@LaunchedEffect
                    val currentState = uiState as? FoodConsumptionUiState.Success ?: return@LaunchedEffect

                    uiState = currentState.copy(isLoadingDetail = true)

                    uiState = try {
                        currentState.copy(
                            selectedConsumption = RetrofitClient.api.getFoodConsumptionsTodayMeal(mealType),
                            isLoadingDetail = false
                        )
                    } catch (error: Exception) {
                        currentState.copy(
                            selectedConsumption = currentState.consumptions.firstOrNull { it.mealType == mealType },
                            isLoadingDetail = false
                        )
                    }
                }

                Box {
                    MealsScreen(
                        uiState = uiState,
                        destination = destination,
                        onRetry = {
                            reloadKey += 1
                        },
                        onOpenDetail = { consumption ->
                            uiState = (uiState as? FoodConsumptionUiState.Success)?.copy(
                                selectedConsumption = consumption,
                                isLoadingDetail = true
                            ) ?: uiState
                            selectedMealType = consumption.mealType
                            detailLoadRequest += 1
                            destination = MealsDestination.Detail
                        },
                        onCreateMeal = {
                            destination = MealsDestination.Create
                        },
                        onBackToOverview = {
                            destination = MealsDestination.Overview
                            selectedMealType = null
                        },
                        draftMealType = draftMealType,
                        draftNotes = draftNotes,
                        draftFoodSearch = draftFoodSearch,
                        foodResults = foodResults,
                        draftItems = draftItems,
                        searchingFoods = searchingFoods,
                        savingMeal = savingMeal,
                        onDraftMealTypeChange = { draftMealType = it },
                        onDraftNotesChange = { draftNotes = it },
                        onDraftFoodSearchChange = { draftFoodSearch = it },
                        onSearchFoods = {
                            val search = draftFoodSearch.trim()
                            if (search.length < 3 || searchingFoods) {
                                return@MealsScreen
                            }

                            scope.launch {
                                searchingFoods = true
                                try {
                                    foodResults = RetrofitClient.api.searchFoods(search)
                                } catch (error: Exception) {
                                    Toast.makeText(
                                        this@MealsActivity,
                                        "Nao foi possivel buscar alimentos.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                } finally {
                                    searchingFoods = false
                                }
                            }
                        },
                        onAddDraftFood = { food ->
                            draftItems = draftItems + DraftFoodItem(food = food)
                            draftFoodSearch = ""
                            foodResults = emptyList()
                        },
                        onUpdateDraftFood = { index, item ->
                            draftItems = draftItems.mapIndexed { currentIndex, currentItem ->
                                if (currentIndex == index) item else currentItem
                            }
                        },
                        onRemoveDraftFood = { index ->
                            draftItems = draftItems.filterIndexed { currentIndex, _ -> currentIndex != index }
                        },
                        onSaveDraftMeal = {
                            if (draftItems.isEmpty() || savingMeal) {
                                return@MealsScreen
                            }

                            scope.launch {
                                savingMeal = true
                                try {
                                    val savedMeal = RetrofitClient.api.createFoodConsumption(
                                        SaveFoodConsumptionRequest(
                                            mealType = draftMealType,
                                            notes = draftNotes.trim().takeIf { it.isNotEmpty() },
                                            items = draftItems.map { item ->
                                                SaveFoodConsumptionItemRequest(
                                                    foodId = item.food.id,
                                                    quantity = parseDouble(item.quantity, 100.0),
                                                    unit = item.unit,
                                                    weightG = parseDouble(item.weightG, 100.0)
                                                )
                                            }
                                        )
                                    )

                                    uiState = when (val currentState = uiState) {
                                        is FoodConsumptionUiState.Success -> currentState.copy(
                                            consumptions = currentState.consumptions
                                                .filterNot { it.id == savedMeal.id } + savedMeal,
                                            selectedConsumption = savedMeal
                                        )
                                        else -> FoodConsumptionUiState.Success(
                                            consumptions = listOf(savedMeal),
                                            selectedConsumption = savedMeal
                                        )
                                    }

                                    draftMealType = "LUNCH"
                                    draftNotes = ""
                                    draftFoodSearch = ""
                                    foodResults = emptyList()
                                    draftItems = emptyList()
                                    selectedMealType = savedMeal.mealType
                                    destination = MealsDestination.Detail

                                    Toast.makeText(
                                        this@MealsActivity,
                                        "Refeicao salva.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                } catch (error: Exception) {
                                    Toast.makeText(
                                        this@MealsActivity,
                                        "Nao foi possivel salvar a refeicao.",
                                        Toast.LENGTH_SHORT
                                    ).show()
                                } finally {
                                    savingMeal = false
                                }
                            }
                        },
                        onHomeClick = {
                            startActivity(Intent(this@MealsActivity, HomeActivity::class.java))
                            finish()
                        },
                        onMeasurementsClick = {
                            startActivity(Intent(this@MealsActivity, MainActivity::class.java))
                            finish()
                        },
                        onBloodClick = {
                            startActivity(Intent(this@MealsActivity, AddReadingActivity::class.java))
                        },
                        onProfileClick = {
                            startActivity(Intent(this@MealsActivity, ProfileActivity::class.java))
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
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun MealsScreen(
    uiState: FoodConsumptionUiState,
    destination: MealsDestination,
    onRetry: () -> Unit,
    onOpenDetail: (FoodConsumptions) -> Unit,
    onCreateMeal: () -> Unit,
    onBackToOverview: () -> Unit,
    draftMealType: String,
    draftNotes: String,
    draftFoodSearch: String,
    foodResults: List<FoodSearchResult>,
    draftItems: List<DraftFoodItem>,
    searchingFoods: Boolean,
    savingMeal: Boolean,
    onDraftMealTypeChange: (String) -> Unit,
    onDraftNotesChange: (String) -> Unit,
    onDraftFoodSearchChange: (String) -> Unit,
    onSearchFoods: () -> Unit,
    onAddDraftFood: (FoodSearchResult) -> Unit,
    onUpdateDraftFood: (Int, DraftFoodItem) -> Unit,
    onRemoveDraftFood: (Int) -> Unit,
    onSaveDraftMeal: () -> Unit,
    onHomeClick: () -> Unit,
    onMeasurementsClick: () -> Unit,
    onBloodClick: () -> Unit,
    onProfileClick: () -> Unit
) {
    BackHandler(enabled = destination != MealsDestination.Overview) {
        onBackToOverview()
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        containerColor = SangueDoceBackground,
        bottomBar = {
            SangueDoceBottomBar(
                selectedItem = "content",
                onHomeClick = onHomeClick,
                onMeasurementsClick = onMeasurementsClick,
                onContentClick = {
                    // Already on meals.
                },
                onProfileClick = onProfileClick,
                onBloodClick = onBloodClick
            )
        }
    ) { innerPadding ->
        PullToRefreshBox(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .background(SangueDoceBackground),
            isRefreshing = uiState is FoodConsumptionUiState.Success && uiState.isRefreshing,
            onRefresh = onRetry
        ) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(
                    start = 16.dp,
                    top = 18.dp,
                    end = 16.dp,
                    bottom = 24.dp
                ),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                item {
                    MealsHeader(
                        destination = destination,
                        onCreateMeal = onCreateMeal,
                        onBackToOverview = onBackToOverview
                    )
                }

                when (uiState) {
                    FoodConsumptionUiState.Loading -> {
                        item {
                            LoadingCard()
                        }
                    }

                    is FoodConsumptionUiState.Error -> {
                        item {
                            ErrorCard(
                                message = uiState.message,
                                onRetry = onRetry
                            )
                        }
                    }

                    is FoodConsumptionUiState.Success -> {
                        when (destination) {
                            MealsDestination.Overview -> {
                                item {
                                    MealsOverviewCard(
                                        consumptions = uiState.consumptions,
                                        onOpenDetail = onOpenDetail
                                    )
                                }
                            }

                            MealsDestination.Detail -> {
                                val consumption = uiState.selectedConsumption

                                if (consumption == null || uiState.isLoadingDetail) {
                                    item {
                                        LoadingCard()
                                    }
                                }

                                consumption?.let { selectedConsumption ->
                                    item {
                                        MealInfoCard(consumption = selectedConsumption)
                                    }

                                    item {
                                        FoodSearchCard()
                                    }

                                    item {
                                        AddedFoodsCard(items = selectedConsumption.items)
                                    }

                                    item {
                                        MealSummaryCard(consumption = selectedConsumption)
                                    }
                                }
                            }

                            MealsDestination.Create -> {
                                item {
                                    NewMealInfoCard(
                                        mealType = draftMealType,
                                        notes = draftNotes,
                                        onMealTypeChange = onDraftMealTypeChange,
                                        onNotesChange = onDraftNotesChange
                                    )
                                }

                                item {
                                    FoodSearchCard(
                                        query = draftFoodSearch,
                                        results = foodResults,
                                        searching = searchingFoods,
                                        onQueryChange = onDraftFoodSearchChange,
                                        onSearch = onSearchFoods,
                                        onAddFood = onAddDraftFood
                                    )
                                }

                                item {
                                    DraftFoodsCard(
                                        items = draftItems,
                                        onUpdateItem = onUpdateDraftFood,
                                        onRemoveItem = onRemoveDraftFood
                                    )
                                }

                                item {
                                    DraftMealSummaryCard(
                                        items = draftItems,
                                        saving = savingMeal,
                                        onSaveMeal = onSaveDraftMeal,
                                        onCancel = onBackToOverview
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun MealsHeader(
    destination: MealsDestination,
    onCreateMeal: () -> Unit,
    onBackToOverview: () -> Unit
) {
    val title = when (destination) {
        MealsDestination.Overview -> "Refeições"
        MealsDestination.Detail -> "Detalhe da refeição"
        MealsDestination.Create -> "Nova refeição"
    }
    val description = when (destination) {
        MealsDestination.Overview -> "Veja as refeições do dia e acompanhe carboidratos, energia e rotina."
        MealsDestination.Detail -> "Revise os alimentos e totais nutricionais desta refeição."
        MealsDestination.Create -> "Monte uma refeição com alimentos, porções e totais estimados."
    }

    Column(
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        Text(
            text = title,
            color = SangueDoceInk,
            fontSize = 34.sp,
            fontWeight = FontWeight.Black
        )
        Text(
            text = description,
            color = SangueDoceMutedText,
            fontSize = 15.sp,
            lineHeight = 22.sp
        )

        if (destination == MealsDestination.Overview) {
            Button(
                onClick = onCreateMeal,
                colors = ButtonDefaults.buttonColors(containerColor = SangueDocePrimary),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null
                )
                Text(
                    modifier = Modifier.padding(start = 6.dp),
                    text = "Nova refeição",
                    fontWeight = FontWeight.Bold
                )
            }
        } else {
            OutlinedButton(
                onClick = onBackToOverview,
                shape = RoundedCornerShape(10.dp),
                border = BorderStroke(1.dp, SangueDoceBorderColor)
            ) {
                Text(
                    text = "Voltar para refeições",
                    color = SangueDoceInk,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
private fun LoadingCard() {
    AppCard {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            CircularProgressIndicator(
                modifier = Modifier.size(24.dp),
                color = SangueDocePrimary,
                strokeWidth = 3.dp
            )
            Text(
                text = "Carregando refeicao de hoje...",
                color = SangueDoceMutedText,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
private fun ErrorCard(
    message: String,
    onRetry: () -> Unit
) {
    AppCard(borderColor = Red) {
        Text(
            text = "Nao foi possivel carregar a refeicao.",
            color = SangueDoceInk,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black
        )
        Text(
            modifier = Modifier.padding(top = 8.dp),
            text = message,
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            lineHeight = 19.sp
        )
        Button(
            modifier = Modifier.padding(top = 14.dp),
            onClick = onRetry,
            colors = ButtonDefaults.buttonColors(containerColor = SangueDocePrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            Text(
                text = "Tentar novamente",
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun MealsOverviewCard(
    consumptions: List<FoodConsumptions>,
    onOpenDetail: (FoodConsumptions) -> Unit
) {
    AppCard {
        SectionTitle(title = "Refeições de hoje", color = SangueDocePrimary)
        Text(
            modifier = Modifier.padding(top = 8.dp),
            text = "Toque em uma refeição para revisar os alimentos e nutrientes.",
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            lineHeight = 19.sp
        )
        Spacer(modifier = Modifier.height(12.dp))
        if (consumptions.isEmpty()) {
            Text(
                text = "Nenhuma refeição registrada hoje.",
                color = SangueDoceMutedText,
                fontSize = 13.sp
            )
        } else {
            consumptions.forEachIndexed { index, consumption ->
                MealOverviewRow(
                    consumption = consumption,
                    onOpenDetail = { onOpenDetail(consumption) }
                )
                if (index < consumptions.lastIndex) {
                    Spacer(modifier = Modifier.height(10.dp))
                }
            }
        }
    }
}

@Composable
private fun MealOverviewRow(
    consumption: FoodConsumptions,
    onOpenDetail: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onOpenDetail),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF7FBFF)),
        border = BorderStroke(1.dp, SangueDoceBorderColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = mealTypeName(consumption.mealType),
                    color = SangueDoceInk,
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black
                )
                Text(
                    modifier = Modifier.padding(top = 4.dp),
                    text = "${formatMealTime(consumption.consumedAt)} · ${formatGrams(consumption.totalCarbohydratesG)} carbo",
                    color = SangueDoceMutedText,
                    fontSize = 13.sp,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    modifier = Modifier.padding(top = 4.dp),
                    text = "${consumption.items.size} alimentos registrados",
                    color = SangueDoceMutedText,
                    fontSize = 12.sp
                )
            }
            Text(
                text = formatKcal(consumption.totalEnergyKcal),
                color = SangueDocePrimary,
                fontSize = 16.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
private fun MealInfoCard(consumption: FoodConsumptions) {
    var mealName by remember(consumption.id) { mutableStateOf(mealTypeName(consumption.mealType)) }
    var selectedMeal by remember(consumption.id) { mutableStateOf(mealChipName(consumption.mealType)) }

    AppCard {
        SectionTitle(title = "Informações da refeição", color = Green)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = mealName,
            onValueChange = { mealName = it },
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Nome") },
            singleLine = true
        )
        Spacer(modifier = Modifier.height(10.dp))
        ChipRow(
            values = listOf("Café", "Almoço", "Jantar", "Lanche"),
            selected = selectedMeal,
            onSelect = { selectedMeal = it }
        )
        Text(
            modifier = Modifier.padding(top = 10.dp),
            text = "Hoje · ${formatMealTime(consumption.consumedAt)}",
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
        consumption.notes?.takeIf { it.isNotBlank() }?.let { notes ->
            Text(
                modifier = Modifier.padding(top = 8.dp),
                text = notes,
                color = SangueDoceMutedText,
                fontSize = 13.sp,
                lineHeight = 19.sp
            )
        }
    }
}

@Composable
private fun NewMealInfoCard(
    mealType: String,
    notes: String,
    onMealTypeChange: (String) -> Unit,
    onNotesChange: (String) -> Unit
) {
    AppCard {
        SectionTitle(title = "Informações da refeição", color = Green)
        Spacer(modifier = Modifier.height(12.dp))
        ChipRow(
            values = listOf("Café", "Almoço", "Jantar", "Lanche", "Ceia"),
            selected = mealChipName(mealType),
            onSelect = { onMealTypeChange(chipToMealType(it)) }
        )
        Spacer(modifier = Modifier.height(10.dp))
        OutlinedTextField(
            value = notes,
            onValueChange = onNotesChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Observações") },
            placeholder = { Text("Ex.: refeição antes do treino") },
            minLines = 2
        )
        Text(
            modifier = Modifier.padding(top = 10.dp),
            text = "Hoje · agora",
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
private fun FoodSearchCard(
    query: String = "",
    results: List<FoodSearchResult> = emptyList(),
    searching: Boolean = false,
    onQueryChange: (String) -> Unit = {},
    onSearch: () -> Unit = {},
    onAddFood: (FoodSearchResult) -> Unit = {}
) {
    AppCard {
        SectionTitle(title = "Adicionar alimento", color = SangueDocePrimary)
        Spacer(modifier = Modifier.height(12.dp))
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            label = { Text("Buscar alimento") },
            leadingIcon = {
                Icon(
                    imageVector = Icons.Default.Search,
                    contentDescription = null
                )
            },
            singleLine = true
        )
        Button(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            onClick = onSearch,
            enabled = query.trim().length >= 3 && !searching,
            colors = ButtonDefaults.buttonColors(containerColor = SangueDocePrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            Text(
                text = if (searching) "Buscando..." else "Buscar",
                fontWeight = FontWeight.Bold
            )
        }
        if (results.isNotEmpty()) {
            Column(
                modifier = Modifier.padding(top = 10.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                results.take(8).forEach { food ->
                    FoodResultRow(
                        food = food,
                        onAddFood = { onAddFood(food) }
                    )
                }
            }
        }
        Text(
            modifier = Modifier.padding(top = 10.dp),
            text = "Digite um alimento para montar a refeição. A base nutricional segue valores por porção.",
            color = SangueDoceMutedText,
            fontSize = 13.sp,
            lineHeight = 19.sp
        )
    }
}

@Composable
private fun FoodResultRow(
    food: FoodSearchResult,
    onAddFood: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onAddFood),
        shape = RoundedCornerShape(10.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFFF7FBFF)),
        border = BorderStroke(1.dp, SangueDoceBorderColor)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = food.displayName(),
                    color = SangueDoceInk,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = food.category?.name ?: "Sem categoria",
                    color = SangueDoceMutedText,
                    fontSize = 12.sp
                )
            }
            Text(
                text = formatGrams(food.carbohydratesG ?: "0"),
                color = Orange,
                fontSize = 13.sp,
                fontWeight = FontWeight.Black
            )
        }
    }
}

@Composable
private fun AddedFoodsCard(items: List<FoodConsumptionItem>) {
    AppCard {
        SectionTitle(title = "Alimentos adicionados", color = Orange)
        Spacer(modifier = Modifier.height(10.dp))
        if (items.isEmpty()) {
            Text(
                text = "Nenhum alimento registrado nesta refeicao.",
                color = SangueDoceMutedText,
                fontSize = 13.sp
            )
        } else {
            items.forEachIndexed { index, item ->
                FoodRow(
                    name = item.foodNameSnapshot,
                    portion = item.foodDescriptionSnapshot
                        ?.takeIf { it.isNotBlank() }
                        ?: "${formatQuantity(item.quantity)} ${unitLabel(item.unit)}",
                    carbs = formatGrams(item.carbohydratesG)
                )
                if (index < items.lastIndex) {
                    HorizontalDivider(color = SangueDoceBorderColor)
                }
            }
        }
    }
}

@Composable
private fun DraftFoodsCard(
    items: List<DraftFoodItem>,
    onUpdateItem: (Int, DraftFoodItem) -> Unit,
    onRemoveItem: (Int) -> Unit
) {
    AppCard {
        SectionTitle(title = "Alimentos adicionados", color = Orange)
        Spacer(modifier = Modifier.height(10.dp))
        if (items.isEmpty()) {
            Text(
                text = "Busque um alimento e toque no resultado para adicionar.",
                color = SangueDoceMutedText,
                fontSize = 13.sp
            )
        } else {
            items.forEachIndexed { index, item ->
                DraftFoodRow(
                    item = item,
                    onChange = { onUpdateItem(index, it) },
                    onRemove = { onRemoveItem(index) }
                )
                if (index < items.lastIndex) {
                    HorizontalDivider(color = SangueDoceBorderColor)
                }
            }
        }
    }
}

@Composable
private fun DraftFoodRow(
    item: DraftFoodItem,
    onChange: (DraftFoodItem) -> Unit,
    onRemove: () -> Unit
) {
    Column(
        modifier = Modifier.padding(vertical = 9.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.Top
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = item.food.displayName(),
                    color = SangueDoceInk,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
                Text(
                    text = item.food.category?.name ?: "Sem categoria",
                    color = SangueDoceMutedText,
                    fontSize = 13.sp
                )
            }
            Icon(
                imageVector = Icons.Default.Delete,
                contentDescription = "Remover alimento",
                tint = Red,
                modifier = Modifier
                    .size(28.dp)
                    .clickable(onClick = onRemove)
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedTextField(
                value = item.quantity,
                onValueChange = { onChange(item.copy(quantity = it.onlyDecimalInput())) },
                modifier = Modifier.weight(1f),
                label = { Text("Qtd.") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
            OutlinedTextField(
                value = item.weightG,
                onValueChange = { onChange(item.copy(weightG = it.onlyDecimalInput())) },
                modifier = Modifier.weight(1f),
                label = { Text("Peso g") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
            )
        }
        Text(
            text = "${formatGrams(item.carbohydratesTotal().toString())} carboidratos estimados",
            color = Orange,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black
        )
    }
}

@Composable
private fun DraftMealSummaryCard(
    items: List<DraftFoodItem>,
    saving: Boolean,
    onSaveMeal: () -> Unit,
    onCancel: () -> Unit
) {
    val nutrients = items.toDraftNutrients()
    val totalCarbohydrates = items.sumOf { it.carbohydratesTotal().toDouble() }.toString()

    AppCard(borderColor = SangueDocePrimary) {
        Text(
            text = "Resumo da refeição",
            color = SangueDoceInk,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black
        )
        Spacer(modifier = Modifier.height(14.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF7FBFF)),
            border = BorderStroke(1.dp, SangueDoceBorderColor)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Total de carboidratos",
                        color = SangueDoceMutedText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = formatGrams(totalCarbohydrates),
                        color = SangueDoceInk,
                        fontSize = 30.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Estimativa total",
                        color = SangueDoceMutedText,
                        fontSize = 12.sp
                    )
                }
                NutritionDonutChart(
                    nutrients = nutrients,
                    modifier = Modifier.size(112.dp)
                )
            }
        }

        Text(
            modifier = Modifier.padding(top = 18.dp),
            text = "Totais por nutriente",
            color = SangueDoceInk,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
        ) {
            nutrients.forEachIndexed { index, nutrient ->
                NutrientRow(nutrient = nutrient)
                if (index < nutrients.lastIndex) {
                    HorizontalDivider(color = SangueDoceBorderColor)
                }
            }
        }

        Button(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            onClick = onSaveMeal,
            enabled = items.isNotEmpty() && !saving,
            colors = ButtonDefaults.buttonColors(containerColor = SangueDocePrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            Text(
                text = if (saving) "Salvando..." else "Salvar refeição",
                fontWeight = FontWeight.Bold
            )
        }
        OutlinedButton(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            onClick = onCancel,
            enabled = !saving,
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, SangueDoceBorderColor)
        ) {
            Text(
                text = "Cancelar",
                color = SangueDoceInk,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun MealSummaryCard(consumption: FoodConsumptions) {
    val nutrients = consumption.toNutrients()

    AppCard(borderColor = SangueDocePrimary) {
        Text(
            text = "Resumo da refeição",
            color = SangueDoceInk,
            fontSize = 16.sp,
            fontWeight = FontWeight.Black
        )
        Spacer(modifier = Modifier.height(14.dp))
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFFF7FBFF)),
            border = BorderStroke(1.dp, SangueDoceBorderColor)
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(18.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Total de carboidratos",
                        color = SangueDoceMutedText,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = formatGrams(consumption.totalCarbohydratesG),
                        color = SangueDoceInk,
                        fontSize = 30.sp,
                        fontWeight = FontWeight.Black
                    )
                    Text(
                        text = "Estimativa total",
                        color = SangueDoceMutedText,
                        fontSize = 12.sp
                    )
                }
                NutritionDonutChart(
                    nutrients = nutrients,
                    modifier = Modifier.size(112.dp)
                )
            }
        }

        Text(
            modifier = Modifier.padding(top = 18.dp),
            text = "Totais por nutriente",
            color = SangueDoceInk,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp)
                .background(Color.White, RoundedCornerShape(8.dp))
        ) {
            nutrients.forEachIndexed { index, nutrient ->
                NutrientRow(nutrient = nutrient)
                if (index < nutrients.lastIndex) {
                    HorizontalDivider(color = SangueDoceBorderColor)
                }
            }
        }

        Text(
            modifier = Modifier.padding(top = 20.dp),
            text = "Distribuição de carboidratos",
            color = SangueDoceInk,
            fontSize = 14.sp,
            fontWeight = FontWeight.Black
        )
        HorizontalDivider(
            modifier = Modifier.padding(top = 16.dp),
            color = SangueDoceBorderColor
        )

        Button(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            onClick = {},
            colors = ButtonDefaults.buttonColors(containerColor = SangueDocePrimary),
            shape = RoundedCornerShape(10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .background(Color.White.copy(alpha = 0.85f), CircleShape)
            )
            Text(
                modifier = Modifier.padding(start = 10.dp),
                text = "Salvar refeição",
                fontWeight = FontWeight.Bold
            )
        }
        OutlinedButton(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp),
            onClick = {},
            shape = RoundedCornerShape(10.dp),
            border = BorderStroke(1.dp, SangueDoceBorderColor)
        ) {
            Text(
                text = "Cancelar",
                color = SangueDoceInk,
                fontWeight = FontWeight.Bold
            )
        }
    }
}

@Composable
private fun NutritionDonutChart(
    nutrients: List<NutrientSummary>,
    modifier: Modifier = Modifier
) {
    Canvas(modifier = modifier) {
        val strokeWidth = 18.dp.toPx()
        val arcSize = size.minDimension - strokeWidth
        val topLeft = androidx.compose.ui.geometry.Offset(
            x = (size.width - arcSize) / 2f,
            y = (size.height - arcSize) / 2f
        )
        val totalAmount = nutrients.sumOf { it.amount.toDouble() }.toFloat()
        var startAngle = -90f

        nutrients.forEach { nutrient ->
            val segmentSweep = if (totalAmount > 0f) {
                360f * (nutrient.amount / totalAmount)
            } else {
                360f / nutrients.size
            }

            drawArc(
                color = nutrient.color,
                startAngle = startAngle,
                sweepAngle = segmentSweep,
                useCenter = false,
                topLeft = topLeft,
                size = Size(arcSize, arcSize),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Butt)
            )
            startAngle += segmentSweep
        }
    }
}

@Composable
private fun NutrientRow(nutrient: NutrientSummary) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 9.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            modifier = Modifier.weight(1f),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .background(nutrient.color, CircleShape)
            )
            Text(
                text = nutrient.label,
                color = SangueDoceInk,
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
        }
        Text(
            text = nutrient.value,
            color = nutrient.color,
            fontSize = 13.sp,
            fontWeight = FontWeight.Black
        )
    }
}

@Composable
private fun AppCard(
    borderColor: Color = SangueDoceBorderColor,
    content: @Composable ColumnScope.() -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SangueDoceCard),
        border = BorderStroke(1.dp, borderColor),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            content = content
        )
    }
}

@Composable
private fun SectionTitle(
    title: String,
    color: Color
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(8.dp)
                .background(color = color, shape = CircleShape)
        )
        Text(
            text = title.uppercase(),
            color = SangueDoceMutedText,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 1.5.sp
        )
    }
}

@Composable
private fun ChipRow(
    values: List<String>,
    selected: String,
    onSelect: (String) -> Unit
) {
    FlowRow(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        values.forEach { value ->
            AssistChip(
                onClick = { onSelect(value) },
                label = {
                    Text(
                        text = value,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = AssistChipDefaults.assistChipColors(
                    containerColor = if (value == selected) Color(0xFFEAF3FC) else Color.White,
                    labelColor = if (value == selected) SangueDocePrimary else SangueDoceMutedText
                ),
                border = BorderStroke(
                    width = 1.dp,
                    color = if (value == selected) SangueDocePrimary else SangueDoceBorderColor
                )
            )
        }
    }
}

@Composable
private fun MealRow(
    name: String,
    detail: String,
    value: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                color = SangueDoceInk,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = detail,
                color = SangueDoceMutedText,
                fontSize = 13.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
        }
        Text(
            text = value,
            color = SangueDocePrimary,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun FoodRow(
    name: String,
    portion: String,
    carbs: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 9.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = name,
                color = SangueDoceInk,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = portion,
                color = SangueDoceMutedText,
                fontSize = 13.sp,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
        }
        Text(
            text = carbs,
            color = Orange,
            fontSize = 18.sp,
            fontWeight = FontWeight.Black
        )
    }
}

private fun FoodConsumptions.toNutrients(): List<NutrientSummary> {
    return listOf(
        NutrientSummary("Carboidratos", formatGrams(totalCarbohydratesG), Purple, parseAmount(totalCarbohydratesG)),
        NutrientSummary("Proteínas", formatGrams(totalProteinG), Red, parseAmount(totalProteinG)),
        NutrientSummary("Gorduras", formatGrams(totalFatG), DarkBlue, parseAmount(totalFatG)),
        NutrientSummary("Fibras", formatGrams(totalFiberG), SoftGreen, parseAmount(totalFiberG)),
        NutrientSummary("Energia", formatKcal(totalEnergyKcal), Color(0xFFF5C400), parseAmount(totalEnergyKcal) / 10f)
    )
}

private fun List<DraftFoodItem>.toDraftNutrients(): List<NutrientSummary> {
    val carbohydrates = sumOf { it.carbohydratesTotal().toDouble() }.toString()
    val proteins = sumOf { it.proteinTotal().toDouble() }.toString()
    val fats = sumOf { it.fatTotal().toDouble() }.toString()
    val fibers = sumOf { it.fiberTotal().toDouble() }.toString()
    val energy = sumOf { it.energyTotal().toDouble() }.toString()

    return listOf(
        NutrientSummary("Carboidratos", formatGrams(carbohydrates), Purple, parseAmount(carbohydrates)),
        NutrientSummary("Proteínas", formatGrams(proteins), Red, parseAmount(proteins)),
        NutrientSummary("Gorduras", formatGrams(fats), DarkBlue, parseAmount(fats)),
        NutrientSummary("Fibras", formatGrams(fibers), SoftGreen, parseAmount(fibers)),
        NutrientSummary("Energia", formatKcal(energy), Color(0xFFF5C400), parseAmount(energy) / 10f)
    )
}

private fun emptyNutrients(): List<NutrientSummary> {
    return listOf(
        NutrientSummary("Carboidratos", "0,00 g", Purple, 1f),
        NutrientSummary("Proteínas", "0,00 g", Red, 1f),
        NutrientSummary("Gorduras", "0,00 g", DarkBlue, 1f),
        NutrientSummary("Fibras", "0,00 g", SoftGreen, 1f),
        NutrientSummary("Energia", "0 kcal", Color(0xFFF5C400), 1f)
    )
}

private fun mealTypeName(mealType: String): String {
    return when (mealType) {
        "BREAKFAST" -> "Café da manhã"
        "MORNING_SNACK" -> "Lanche da manhã"
        "LUNCH" -> "Almoço"
        "AFTERNOON_SNACK" -> "Lanche da tarde"
        "DINNER" -> "Jantar"
        "SUPPER" -> "Ceia"
        "SNACK" -> "Lanche"
        "OTHER" -> "Outra refeição"
        else -> mealType.lowercase().replaceFirstChar { it.titlecase() }
    }
}

private fun mealChipName(mealType: String): String {
    return when (mealType) {
        "BREAKFAST" -> "Café"
        "MORNING_SNACK" -> "Lanche"
        "LUNCH" -> "Almoço"
        "DINNER" -> "Jantar"
        "AFTERNOON_SNACK" -> "Lanche"
        "SUPPER" -> "Ceia"
        "SNACK" -> "Lanche"
        else -> "Café"
    }
}

private fun chipToMealType(chip: String): String {
    return when (chip) {
        "Café" -> "BREAKFAST"
        "Almoço" -> "LUNCH"
        "Jantar" -> "DINNER"
        "Lanche" -> "AFTERNOON_SNACK"
        "Ceia" -> "SUPPER"
        else -> "OTHER"
    }
}

private fun formatMealTime(value: String): String {
    return try {
        val parser = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.US).apply {
            timeZone = TimeZone.getTimeZone("UTC")
        }
        val date = parser.parse(value) ?: return "--:--"

        SimpleDateFormat("HH:mm", Locale.forLanguageTag("pt-BR")).format(date)
    } catch (error: Exception) {
        "--:--"
    }
}

private fun formatGrams(value: String): String {
    return "${formatDecimal(value, 2)} g"
}

private fun formatKcal(value: String): String {
    return "${formatDecimal(value, 0)} kcal"
}

private fun formatQuantity(value: String): String {
    return formatDecimal(value, 0)
}

private fun parseAmount(value: String): Float {
    return value.replace(",", ".").toFloatOrNull() ?: 0f
}

private fun parseDouble(
    value: String,
    fallback: Double = 0.0
): Double {
    return value.replace(",", ".").toDoubleOrNull() ?: fallback
}

private fun formatDecimal(
    value: String,
    fractionDigits: Int
): String {
    val number = value.replace(",", ".").toDoubleOrNull() ?: 0.0
    val symbols = DecimalFormatSymbols(Locale.forLanguageTag("pt-BR"))

    return DecimalFormat().apply {
        decimalFormatSymbols = symbols
        minimumFractionDigits = fractionDigits
        maximumFractionDigits = fractionDigits
    }.format(number)
}

private fun unitLabel(unit: String): String {
    return when (unit) {
        "GRAM" -> "g"
        "UNIT" -> "unidade"
        "ML" -> "ml"
        else -> unit.lowercase()
    }
}

private fun FoodSearchResult.displayName(): String {
    return listOfNotNull(name, description?.takeIf { it.isNotBlank() })
        .joinToString(" ")
}

private fun DraftFoodItem.carbohydratesTotal(): Float {
    return nutrientTotal(food.carbohydratesG)
}

private fun DraftFoodItem.proteinTotal(): Float {
    return nutrientTotal(food.proteinG)
}

private fun DraftFoodItem.fatTotal(): Float {
    return nutrientTotal(food.fatG)
}

private fun DraftFoodItem.fiberTotal(): Float {
    return nutrientTotal(food.fiberG)
}

private fun DraftFoodItem.energyTotal(): Float {
    return nutrientTotal(food.energyKcal)
}

private fun DraftFoodItem.nutrientTotal(value: String?): Float {
    val amountPer100g = parseAmount(value ?: "0")
    val factor = parseAmount(weightG).coerceAtLeast(0f) / 100f

    return amountPer100g * factor
}

private fun String.onlyDecimalInput(): String {
    var hasSeparator = false

    return filter { char ->
        when {
            char.isDigit() -> true
            (char == ',' || char == '.') && !hasSeparator -> {
                hasSeparator = true
                true
            }
            else -> false
        }
    }
}
