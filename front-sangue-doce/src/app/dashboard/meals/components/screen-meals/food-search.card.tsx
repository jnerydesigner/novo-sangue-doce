import { ImagePlus, Plus, Ruler, Search, Tags } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/buttons/button";
import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";
import { useMealScreen } from "./meal-screen.store";

export function FoodSearchCard() {
  const {
    addFood,
    canSuggestFoods,
    categories,
    categoryFilter,
    createFood,
    filteredFoods,
    foodSearch,
    searchFoods,
    searchingFoods,
    setCategoryFilter,
    setFoodSearch,
  } = useMealScreen();
  const [creatingFood, setCreatingFood] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createError, setCreateError] = useState("");
  const canCreateFood = canSuggestFoods && filteredFoods.length === 0;

  async function handleCreateFood(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreateError("");
    setCreatingFood(true);

    try {
      await createFood(new FormData(event.currentTarget));
      event.currentTarget.reset();
      setShowCreateForm(false);
    } catch {
      setCreateError("Não foi possível cadastrar o alimento.");
    } finally {
      setCreatingFood(false);
    }
  }

  return (
    <section className="rounded-lg border border-[#c8dcec] bg-white p-5">
      <h2 className="mb-4 text-base font-bold">Buscar alimento</h2>

      <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
          <InputField
            icon={Search}
            label="Alimento"
            onChange={(event) => setFoodSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                searchFoods();
              }
            }}
            placeholder="Digite o nome do alimento"
            rightIcon={
              <Search aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            }
            value={foodSearch}
          />
          <Button
            aria-label="Buscar alimento"
            className="w-full sm:w-auto"
            disabled={!canSuggestFoods || searchingFoods}
            onClick={searchFoods}
            type="button"
            variant="primary"
          >
            <Search aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
            {searchingFoods ? "Buscando..." : "Buscar"}
          </Button>
        </div>
        <SelectField
          icon={Tags}
          label="Categoria"
          onChange={(event) => setCategoryFilter(event.target.value)}
          value={categoryFilter}
        >
          <option>Todas</option>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </SelectField>
        <SelectField icon={Ruler} label="Tipo de medida">
          <option>Todas</option>
        </SelectField>
      </div>

      <div className="mt-3 text-xs text-[#55718f]">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span>
            {canSuggestFoods
              ? `${filteredFoods.length} resultado(s):`
              : "Digite pelo menos 3 letras para buscar:"}
          </span>
          {canCreateFood ? (
            <Button
              onClick={() => setShowCreateForm((current) => !current)}
              size="sm"
              type="button"
              variant="secondary"
            >
              <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              Cadastrar novo alimento
            </Button>
          ) : null}
        </div>

        {canSuggestFoods ? (
          <div className="flex max-h-44 flex-wrap gap-2 overflow-y-auto rounded-lg border border-line bg-white p-2">
            {filteredFoods.map((food) => (
              <button
                className="rounded-full border border-[#d5e2ef] bg-white px-3 py-1 text-left hover:border-azure hover:text-azure"
                key={food.id}
                onClick={() => addFood(food)}
                type="button"
              >
                {food.name}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {showCreateForm ? (
        <form
          className="mt-4 rounded-lg border border-line bg-paper2 p-4"
          onSubmit={handleCreateFood}
        >
          <div className="grid gap-3 lg:grid-cols-2">
            <InputField
              defaultValue={foodSearch}
              icon={Search}
              label="Nome"
              name="name"
              placeholder="Ex.: Café com leite"
              required
            />
            <InputField
              defaultValue={categoryFilter === "Todas" ? "" : categoryFilter}
              icon={Tags}
              list="food-category-suggestions"
              label="Categoria"
              name="categoryName"
              placeholder="Ex.: Bebidas"
              required
            />
            <datalist id="food-category-suggestions">
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </datalist>
            <InputField
              label="Carboidratos"
              min="0"
              name="carbohydratesG"
              placeholder="0"
              step="0.01"
              type="number"
            />
            <InputField
              label="Proteínas"
              min="0"
              name="proteinG"
              placeholder="0"
              step="0.01"
              type="number"
            />
            <InputField
              label="Gorduras"
              min="0"
              name="fatG"
              placeholder="0"
              step="0.01"
              type="number"
            />
            <InputField
              label="Fibras"
              min="0"
              name="fiberG"
              placeholder="0"
              step="0.01"
              type="number"
            />
            <InputField
              label="Energia"
              min="0"
              name="energyKcal"
              placeholder="0"
              step="0.01"
              type="number"
            />
            <InputField
              accept="image/*"
              icon={ImagePlus}
              label="Imagem"
              name="image"
              optionalLabel="(opcional)"
              type="file"
            />
          </div>
          <InputField
            className="mt-0"
            label="Descrição"
            name="description"
            placeholder="Ex.: bebida preparada sem açúcar"
            wrapperClassName="mt-3"
          />

          {createError ? (
            <p className="mt-3 text-sm font-semibold text-red-600">{createError}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button
              onClick={() => setShowCreateForm(false)}
              type="button"
              variant="secondary"
            >
              Cancelar
            </Button>
            <Button disabled={creatingFood} type="submit" variant="primary">
              <Plus aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
              {creatingFood ? "Cadastrando..." : "Cadastrar e adicionar"}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
