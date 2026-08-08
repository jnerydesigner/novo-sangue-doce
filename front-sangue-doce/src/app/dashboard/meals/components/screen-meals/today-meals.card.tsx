import { Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { IconButton } from "@/components/buttons/button";
import type { FoodConsumption } from "@/types/food-consumption.type";
import { useMealScreen } from "./meal-screen.store";
import {
  buildConicGradient,
  formatDecimal,
  itemColors,
  nutrientColors,
} from "./meal-summary.utils";

function formatMealType(mealType: string) {
  const labels: Record<string, string> = {
    AFTERNOON_SNACK: "Lanche da tarde",
    BREAKFAST: "Café da manhã",
    DINNER: "Jantar",
    LUNCH: "Almoço",
    MORNING_SNACK: "Lanche da manhã",
    OTHER: "Outro",
    SUPPER: "Ceia",
  };

  return labels[mealType] ?? mealType.replaceAll("_", " ");
}

function getMealNutrientRows(meal: FoodConsumption) {
  return [
    {
      color: nutrientColors.carbohydrates,
      label: "Carboidratos",
      value: `${formatDecimal(meal.totalCarbohydratesG)} g`,
      visualValue: Number(meal.totalCarbohydratesG),
    },
    {
      color: nutrientColors.protein,
      label: "Proteínas",
      value: `${formatDecimal(meal.totalProteinG)} g`,
      visualValue: Number(meal.totalProteinG),
    },
    {
      color: nutrientColors.fat,
      label: "Gorduras",
      value: `${formatDecimal(meal.totalFatG)} g`,
      visualValue: Number(meal.totalFatG),
    },
    {
      color: nutrientColors.fiber,
      label: "Fibras",
      value: `${formatDecimal(meal.totalFiberG)} g`,
      visualValue: Number(meal.totalFiberG),
    },
    {
      color: nutrientColors.energy,
      label: "Energia",
      value: `${Math.round(Number(meal.totalEnergyKcal) || 0)} kcal`,
      visualValue: Number(meal.totalEnergyKcal) / 10,
    },
  ];
}

function MealDetailsModal({
  meal,
  onClose,
}: {
  meal: FoodConsumption;
  onClose: () => void;
}) {
  const nutrientRows = getMealNutrientRows(meal);
  const chartBackground = buildConicGradient(
    nutrientRows.map((row) => ({ color: row.color, value: row.visualValue })),
  );

  return (
    <div
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a4a]/45 p-4"
      role="dialog"
    >
      <div className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-lg border border-line bg-white p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">{formatMealType(meal.mealType)}</h3>
            <p className="mt-1 text-sm text-[#55718f]">
              {new Date(meal.consumedAt).toLocaleString("pt-BR", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          </div>
          <IconButton aria-label="Fechar detalhes da refeição" onClick={onClose}>
            <X aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
          </IconButton>
        </div>

        {meal.notes ? (
          <p className="mt-4 rounded-lg border border-line bg-paper2 p-3 text-sm text-inkSoft">
            {meal.notes}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between rounded-lg border border-[#c8dcec] bg-[#f7fbff] p-5">
          <div>
            <p className="text-sm font-semibold text-[#55718f]">
              Total de carboidratos
            </p>
            <strong className="text-3xl">
              {formatDecimal(meal.totalCarbohydratesG)} g
            </strong>
            <small className="mt-1 block text-xs text-[#55718f]">
              Estimativa total
            </small>
          </div>
          <div
            className="h-28 w-28 rounded-full"
            style={{ background: chartBackground }}
          >
            <div className="m-5 h-[72px] rounded-full bg-[#f7fbff]" />
          </div>
        </div>

        <h4 className="mt-5 mb-3 text-sm font-bold">Totais por nutriente</h4>
        <div className="overflow-hidden rounded-lg border border-[#c8dcec] text-sm">
          {nutrientRows.map((row) => (
            <div
              className="flex items-center justify-between gap-3 border-b border-[#d5e2ef] px-3 py-2 last:border-0"
              key={row.label}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: row.color }}
                />
                {row.label}
              </span>
              <b style={{ color: row.color }}>{row.value}</b>
            </div>
          ))}
        </div>

        <h4 className="mt-5 mb-3 text-sm font-bold">Alimentos</h4>
        <div className="overflow-hidden rounded-lg border border-line">
          {meal.items.map((item, index) => {
            const itemColor = itemColors[index % itemColors.length];

            return (
              <div
                className="grid gap-1 border-b border-line px-3 py-2 text-sm last:border-0 sm:grid-cols-[1fr_auto]"
                key={item.id}
              >
                <div>
                  <b className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: itemColor }}
                    />
                    {item.foodNameSnapshot}
                  </b>
                  {item.foodDescriptionSnapshot ? (
                    <p className="text-xs text-[#55718f]">
                      {item.foodDescriptionSnapshot}
                    </p>
                  ) : null}
                </div>
                <div className="text-[#55718f] sm:text-right">
                  <b style={{ color: itemColor }}>
                    {formatDecimal(item.carbohydratesG)} g carb.
                  </b>
                  <p className="text-xs">
                    {formatDecimal(item.quantity)} {item.unit} ·{" "}
                    {formatDecimal(item.weightG)} g
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function TodayMealsCard() {
  const { deleteMeal, editMeal, todayMeals } = useMealScreen();
  const [selectedMeal, setSelectedMeal] = useState<FoodConsumption | null>(null);

  async function handleDeleteMeal(
    event: React.MouseEvent<HTMLButtonElement>,
    meal: FoodConsumption,
  ) {
    event.stopPropagation();
    await deleteMeal(meal.id);
    if (selectedMeal?.id === meal.id) {
      setSelectedMeal(null);
    }
  }

  function handleEditMeal(
    event: React.MouseEvent<HTMLButtonElement>,
    meal: FoodConsumption,
  ) {
    event.stopPropagation();
    editMeal(meal);
    setSelectedMeal(null);
  }

  return (
    <section className="mt-4 rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">Refeições de hoje</h2>

      {todayMeals.length === 0 ? (
        <p className="text-sm text-[#55718f]">Nenhuma refeição registrada hoje.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {todayMeals.map((meal) => (
            <div
              className="relative rounded-lg border border-[#d5e2ef] transition hover:border-azure hover:bg-paper2"
              key={meal.id}
            >
              <button
                className="block w-full p-3 pr-16 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
                onClick={() => setSelectedMeal(meal)}
                type="button"
              >
                <div className="flex justify-between text-sm font-bold">
                  <span>{formatMealType(meal.mealType)}</span>
                  <span>
                    {new Date(meal.consumedAt).toLocaleTimeString("pt-BR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-2 text-xs text-[#55718f]">
                  {meal.items.length} alimento(s)
                </p>
                <b className="text-sm text-[#1466bd]">
                  {formatDecimal(meal.totalCarbohydratesG)} g carboidratos
                </b>
              </button>
              <button
                aria-label="Editar refeição"
                className="absolute right-9 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#55718f] transition hover:bg-paper2 hover:text-azure focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure"
                onClick={(event) => handleEditMeal(event, meal)}
                type="button"
              >
                <Pencil aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              </button>
              <button
                aria-label="Excluir refeição"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md text-[#55718f] transition hover:bg-red-50 hover:text-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500"
                onClick={(event) => handleDeleteMeal(event, meal)}
                type="button"
              >
                <Trash2 aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedMeal ? (
        <MealDetailsModal
          meal={selectedMeal}
          onClose={() => setSelectedMeal(null)}
        />
      ) : null}
    </section>
  );
}
