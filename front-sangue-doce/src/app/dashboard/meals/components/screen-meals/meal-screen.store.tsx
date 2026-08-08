"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { toast } from "sonner";
import type { Food, MealFoodItem } from "@/types/food.type";
import type { FoodConsumption } from "@/types/food-consumption.type";
import type { MealType } from "@/types/meal.type";

const demoFoods: Food[] = [
  {
    id: 1,
    name: "Arroz integral cozido",
    category: "Cereais e derivados",
    carbohydratesG: 25.8,
    proteinG: 2.6,
    fatG: 1,
    fiberG: 0,
    energyKcal: 0,
    color: "#2d78d6",
    image: "/images/arroz-integral-cozido.webp",
  },
  {
    id: 2,
    name: "Carne patinho grelhado",
    category: "Carnes e ovos",
    carbohydratesG: 0,
    proteinG: 32,
    fatG: 8.4,
    fiberG: 0,
    energyKcal: 0,
    color: "#38c994",
    image: "/images/carne-patinho-grelhado.jpg",
  },
  {
    id: 3,
    name: "Batata doce cozida",
    category: "Tubérculos e raízes",
    carbohydratesG: 18.4,
    proteinG: 1.6,
    fatG: 0.1,
    fiberG: 0,
    energyKcal: 0,
    color: "#ffb71b",
    image: "/images/atata-doce-cozida.jpg",
  },
  {
    id: 4,
    name: "Suco de laranja natural",
    category: "Bebidas não alcoólicas",
    carbohydratesG: 24.96,
    proteinG: 3.55,
    fatG: 5.32,
    fiberG: 0,
    energyKcal: 0,
    color: "#ed6396",
    image: "/images/suco-de-laranja-natural.jpg",
  },
];

const minimumFoodSearchLength = 3;

function safeNumber(value: unknown, fallback = 0) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
}

function resetNewMealState({
  setCategoryFilter,
  setFoodSearch,
  setItems,
  setMealType,
  setNotes,
  setSaved,
}: {
  setCategoryFilter: (value: string) => void;
  setFoodSearch: (value: string) => void;
  setItems: (value: MealFoodItem[]) => void;
  setMealType: (value: MealType) => void;
  setNotes: (value: string) => void;
  setSaved: (value: boolean) => void;
}) {
  setItems([]);
  setFoodSearch("");
  setCategoryFilter("Todas");
  setMealType("LUNCH");
  setNotes("");
  setSaved(false);
}

function mapFood(food: any): Food {
  return {
    id: food.id,
    name: [food.name, food.description].filter(Boolean).join(" "),
    category: food.category?.name ?? "Sem categoria",
    carbohydratesG: safeNumber(food.carbohydratesG),
    proteinG: safeNumber(food.proteinG),
    fatG: safeNumber(food.fatG),
    fiberG: safeNumber(food.fiberG),
    energyKcal: safeNumber(food.energyKcal),
    color: "#2d78d6",
    image: food.images?.[0]?.imageUrl,
  };
}

function withDefaultMealItem(food: Food): MealFoodItem {
  return { ...food, quantity: 100, unit: "GRAM", weightG: 100 };
}

function mapMealItemToEditableFood(item: FoodConsumption["items"][number]): MealFoodItem {
  const food = item.food as FoodConsumption["items"][number]["food"] & {
    category?: { name?: string };
  };

  return {
    id: item.foodId,
    name: [item.foodNameSnapshot, item.foodDescriptionSnapshot]
      .filter(Boolean)
      .join(" "),
    category: food.category?.name ?? "Sem categoria",
    carbohydratesG: safeNumber(food.carbohydratesG),
    proteinG: safeNumber(food.proteinG),
    fatG: safeNumber(food.fatG),
    fiberG: safeNumber(food.fiberG),
    energyKcal: safeNumber(food.energyKcal),
    color: "#2d78d6",
    image: food.images?.[0]?.imageUrl,
    quantity: safeNumber(item.quantity, 100),
    unit: item.unit,
    weightG: safeNumber(item.weightG, 100),
  };
}

type MealScreenStore = {
  canSuggestFoods: boolean;
  categories: string[];
  categoryFilter: string;
  cancelEditMeal: () => void;
  createFood: (formData: FormData) => Promise<Food>;
  deleteMeal: (id: number) => Promise<void>;
  editMeal: (meal: FoodConsumption) => void;
  editingMealId: number | null;
  filteredFoods: Food[];
  foodSearch: string;
  items: MealFoodItem[];
  mealType: MealType;
  notes: string;
  removeFoodItem: (index: number) => void;
  saveMeal: () => Promise<void>;
  saved: boolean;
  saving: boolean;
  searchFoods: () => Promise<void>;
  searchingFoods: boolean;
  setCategoryFilter: (category: string) => void;
  setFoodSearch: (search: string) => void;
  setMealType: (mealType: MealType) => void;
  setNotes: (notes: string) => void;
  todayMeals: FoodConsumption[];
  totalCarbohydratesG: number;
  addFood: (food: Food) => void;
  clearFoodItems: () => void;
  updateFoodItem: (index: number, item: MealFoodItem) => void;
};

const MealScreenContext = createContext<MealScreenStore | null>(null);

