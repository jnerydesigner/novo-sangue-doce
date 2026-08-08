export type Food = {
  id: number;
  name: string;
  category: string;
  carbohydratesG: number;
  proteinG: number;
  fatG: number;
  fiberG: number;
  energyKcal: number;
  color: string;
  image?: string;
};

export type MealFoodItem = Food & {
  quantity: number;
  unit:
    | "CUP"
    | "GRAM"
    | "MILLILITER"
    | "PORTION"
    | "SCOOP"
    | "SLICE"
    | "TABLESPOON"
    | "TEASPOON"
    | "UNIT";
  weightG: number;
};
