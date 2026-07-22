import { describe, expect, it } from "vitest";
import { createRecipeSchema } from "./create-recipe.dto";

const validRecipe = {
  slug: "omelete-de-espinafre",
  title: "Omelete de espinafre",
  excerpt: "Uma receita pratica, rica em proteina e feita em poucos minutos.",
  content: [],
  status: "DRAFT" as const,
  featured: false,
  readingMinutes: 4,
  coverImageUrl: "/no-image.png",
  authorId: "376b7388-cd46-4e47-b3d7-12e239249599",
  categoryId: "b031446e-9925-47b0-891b-e94057c10efe",
  tagIds: [],
  prepMinutes: 10,
  cookMinutes: 8,
  servings: 2,
  difficulty: "EASY" as const,
  ingredients: [{ quantity: 2, unit: "unidades", name: "ovos" }],
  instructions: [{ description: "Bata os ovos e cozinhe em fogo baixo." }],
};

describe("createRecipeSchema", () => {
  it("accepts a complete recipe", () => {
    expect(createRecipeSchema.safeParse(validRecipe).success).toBe(true);
  });

  it("requires a positive total preparation time", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      prepMinutes: 0,
      cookMinutes: 0,
    });

    expect(result.success).toBe(false);
  });

  it("rejects recipes without ingredients", () => {
    const result = createRecipeSchema.safeParse({ ...validRecipe, ingredients: [] });

    expect(result.success).toBe(false);
  });

  it("accepts nullable notes and instruction titles from the importer", () => {
    const result = createRecipeSchema.safeParse({
      ...validRecipe,
      ingredients: [
        { quantity: 1, unit: null, name: "ovo", note: null },
        { quantity: null, unit: null, name: "Sal a gosto", note: null },
      ],
      instructions: [{ title: null, description: "Misture todos os ingredientes." }],
    });

    expect(result.success).toBe(true);
  });
});