export function MealScreenProvider({ children }: { children: ReactNode }) {
  const [availableFoods, setAvailableFoods] = useState(demoFoods);
  const [items, setItems] = useState<MealFoodItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchingFoods, setSearchingFoods] = useState(false);
  const [foodSearch, setFoodSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  const [todayMeals, setTodayMeals] = useState<FoodConsumption[]>([]);
  const [mealType, setMealType] = useState<MealType>("LUNCH");
  const [notes, setNotes] = useState("");
  const [editingMealId, setEditingMealId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/foods")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data) => {
        const mapped: Food[] = data.map(mapFood);
        if (mapped.length) {
          setAvailableFoods(mapped);
          setItems([]);
        }
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    fetch("/api/food-consumptions/today")
      .then((response) => (response.ok ? response.json() : []))
      .then(setTodayMeals)
      .catch(() => undefined);
  }, []);

  const totalCarbohydratesG = useMemo(
    () =>
      items.reduce(
        (sum, food) =>
          sum + safeNumber(food.carbohydratesG) * (safeNumber(food.weightG) / 100),
        0,
      ),
    [items],
  );

  const categories = useMemo(
    () => Array.from(new Set(availableFoods.map((food) => food.category))).sort(),
    [availableFoods],
  );

  const filteredFoods = useMemo(
    () =>
      availableFoods.filter(
        (food) =>
          categoryFilter === "Todas" || food.category === categoryFilter,
      ),
    [availableFoods, categoryFilter],
  );

  const canSuggestFoods = foodSearch.trim().length >= minimumFoodSearchLength;

  async function searchFoods() {
    const search = foodSearch.trim();
    if (search.length < minimumFoodSearchLength || searchingFoods) return;

    setSearchingFoods(true);
    try {
      const params = new URLSearchParams({ name: search });
      const response = await fetch(`/api/foods?${params.toString()}`);
      if (!response.ok) throw new Error("Não foi possível buscar alimentos.");
      const data = await response.json();
      setAvailableFoods(data.map(mapFood));
      setCategoryFilter("Todas");
    } finally {
      setSearchingFoods(false);
    }
  }

  async function createFood(formData: FormData) {
    const response = await fetch("/api/foods", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) throw new Error("Não foi possível cadastrar o alimento.");

    const food = mapFood(await response.json());
    setAvailableFoods((current) => [food, ...current]);
    addFood(food);
    return food;
  }

  function addFood(food: Food) {
    setItems((current) => [...current, withDefaultMealItem(food)]);
    setFoodSearch("");
  }

  function updateFoodItem(indexToUpdate: number, item: MealFoodItem) {
    setItems((current) =>
      current.map((currentItem, index) =>
        index === indexToUpdate
          ? {
              ...item,
              quantity: safeNumber(item.quantity),
              weightG: safeNumber(item.weightG),
            }
          : currentItem,
      ),
    );
  }

  function removeFoodItem(indexToRemove: number) {
    setItems((current) =>
      current.filter((_, index) => index !== indexToRemove),
    );
  }

  function clearFoodItems() {
    setItems([]);
  }

  async function saveMeal() {
    if (!items.length || saving) return;
    setSaving(true);
    try {
      const payload = {
        mealType,
        notes: notes.trim() || undefined,
        items: items.map((food) => ({
          foodId: food.id,
          quantity: safeNumber(food.quantity),
          unit: food.unit,
          weightG: safeNumber(food.weightG),
        })),
      };
      const response = await fetch(
        editingMealId
          ? `/api/food-consumptions?id=${editingMealId}`
          : "/api/food-consumptions",
        {
          method: editingMealId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      if (!response.ok) throw new Error("Não foi possível salvar a refeição.");
      const savedMeal = await response.json();
      setTodayMeals((current) =>
        editingMealId
          ? current.map((meal) => (meal.id === savedMeal.id ? savedMeal : meal))
          : [...current, savedMeal],
      );
      resetNewMealState({
        setCategoryFilter,
        setFoodSearch,
        setItems,
        setMealType,
        setNotes,
        setSaved,
      });
      setEditingMealId(null);
      toast.success(editingMealId ? "Refeição atualizada." : "Refeição salva.", {
        description: editingMealId
          ? "As alterações foram aplicadas no resumo de hoje."
          : "Os alimentos foram registrados no resumo de hoje.",
      });
    } finally {
      setSaving(false);
    }
  }

  function editMeal(meal: FoodConsumption) {
    setEditingMealId(meal.id);
    setMealType(meal.mealType);
    setNotes(meal.notes ?? "");
    setItems(meal.items.map(mapMealItemToEditableFood));
    setFoodSearch("");
    setCategoryFilter("Todas");
    setSaved(false);
    toast("Refeição carregada para edição.", {
      description: "Ajuste os alimentos e salve para atualizar.",
    });
  }

  function cancelEditMeal() {
    resetNewMealState({
      setCategoryFilter,
      setFoodSearch,
      setItems,
      setMealType,
      setNotes,
      setSaved,
    });
    setEditingMealId(null);
  }

  async function deleteMeal(id: number) {
    const response = await fetch(`/api/food-consumptions?id=${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      toast.error("Não foi possível excluir a refeição.");
      throw new Error("Não foi possível excluir a refeição.");
    }

    setTodayMeals((current) => current.filter((meal) => meal.id !== id));
    if (editingMealId === id) {
      cancelEditMeal();
    }
    toast.success("Refeição excluída.");
  }

  const store = {
    addFood,
    canSuggestFoods,
    cancelEditMeal,
    categories,
    categoryFilter,
    clearFoodItems,
    createFood,
    deleteMeal,
    editMeal,
    editingMealId,
    filteredFoods,
    foodSearch,
    items,
    mealType,
    notes,
    removeFoodItem,
    saveMeal,
    saved,
    saving,
    searchFoods,
    searchingFoods,
    setCategoryFilter,
    setFoodSearch,
    setMealType,
    setNotes,
    todayMeals,
    totalCarbohydratesG,
    updateFoodItem,
  };

  return (
    <MealScreenContext.Provider value={store}>
      {children}
    </MealScreenContext.Provider>
  );
}

export function useMealScreen() {
  const context = useContext(MealScreenContext);
  if (!context) {
    throw new Error("useMealScreen must be used inside MealScreenProvider.");
  }
  return context;
}
