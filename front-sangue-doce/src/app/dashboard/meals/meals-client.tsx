"use client";

import { Alert } from "@/components/alerts/alert";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { AddedFoodsCard } from "./components/screen-meals/added-foods.card";
import { FoodSearchCard } from "./components/screen-meals/food-search.card";
import { MealInfoCard } from "./components/screen-meals/meal-info.card";
import { MealScreenProvider } from "./components/screen-meals/meal-screen.store";
import { MealSummaryCard } from "./components/screen-meals/meal-summary.card";
import { TodayMealsCard } from "./components/screen-meals/today-meals.card";

export function MealsClient({
  showAdminItems = false,
  userName,
}: {
  showAdminItems?: boolean;
  userName: string;
}) {
  return (
    <main className="dashboard-shell bg-[#f3f8fd] text-[#102a4a]">
      <div className="dashboard-grid lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={showAdminItems} />
        <section className="dashboard-shell-content min-w-0 overflow-x-hidden overflow-y-auto px-4 pb-6 sm:px-8 lg:px-10 lg:py-6">
          <DashboardHeader
            subtitle="Registre os alimentos que você consumiu e acompanhe os nutrientes."
            title="Nova refeição"
            userName={userName}
          />

          <MealScreenProvider>
            <div className="grid gap-3.5 xl:grid-cols-[minmax(0,2fr)_520px]">
              <section className="space-y-3.5">
                <TodayMealsCard />
                <MealInfoCard />
                <AddedFoodsCard />
                <FoodSearchCard />
                <Alert type="info">
                  Os valores nutricionais são calculados com base na TACO (Tabela Brasileira de
                  Composição de Alimentos) por 100g da parte comestível.
                </Alert>
              </section>
              <aside className="mt-4">
                <MealSummaryCard />
              </aside>
            </div>
          </MealScreenProvider>
        </section>
      </div>
    </main>
  );
}
