import type { MealType } from "./meal.type";

export type FoodQuantityUnit =
  | "GRAM"
  | "MILLILITER"
  | "UNIT"
  | "SLICE"
  | "TABLESPOON"
  | "TEASPOON"
  | "CUP"
  | "SCOOP"
  | "PORTION";

export type FoodConsumptionImage = {
  id: string;
  imageUrl: string;
  normalizedName: string;
  s3Key: string;
  sourceUrl?: string | null;
  sourceName?: string | null;
  license?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FoodConsumptionFood = {
  id: number;
  name: string;
  description: string;
  categoryId: number;
  carbohydratesG?: number | string | null;
  proteinG?: number | string | null;
  fatG?: number | string | null;
  fiberG?: number | string | null;
  energyKcal?: number | string | null;
  images: FoodConsumptionImage[];
};

export type FoodConsumptionItem = {
  id: number;
  consumptionId: number;
  foodId: number;
  quantity: number | string;
  unit: FoodQuantityUnit;
  weightG: number | string;
  carbohydratesG: number | string;
  proteinG: number | string;
  fatG: number | string;
  fiberG: number | string;
  energyKcal: number | string;
  foodNameSnapshot: string;
  foodDescriptionSnapshot?: string | null;
  createdAt: string;
  updatedAt: string;
  food: FoodConsumptionFood;
};

export type FoodConsumption = {
  id: number;
  userId: string;
  mealType: MealType;
  consumedAt: string;
  description?: string | null;
  notes?: string | null;
  totalCarbohydratesG: number | string;
  totalProteinG: number | string;
  totalFatG: number | string;
  totalFiberG: number | string;
  totalEnergyKcal: number | string;
  createdAt: string;
  updatedAt: string;
  items: FoodConsumptionItem[];
};
