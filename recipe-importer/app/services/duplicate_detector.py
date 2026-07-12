import hashlib
import json

from app.schemas.recipe import NormalizedRecipe


def recipe_fingerprint(recipe: NormalizedRecipe) -> str:
    payload = {
        "title": recipe.title.casefold(),
        "ingredients": [item.original_text.casefold() for item in recipe.ingredients],
        "instructions": [item.description.casefold() for item in recipe.instructions],
    }
    serialized = json.dumps(payload, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(serialized.encode("utf-8")).hexdigest()
