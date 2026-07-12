import re
from fractions import Fraction
from typing import Any

import isodate

from app.schemas.recipe import (
    ExtractedRecipe,
    NormalizedRecipe,
    RecipeIngredient,
    RecipeInstruction,
    RecipeNutrition,
)

UNITS = r"(?:xícara(?:s)?(?:\s+de\s+chá)?|xicara(?:s)?(?:\s+de\s+cha)?|colher(?:es)?(?:\s+de\s+(?:sopa|chá|cha))?|unidade(?:s)?|dente(?:s)?|pitada(?:s)?|fatia(?:s)?|copo(?:s)?|kg|mg|ml|g|l)"
INGREDIENT_RE = re.compile(rf"^\s*(?P<quantity>\d+\s*/\s*\d+|\d+(?:[.,]\d+)?)?\s*(?:de\s+)?(?P<unit>{UNITS})?\s*(?:de\s+)?(?P<name>.+?)\s*$", re.IGNORECASE)
NUMBER_RE = re.compile(r"-?\d+(?:[.,]\d+)?")


def _number(value: str | None) -> float | None:
    if not value:
        return None
    value = value.replace(",", ".").replace(" ", "")
    try:
        return float(Fraction(value)) if "/" in value else float(value)
    except (ValueError, ZeroDivisionError):
        return None


def _duration_minutes(value: str | None) -> int:
    if not value:
        return 0
    try:
        duration = isodate.parse_duration(value)
        return max(0, round(duration.total_seconds() / 60))
    except (ValueError, TypeError, AttributeError):
        return 0


def _ingredient(value: str) -> RecipeIngredient:
    match = INGREDIENT_RE.match(value)
    if not match:
        return RecipeIngredient(name=value.strip(), original_text=value.strip())
    return RecipeIngredient(
        quantity=_number(match.group("quantity")),
        unit=(match.group("unit") or "").strip() or None,
        name=match.group("name").strip(),
        original_text=value.strip(),
    )


def _nutrition_number(nutrition: dict[str, Any] | None, key: str) -> float | None:
    if not nutrition:
        return None
    match = NUMBER_RE.search(str(nutrition.get(key) or ""))
    return _number(match.group()) if match else None


def _servings(value: Any) -> int:
    if isinstance(value, list):
        value = value[0] if value else None
    match = NUMBER_RE.search(str(value or ""))
    return max(1, round(_number(match.group()) or 1)) if match else 1


def normalize_recipe(extracted: ExtractedRecipe) -> tuple[NormalizedRecipe, list[str], str]:
    if not extracted.name:
        raise ValueError("A receita encontrada não possui título.")
    if not extracted.ingredients:
        raise ValueError("A receita encontrada não possui ingredientes estruturados.")
    if not extracted.instructions:
        raise ValueError("A receita encontrada não possui modo de preparo estruturado.")

    prep = _duration_minutes(extracted.prep_time)
    cook = _duration_minutes(extracted.cook_time)
    total = _duration_minutes(extracted.total_time)
    warnings: list[str] = []
    if prep + cook == 0 and total:
        prep = total
    if prep + cook == 0:
        warnings.append("O site não informou um tempo de preparo válido; revise antes de salvar.")
        prep = 1
    if not extracted.description:
        warnings.append("O site não forneceu uma descrição; escreva um resumo editorial.")

    nutrition = extracted.nutrition
    normalized_nutrition = RecipeNutrition(
        calories_kcal=_nutrition_number(nutrition, "calories"),
        carbohydrates_grams=_nutrition_number(nutrition, "carbohydrateContent"),
        fiber_grams=_nutrition_number(nutrition, "fiberContent"),
        protein_grams=_nutrition_number(nutrition, "proteinContent"),
        fat_grams=_nutrition_number(nutrition, "fatContent"),
        sodium_mg=_nutrition_number(nutrition, "sodiumContent"),
    ) if nutrition else None

    recipe = NormalizedRecipe(
        source_url=extracted.source_url,
        source_canonical_url=extracted.canonical_url,
        title=extracted.name,
        excerpt=extracted.description or f"Receita de {extracted.name} importada para revisão editorial.",
        cover_image_source_url=extracted.image,
        prep_minutes=prep,
        cook_minutes=cook,
        servings=_servings(extracted.yield_value),
        serving_size=str(extracted.yield_value).strip() if extracted.yield_value else None,
        ingredients=[_ingredient(item) for item in extracted.ingredients],
        instructions=[RecipeInstruction(**item) for item in extracted.instructions],
        nutrition=normalized_nutrition,
    )
    confidence = "HIGH" if not warnings and extracted.image else "MEDIUM" if len(warnings) <= 1 else "LOW"
    return recipe, warnings, confidence
