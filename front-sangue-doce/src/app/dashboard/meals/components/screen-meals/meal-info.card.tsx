import { MessageSquareText, Utensils } from "lucide-react";
import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";
import type { MealType } from "@/types/meal.type";
import { useMealScreen } from "./meal-screen.store";

const mealTypeOptions: Array<{ label: string; value: MealType }> = [
  { label: "Café da manhã", value: "BREAKFAST" },
  { label: "Lanche da manhã", value: "MORNING_SNACK" },
  { label: "Almoço", value: "LUNCH" },
  { label: "Lanche da tarde", value: "AFTERNOON_SNACK" },
  { label: "Jantar", value: "DINNER" },
  { label: "Ceia", value: "SUPPER" },
  { label: "Outro", value: "OTHER" },
];

export function MealInfoCard() {
  const { mealType, notes, setMealType, setNotes } = useMealScreen();

  return (
    <section className="rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">Informações da refeição</h2>

      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.28fr)]">
        <SelectField
          icon={Utensils}
          label="Tipo de refeição"
          onChange={(event) => setMealType(event.target.value as MealType)}
          value={mealType}
        >
          {mealTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </SelectField>

        <InputField
          icon={MessageSquareText}
          label="Observação"
          maxLength={500}
          onChange={(event) => setNotes(event.target.value)}
          optionalLabel="(opcional)"
          placeholder="Ex.: almoço no trabalho"
          value={notes}
        />
      </div>
    </section>
  );
}
