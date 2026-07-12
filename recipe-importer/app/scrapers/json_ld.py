import json
from typing import Any

from bs4 import BeautifulSoup

from app.schemas.recipe import ExtractedRecipe
from app.scrapers.base import RecipeScraper


def _walk_json(value: Any):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from _walk_json(child)
    elif isinstance(value, list):
        for child in value:
            yield from _walk_json(child)


def _is_recipe(value: dict[str, Any]) -> bool:
    kind = value.get("@type")
    return kind == "Recipe" or isinstance(kind, list) and "Recipe" in kind


def _instruction_items(value: Any) -> list[dict[str, Any]]:
    result: list[dict[str, Any]] = []
    if isinstance(value, str) and value.strip():
        return [{"description": value.strip()}]
    if not isinstance(value, list):
        return result
    for item in value:
        if isinstance(item, str) and item.strip():
            result.append({"description": item.strip()})
        elif isinstance(item, dict):
            kind = item.get("@type")
            if kind == "HowToSection":
                section = str(item.get("name") or "").strip() or None
                for step in _instruction_items(item.get("itemListElement", [])):
                    result.append({"title": section, **step})
            else:
                text = item.get("text") or item.get("name")
                if isinstance(text, str) and text.strip():
                    result.append({"description": BeautifulSoup(text, "html.parser").get_text(" ", strip=True)})
    return result


def _image_url(value: Any) -> str | None:
    if isinstance(value, str):
        return value.strip() or None
    if isinstance(value, list):
        return next((_image_url(item) for item in value if _image_url(item)), None)
    if isinstance(value, dict):
        candidate = value.get("url") or value.get("contentUrl")
        return candidate.strip() if isinstance(candidate, str) else None
    return None


class JsonLdRecipeScraper(RecipeScraper):
    name = "json-ld"

    def extract(self, soup: BeautifulSoup, source_url: str) -> ExtractedRecipe | None:
        candidates: list[dict[str, Any]] = []
        for script in soup.find_all("script", {"type": "application/ld+json"}):
            try:
                parsed = json.loads(script.string or script.get_text())
                candidates.extend(item for item in _walk_json(parsed) if _is_recipe(item))
            except (json.JSONDecodeError, TypeError, AttributeError):
                continue
        if not candidates:
            return None
        recipe = max(candidates, key=lambda item: len(item.get("recipeIngredient", [])))
        ingredients = recipe.get("recipeIngredient", [])
        if not isinstance(ingredients, list):
            ingredients = []
        canonical = soup.find("link", rel="canonical")
        canonical_url = canonical.get("href") if canonical else None
        return ExtractedRecipe(
            source_url=source_url,
            canonical_url=canonical_url,
            name=str(recipe.get("name") or "").strip(),
            description=BeautifulSoup(str(recipe.get("description") or ""), "html.parser").get_text(" ", strip=True),
            image=_image_url(recipe.get("image")),
            ingredients=[str(item).strip() for item in ingredients if str(item).strip()],
            instructions=_instruction_items(recipe.get("recipeInstructions", [])),
            prep_time=recipe.get("prepTime"),
            cook_time=recipe.get("cookTime"),
            total_time=recipe.get("totalTime"),
            yield_value=recipe.get("recipeYield"),
            nutrition=recipe.get("nutrition") if isinstance(recipe.get("nutrition"), dict) else None,
        )
