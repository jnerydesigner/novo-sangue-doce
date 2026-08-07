"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";

type Food = {
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

const demoFoods: Food[] = [
  {
    id: 1, name: "Arroz integral cozido",
    category: "Cereais e derivados",
    carbohydratesG: 25.8, proteinG: 2.6, fatG: 1, fiberG: 0, energyKcal: 0,
    color: "#2d78d6",
    image: "/images/arroz-integral-cozido.webp",
  },
  {
    id: 2, name: "Carne patinho grelhado",
    category: "Carnes e ovos",
    carbohydratesG: 0, proteinG: 32, fatG: 8.4, fiberG: 0, energyKcal: 0,
    color: "#38c994",
    image: "/images/carne-patinho-grelhado.jpg",
  },
  {
    id: 3, name: "Batata doce cozida",
    category: "Tubérculos e raízes",
    carbohydratesG: 18.4, proteinG: 1.6, fatG: 0.1, fiberG: 0, energyKcal: 0,
    color: "#ffb71b",
    image: "/images/atata-doce-cozida.jpg",
  },
  {
    id: 4, name: "Suco de laranja natural",
    category: "Bebidas não alcoólicas",
    carbohydratesG: 24.96, proteinG: 3.55, fatG: 5.32, fiberG: 0, energyKcal: 0,
    color: "#ed6396",
    image: "/images/suco-de-laranja-natural.jpg",
  },
];

export function MealsClient({
  avatarUrl,
  showAdminItems = false,
  userName,
}: {
  avatarUrl?: string;
  showAdminItems?: boolean;
  userName: string;
}) {
  const [availableFoods, setAvailableFoods] = useState(demoFoods);
  const [items, setItems] = useState<Food[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [todayMeals, setTodayMeals] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/foods")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data) => {
        const mapped: Food[] = data.map((food: any) => ({
          id: food.id,
          name: [food.name, food.description].filter(Boolean).join(" "),
          category: food.category?.name ?? "Sem categoria",
          carbohydratesG: Number(food.carbohydratesG ?? 0), proteinG: Number(food.proteinG ?? 0),
          fatG: Number(food.fatG ?? 0), fiberG: Number(food.fiberG ?? 0), energyKcal: Number(food.energyKcal ?? 0),
          color: "#2d78d6", image: food.images?.[0]?.imageUrl,
        }));
        if (mapped.length) { setAvailableFoods(mapped); setItems([]); }
      }).catch(() => undefined);
  }, []);
  useEffect(() => {
    fetch("/api/food-consumptions/today").then((response) => response.ok ? response.json() : []).then(setTodayMeals).catch(() => undefined);
  }, []);
  const total = items.reduce(
    (sum, food) => sum + food.carbohydratesG,
    0,
  );
  const categories = Array.from(new Set(availableFoods.map((food) => food.category))).sort();
  const filteredFoods = availableFoods
    .filter((food) => categoryFilter === "Todas" || food.category === categoryFilter)
    .filter((food) => food.name.toLowerCase().includes(foodSearch.toLowerCase()))
    .filter((food, index, foods) => foods.findIndex((item) => item.name === food.name) === index)
    .slice(0, 12);
  const canSuggestFoods = foodSearch.trim().length >= 5;

  function addFood(food: Food) {
    setItems((current) => [...current, { ...food }]);
    setFoodSearch("");
  }

  async function saveMeal() {
    if (!items.length || saving) return;
    setSaving(true);
    try {
      const response = await fetch("/api/food-consumptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: "LUNCH",
          items: items.map((food) => ({ foodId: food.id, quantity: 100, unit: "GRAM", weightG: 100 })),
        }),
      });
      if (!response.ok) throw new Error("Não foi possível salvar a refeição.");
      const createdMeal = await response.json();
      setTodayMeals((current) => [...current, createdMeal]);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="dashboard-shell bg-[#f3f8fd] text-[#102a4a]">
      <div className="dashboard-grid lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={showAdminItems} />
        <section className="min-w-0 overflow-x-hidden overflow-y-auto px-4 py-6 sm:px-8 lg:px-10">
          <DashboardHeader
            subtitle="Registre os alimentos que você consumiu e acompanhe os nutrientes."
            title="Nova refeição"
            avatarUrl={avatarUrl}
            userName={userName}
          />

          <div className="grid gap-3.5 xl:grid-cols-[minmax(0,2fr)_520px]">
            <section className="space-y-3.5">
              <Card title="Informações da refeição">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Tipo de refeição">
                    <select defaultValue="Almoço">
                      <option>Almoço</option>
                      <option>Café da manhã</option>
                      <option>Jantar</option>
                    </select>
                  </Field>
                  <Field label="Observação (opcional)">
                    <input placeholder="Ex.: almoço no trabalho" />
                  </Field>
                </div>
              </Card>
              <Card title="Alimentos adicionados">
                <div className="hidden grid-cols-[1fr_78px_106px_64px_110px_24px] gap-4 border-b border-[#d5e2ef] px-1 pb-2 text-xs text-[#55718f] md:grid">
                  <span>Alimento</span>
                  <span>Quantidade</span>
                  <span>Medida</span>
                  <span>Peso (g)</span>
                  <span>Carboidratos (g)</span>
                </div>
                <div>
                  {items.map((food, i) => (
                    <div
                      className="grid items-center gap-3 border-b border-[#e1eaf3] py-2.5 md:grid-cols-[1fr_78px_106px_64px_110px_24px] md:gap-4"
                      key={food.id}
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-16 overflow-hidden rounded-lg bg-[#edf2f4]">
                          {food.image ? (
                            <Image
                              src={food.image}
                              alt={food.name}
                              className="h-full w-full object-cover"
                              width={200}
                              height={200}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-2xl" aria-label={`Imagem não disponível para ${food.name}`}>
                              🍽️
                            </div>
                          )}
                        </div>
                        <div>
                          <b className="text-sm">{food.name}</b>
                          <p className="text-xs text-[#55718f]">
                            {food.category}
                          </p>
                        </div>
                      </div>
                      <input
                        className="w-full rounded-lg border border-[#c9dbea] bg-white px-3 py-2"
                        defaultValue={i === 1 ? "250" : i === 3 ? "1" : "100"}
                      />
                      <select className="rounded-lg border border-[#c9dbea] bg-white px-3 py-2">
                        <option>{i === 3 ? "copo" : "g"}</option>
                      </select>
                      <input
                        className="rounded-lg border border-[#c9dbea] bg-white px-3 py-2"
                        defaultValue={i === 3 ? "240" : i === 1 ? "250" : "100"}
                      />
                      <b className="text-right text-sm text-[#1466bd]">
                        {food.carbohydratesG.toFixed(2).replace(".", ",")}
                      </b>
                      <button
                        aria-label="Remover alimento"
                        onClick={() =>
                          setItems(items.filter((_, index) => index !== i))
                        }
                        className="text-xl text-[#263d54]"
                      >
                        ♜
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setItems([])}
                    className="rounded-lg border border-red-400 px-4 py-2 text-sm font-bold text-red-500"
                  >
                    ♜ Limpar tudo
                  </button>
                </div>
              </Card>
              <Card title="Buscar alimento">
                <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
                  <Field label="">
                    <input
                      className="mt-1 w-full rounded-lg border border-[#c9dbea] bg-white px-3 py-2 text-sm text-[#102a4a] outline-none transition focus:border-[#1768c4] focus:ring-2 focus:ring-[#1768c4]/15"
                      value={foodSearch}
                      onChange={(event) => setFoodSearch(event.target.value)}
                      placeholder="Digite o nome do alimento　⌕"
                    />
                  </Field>
                  <Field label="Categoria">
                    <select className="mt-1 w-full rounded-lg border border-[#c9dbea] bg-white px-3 py-2 text-sm text-[#102a4a] outline-none transition focus:border-[#1768c4] focus:ring-2 focus:ring-[#1768c4]/15" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                      <option>Todas</option>
                      {categories.map((category) => <option key={category}>{category}</option>)}
                    </select>
                  </Field>
                  <Field label="Tipo de medida">
                    <select className="mt-1 w-full rounded-lg border border-[#c9dbea] bg-white px-3 py-2 text-sm text-[#102a4a] outline-none transition focus:border-[#1768c4] focus:ring-2 focus:ring-[#1768c4]/15">
                      <option>Todas</option>
                    </select>
                  </Field>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#55718f]">
                  <span>{canSuggestFoods ? "Resultados:" : "Digite pelo menos 5 letras:"}</span>
                  {canSuggestFoods && filteredFoods.slice(0, 6).map((food) => (
                    <button
                      onClick={() => addFood(food)}
                      className="rounded-full border border-[#d5e2ef] bg-white px-3 py-1"
                      key={food.id}
                    >
                      {food.name}
                    </button>
                  ))}
                </div>
              </Card>
              <div className="rounded-lg border border-[#b9d9fb] bg-[#eff7ff] px-6 py-3 text-sm text-[#55718f]">
                <b className="text-[#1e6dc4]">ⓘ　Importante</b>
                <p className="ml-8">
                  Os valores nutricionais são calculados com base na TACO
                  (Tabela Brasileira de Composição de Alimentos) por 100g da
                  parte comestível.
                </p>
              </div>
            </section>
            <aside>
              <Card title="Resumo da refeição">
                <div className="flex items-center justify-between rounded-lg border border-[#c8dcec] bg-[#f7fbff] p-5">
                  <div>
                    <p className="text-sm font-semibold text-[#55718f]">
                      Total de carboidratos
                    </p>
                    <strong className="text-3xl">
                      {total.toFixed(2).replace(".", ",")} g
                    </strong>
                    <small className="block mt-1 text-xs text-[#55718f]">
                      Estimativa total
                    </small>
                  </div>
                  <div
                    className="h-28 w-28 rounded-full"
                    style={{
                      background:
                        "conic-gradient(#f4b515 0 27%, #38c994 27% 42%, #ed6396 42% 57%, #74a8eb 57% 100%)",
                    }}
                  >
                    <div className="m-5 h-[72px] rounded-full bg-[#f7fbff]" />
                  </div>
                </div>
                <h3 className="mt-5 mb-3 text-sm font-bold">
                  Totais por nutriente
                </h3>
                <div className="overflow-hidden rounded-lg border border-[#c8dcec] text-sm">
                  {[
                    ["Carboidratos", `${total.toFixed(2).replace(".", ",")} g`],
                    ["Proteínas", "39,75 g"],
                    ["Gorduras", "14,82 g"],
                    ["Fibras", "7,20 g"],
                    ["Energia", "620 kcal"],
                  ].map(([a, b]) => (
                    <div
                      className="flex justify-between border-b border-[#d5e2ef] px-3 py-2 last:border-0"
                      key={a}
                    >
                      <span>{a}</span>
                      <b>{b}</b>
                    </div>
                  ))}
                </div>
                <h3 className="mt-5 mb-3 text-sm font-bold">
                  Distribuição de carboidratos
                </h3>
                {items.map((f) => (
                  <div className="mb-3" key={f.id}>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: f.color }}>
                        ●　<span className="text-[#55718f]">{f.name}</span>
                      </span>
                      <b>
                        {f.carbohydratesG.toFixed(2).replace(".", ",")} g　
                        <span className="font-normal text-[#55718f]">
                          {Math.round(
                            (f.carbohydratesG /
                              Math.max(total, 1)) *
                              100,
                          )}
                          %
                        </span>
                      </b>
                    </div>
                    <div className="mt-1 h-1 rounded bg-[#e7eef5]">
                      <div
                        className="h-1 rounded"
                        style={{
                          background: f.color,
                          width: `${Math.min(100, (f.carbohydratesG / Math.max(total, 1)) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                <div className="mt-5 grid gap-3 border-t border-[#d5e2ef] pt-4">
                  <button
                    onClick={saveMeal}
                    className="rounded-lg bg-[#15509a] py-3 font-bold text-white"
                  >
                    ◉　{saving ? "Salvando..." : saved ? "Refeição salva!" : "Salvar refeição"}
                  </button>
                  <button className="rounded-lg border border-[#c8dcec] bg-white py-3 font-bold text-[#55718f]">
                    Cancelar
                  </button>
                </div>
              </Card>
            </aside>
          </div>
          <section className="mt-4">
            <Card title="Refeições de hoje">
              {todayMeals.length === 0 ? (
                <p className="text-sm text-[#55718f]">Nenhuma refeição registrada hoje.</p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {todayMeals.map((meal) => (
                    <div key={meal.id} className="rounded-lg border border-[#d5e2ef] p-3">
                      <div className="flex justify-between text-sm font-bold">
                        <span>{String(meal.mealType).replaceAll("_", " ")}</span>
                        <span>{new Date(meal.consumedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#55718f]">{meal.items.length} alimento(s)</p>
                      <b className="text-sm text-[#1466bd]">{Number(meal.totalCarbohydratesG).toFixed(2).replace(".", ",")} g carboidratos</b>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </section>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">{title}</h2>
      {children}
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-xs font-medium text-[#55718f]">
      <span className="block min-h-4">{label}</span>
      {children}
    </label>
  );
}
