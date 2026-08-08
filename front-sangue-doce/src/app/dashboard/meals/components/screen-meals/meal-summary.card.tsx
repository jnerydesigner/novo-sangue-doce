import { Button } from "@/components/buttons/button";
import { useMealScreen } from "./meal-screen.store";
import {
  buildConicGradient,
  formatDecimal,
  itemColors,
  nutrientColors,
} from "./meal-summary.utils";

export function MealSummaryCard() {
  const {
    cancelEditMeal,
    editingMealId,
    items,
    saveMeal,
    saved,
    saving,
    totalCarbohydratesG,
  } = useMealScreen();
  const totals = items.reduce(
    (sum, food) => {
      const factor = Number.isFinite(food.weightG) ? food.weightG / 100 : 0;
      return {
        carbohydratesG: sum.carbohydratesG + food.carbohydratesG * factor,
        energyKcal: sum.energyKcal + food.energyKcal * factor,
        fatG: sum.fatG + food.fatG * factor,
        fiberG: sum.fiberG + food.fiberG * factor,
        proteinG: sum.proteinG + food.proteinG * factor,
      };
    },
    { carbohydratesG: 0, energyKcal: 0, fatG: 0, fiberG: 0, proteinG: 0 },
  );
  const nutrientRows = [
    {
      color: nutrientColors.carbohydrates,
      label: "Carboidratos",
      value: `${formatDecimal(totalCarbohydratesG)} g`,
      visualValue: totalCarbohydratesG,
    },
    {
      color: nutrientColors.protein,
      label: "Proteínas",
      value: `${formatDecimal(totals.proteinG)} g`,
      visualValue: totals.proteinG,
    },
    {
      color: nutrientColors.fat,
      label: "Gorduras",
      value: `${formatDecimal(totals.fatG)} g`,
      visualValue: totals.fatG,
    },
    {
      color: nutrientColors.fiber,
      label: "Fibras",
      value: `${formatDecimal(totals.fiberG)} g`,
      visualValue: totals.fiberG,
    },
    {
      color: nutrientColors.energy,
      label: "Energia",
      value: `${Math.round(Number.isFinite(totals.energyKcal) ? totals.energyKcal : 0)} kcal`,
      visualValue: totals.energyKcal / 10,
    },
  ];
  const chartBackground = buildConicGradient(
    nutrientRows.map((row) => ({ color: row.color, value: row.visualValue })),
  );

  return (
    <section className="rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">Resumo da refeição</h2>

      <div className="flex items-center justify-between rounded-lg border border-[#c8dcec] bg-[#f7fbff] p-5">
        <div>
          <p className="text-sm font-semibold text-[#55718f]">Total de carboidratos</p>
          <strong className="text-3xl">{formatDecimal(totalCarbohydratesG)} g</strong>
          <small className="block mt-1 text-xs text-[#55718f]">Estimativa total</small>
        </div>
        <div
          className="h-28 w-28 rounded-full"
          style={{
            background: chartBackground,
          }}
        >
          <div className="m-5 h-[72px] rounded-full bg-[#f7fbff]" />
        </div>
      </div>

      <h3 className="mt-5 mb-3 text-sm font-bold">Totais por nutriente</h3>
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

      <h3 className="mt-5 mb-3 text-sm font-bold">Distribuição de carboidratos</h3>
      {items.map((food, index) => {
        const carbohydratesG =
          food.carbohydratesG *
          (Number.isFinite(food.weightG) ? food.weightG / 100 : 0);
        const itemColor = itemColors[index % itemColors.length];

        return (
          <div className="mb-3" key={food.id}>
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  aria-hidden="true"
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: itemColor }}
                />
                <span className="text-[#55718f]">{food.name}</span>
              </span>
              <b>
                {formatDecimal(carbohydratesG)} g　
                <span className="font-normal text-[#55718f]">
                  {Math.round(
                    (carbohydratesG / Math.max(totalCarbohydratesG, 1)) * 100,
                  )}
                  %
                </span>
              </b>
            </div>
            <div className="mt-1 h-1 rounded bg-[#e7eef5]">
              <div
                className="h-1 rounded"
                style={{
                  background: itemColor,
                  width: `${Math.min(100, (carbohydratesG / Math.max(totalCarbohydratesG, 1)) * 100)}%`,
                }}
              />
            </div>
          </div>
        );
      })}

      <div className="mt-5 grid gap-3 border-t border-[#d5e2ef] pt-4">
        <Button onClick={saveMeal} variant="primary">
          ◉　{saving
            ? "Salvando..."
            : saved
              ? "Refeição salva!"
              : editingMealId
                ? "Atualizar refeição"
                : "Salvar refeição"}
        </Button>
        <Button onClick={cancelEditMeal} variant="secondary">
          Cancelar
        </Button>
      </div>
    </section>
  );
}
