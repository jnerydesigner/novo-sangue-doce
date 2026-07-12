from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field, HttpUrl


def to_camel(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


class ApiModel(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)


class ImportRecipeRequest(ApiModel):
    url: HttpUrl


class RecipeIngredient(ApiModel):
    quantity: float | None = None
    unit: str | None = None
    name: str
    note: str | None = None
    original_text: str


class RecipeInstruction(ApiModel):
    title: str | None = None
    description: str


class RecipeNutrition(ApiModel):
    calories_kcal: float | None = None
    carbohydrates_grams: float | None = None
    fiber_grams: float | None = None
    protein_grams: float | None = None
    fat_grams: float | None = None
    sodium_mg: float | None = None


class NormalizedRecipe(ApiModel):
    source_url: HttpUrl
    source_canonical_url: HttpUrl | None = None
    title: str
    excerpt: str
    cover_image_source_url: HttpUrl | None = None
    prep_minutes: int = 0
    cook_minutes: int = 0
    servings: int = 1
    serving_size: str | None = None
    ingredients: list[RecipeIngredient] = Field(min_length=1)
    instructions: list[RecipeInstruction] = Field(min_length=1)
    nutrition: RecipeNutrition | None = None


class ImportRecipeResponse(ApiModel):
    recipe: NormalizedRecipe
    confidence: Literal["HIGH", "MEDIUM", "LOW"]
    warnings: list[str] = []
    fingerprint: str
    extractor: str


class ExtractedRecipe(BaseModel):
    source_url: str
    canonical_url: str | None = None
    name: str
    description: str = ""
    image: str | None = None
    ingredients: list[str]
    instructions: list[dict[str, Any]]
    prep_time: str | None = None
    cook_time: str | None = None
    total_time: str | None = None
    yield_value: Any = None
    nutrition: dict[str, Any] | None = None
