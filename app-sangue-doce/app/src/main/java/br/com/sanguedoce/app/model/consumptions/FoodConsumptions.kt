package br.com.sanguedoce.app.model.consumptions

data class FoodConsumptions(
    val id: Int,
    val userId: String,
    val mealType: String,
    val consumedAt: String,
    val description: String?,
    val notes: String?,

    val totalCarbohydratesG: String,
    val totalProteinG: String,
    val totalFatG: String,
    val totalFiberG: String,
    val totalEnergyKcal: String,

    val createdAt: String,
    val updatedAt: String,

    val items: List<FoodConsumptionItem>
)


data class FoodConsumptionItem(
    val id: Int,
    val consumptionId: Int,
    val foodId: Int,

    val quantity: String,
    val unit: String,
    val weightG: String,

    val carbohydratesG: String,
    val proteinG: String,
    val fatG: String,
    val fiberG: String,
    val energyKcal: String,

    val foodNameSnapshot: String,
    val foodDescriptionSnapshot: String?,

    val createdAt: String,
    val updatedAt: String,

    val food: Food
)

data class Food(
    val id: Int,
    val name: String,
    val description: String?,
    val categoryId: Int,

    val moisturePercent: String?,
    val energyKcal: String?,
    val energyKj: String?,

    val proteinG: String?,
    val fatG: String?,
    val cholesterolMg: String?,
    val carbohydratesG: String?,
    val fiberG: String?,
    val ashG: String?,

    val calciumMg: String?,
    val magnesiumMg: String?,
    val manganeseMg: String?,
    val phosphorusMg: String?,
    val ironMg: String?,
    val sodiumMg: String?,
    val potassiumMg: String?,
    val copperMg: String?,
    val zincMg: String?,

    val retinolMcg: String?,
    val thiamineMg: String?,
    val riboflavinMg: String?,
    val pyridoxineMg: String?,
    val niacinMg: String?,

    val createdAt: String,
    val updatedAt: String,

    val images: List<FoodImage>
)

data class FoodImage(
    val id: String,
    val normalizedName: String,
    val imageUrl: String,
    val s3Key: String,
    val sourceUrl: String?,
    val sourceName: String?,
    val license: String?,
    val createdAt: String,
    val updatedAt: String
)

data class FoodCategory(
    val id: Int?,
    val name: String?
)

data class FoodSearchResult(
    val id: Int,
    val name: String,
    val description: String?,
    val categoryId: Int?,
    val category: FoodCategory?,
    val carbohydratesG: String?,
    val proteinG: String?,
    val fatG: String?,
    val fiberG: String?,
    val energyKcal: String?,
    val images: List<FoodImage>?
)

data class SaveFoodConsumptionRequest(
    val mealType: String,
    val notes: String?,
    val items: List<SaveFoodConsumptionItemRequest>
)

data class SaveFoodConsumptionItemRequest(
    val foodId: Int,
    val quantity: Double,
    val unit: String,
    val weightG: Double
)
