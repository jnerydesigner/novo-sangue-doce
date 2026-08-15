import { z } from "zod";
import { MealTypeEnum } from "../enums/meal-type.enum";
import { UnitEnum } from "../enums/unit.enum";

export const createConsumptionSchema = z.object({
  mealType: z.enum(MealTypeEnum),
  consumedAt: z.iso.datetime().optional(),
  notes: z.string().max(500).optional(),
  items: z
    .array(
      z.object({
        foodId: z.number().int().positive(),
        quantity: z.number().positive(),
        unit: z.enum(UnitEnum).default(UnitEnum.GRAM),
        weightG: z.number().positive().optional(),
      }),
    )
    .min(1),
});
