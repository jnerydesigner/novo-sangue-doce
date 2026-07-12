import { z } from "zod";

const optionalString = z.preprocess((value) => value === null ? undefined : value, z.string().trim().optional());
const optionalNutrition = z.number().min(0).nullable().optional();

export const recipeIngredientSchema = z.object({
  quantity: z.number().min(0).nullable(),
  unit: z.string().trim().nullable(),
  name: z.string().trim().min(1, "Ingredient name is required."),
  note: optionalString,
});

export const recipeInstructionSchema = z.object({
  title: optionalString,
  description: z.string().trim().min(1, "Instruction description is required."),
});

export const createRecipeSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  title: z.string().trim().min(3),
  excerpt: z.string().trim().min(10),
  content: z.array(z.unknown()).default([]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  readingMinutes: z.number().int().min(1).default(5),
  coverImageUrl: z.string().trim().min(1),
  coverImageAlt: optionalString,
  metaTitle: optionalString,
  metaDescription: optionalString,
  publishedAt: z.preprocess((value) => value === null ? undefined : value, z.iso.datetime().optional()),
  authorId: z.uuid(),
  categoryId: z.uuid(),
  tagIds: z.array(z.uuid()).default([]),
  prepMinutes: z.number().int().min(0),
  cookMinutes: z.number().int().min(0).default(0),
  servings: z.number().int().min(1),
  servingSize: optionalString,
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("EASY"),
  ingredients: z.array(recipeIngredientSchema).min(1),
  instructions: z.array(recipeInstructionSchema).min(1),
  caloriesKcal: optionalNutrition,
  carbohydratesGrams: optionalNutrition,
  fiberGrams: optionalNutrition,
  proteinGrams: optionalNutrition,
  fatGrams: optionalNutrition,
  sodiumMg: optionalNutrition,
}).superRefine((value, context) => {
  if (value.prepMinutes + value.cookMinutes === 0) {
    context.addIssue({ code: "custom", path: ["prepMinutes"], message: "Total recipe time must be greater than zero." });
  }
});

export type CreateRecipeDto = z.infer<typeof createRecipeSchema>;
