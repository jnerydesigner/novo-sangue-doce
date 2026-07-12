import type { Recipe, RecipeIngredient } from "./api";

export const difficultyLabels = { EASY: "Fácil", MEDIUM: "Média", HARD: "Avançada" } as const;

export function formatIngredient(ingredient: RecipeIngredient) {
  return [
    ingredient.quantity,
    ingredient.unit,
    ingredient.name,
    ingredient.note ? `(${ingredient.note})` : null,
  ]
    .filter((part) => part !== null && part !== "")
    .join(" ");
}

export function totalRecipeMinutes(recipe: Recipe) {
  return recipe.prepMinutes + recipe.cookMinutes;
}

export function isoDuration(minutes: number) {
  return `PT${Math.max(0, minutes)}M`;
}
