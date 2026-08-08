import { Trash2 } from "lucide-react";
import Image from "next/image";
import { Button, IconButton } from "@/components/buttons/button";
import { SelectField } from "@/components/forms/select-field";
import type { MealFoodItem } from "@/types/food.type";
import { useMealScreen } from "./meal-screen.store";

const unitOptions: Array<{ label: string; value: MealFoodItem["unit"] }> = [
  { label: "g", value: "GRAM" },
  { label: "ml", value: "MILLILITER" },
  { label: "un", value: "UNIT" },
  { label: "fatia", value: "SLICE" },
  { label: "porção", value: "PORTION" },
  { label: "scoop", value: "SCOOP" },
  { label: "xícara", value: "CUP" },
  { label: "colher sopa", value: "TABLESPOON" },
  { label: "colher chá", value: "TEASPOON" },
];

export function AddedFoodsCard() {
  const {
    clearFoodItems,
    items,
    removeFoodItem,
    updateFoodItem,
  } = useMealScreen();

  return (
    <section className="rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">Alimentos adicionados</h2>

      <div className="hidden grid-cols-[1fr_78px_106px_64px_110px_24px] gap-4 border-b border-[#d5e2ef] px-1 pb-2 text-xs text-[#55718f] md:grid">
        <span>Alimento</span>
        <span>Quantidade</span>
        <span>Medida</span>
        <span>Peso (g)</span>
        <span>Carboidratos (g)</span>
      </div>

      <div>
        {items.map((food, index) => (
          <div
            className="grid items-center gap-3 border-b border-[#e1eaf3] py-2.5 md:grid-cols-[1fr_78px_106px_64px_110px_24px] md:gap-4"
            key={`${food.id}-${index}`}
          >
            <div className="flex items-center gap-3">
              <div className="h-14 w-16 overflow-hidden rounded-lg bg-[#edf2f4]">
                {food.image ? (
                  <Image
                    alt={food.name}
                    className="h-full w-full object-cover"
                    height={200}
                    src={food.image}
                    width={200}
                  />
                ) : (
                  <div
                aria-label={`Imagem não disponível para ${food.name}`}
                className="flex h-full w-full items-center justify-center text-2xl"
              >
                    🍽️
                  </div>
                )}
              </div>
              <div>
                <b className="text-sm">{food.name}</b>
                <p className="text-xs text-[#55718f]">{food.category}</p>
              </div>
            </div>

            <input
              className="w-full rounded-lg border border-[#c9dbea] bg-white px-3 py-2"
              min="0.01"
              onChange={(event) =>
                updateFoodItem(index, {
                  ...food,
                  quantity: Number(event.target.value) || 0,
                })
              }
              step="0.01"
              type="number"
              value={food.quantity}
            />
            <SelectField
              className="h-11 text-sm"
              onChange={(event) =>
                updateFoodItem(index, {
                  ...food,
                  unit: event.target.value as MealFoodItem["unit"],
                })
              }
              value={food.unit}
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
            <input
              className="rounded-lg border border-[#c9dbea] bg-white px-3 py-2"
              min="0.01"
              onChange={(event) =>
                updateFoodItem(index, {
                  ...food,
                  weightG: Number(event.target.value) || 0,
                })
              }
              step="0.01"
              type="number"
              value={food.weightG}
            />
            <b className="text-right text-sm text-[#1466bd]">
              {(food.carbohydratesG * (food.weightG / 100))
                .toFixed(2)
                .replace(".", ",")}
            </b>
            <IconButton
              aria-label="Remover alimento"
              onClick={() => removeFoodItem(index)}
              variant="ghost"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            </IconButton>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Button onClick={clearFoodItems} size="sm" variant="danger">
          <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          Limpar tudo
        </Button>
      </div>
    </section>
  );
}
