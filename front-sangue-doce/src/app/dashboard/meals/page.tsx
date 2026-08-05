"use client";

import Image from "next/image";
import { useState } from "react";

type Food = {
  name: string;
  category: string;
  carbs: string;
  protein: string;
  fat: string;
  color: string;
  image: string;
};

const foods: Food[] = [
  {
    name: "Arroz integral cozido",
    category: "Cereais e derivados",
    carbs: "25,80",
    protein: "2,60",
    fat: "1,00",
    color: "#2d78d6",
    image: "/images/arroz-integral-cozido.webp",
  },
  {
    name: "Carne patinho grelhado",
    category: "Carnes e ovos",
    carbs: "0,00",
    protein: "32,00",
    fat: "8,40",
    color: "#38c994",
    image: "/images/carne-patinho-grelhado.jpg",
  },
  {
    name: "Batata doce cozida",
    category: "Tubérculos e raízes",
    carbs: "18,40",
    protein: "1,60",
    fat: "0,10",
    color: "#ffb71b",
    image: "/images/atata-doce-cozida.jpg",
  },
  {
    name: "Suco de laranja natural",
    category: "Bebidas não alcoólicas",
    carbs: "24,96",
    protein: "3,55",
    fat: "5,32",
    color: "#ed6396",
    image: "/images/suco-de-laranja-natural.jpg",
  },
];

export default function MealsPage() {
  const [items, setItems] = useState(foods);
  const [saved, setSaved] = useState(false);
  const total = items.reduce(
    (sum, food) => sum + Number(food.carbs.replace(",", ".")),
    0,
  );

  return (
    <main className="min-h-screen bg-[#f3f8fd] px-4 py-6 text-[#102a4a] sm:px-8 lg:px-10">
      <header className="mb-5 flex flex-wrap items-start justify-between gap-5">
        <div>
          <div className="mb-1 text-xs text-[#66809d]">
            Refeições <span className="mx-2">/</span>{" "}
            <b className="text-[#284b70]">Nova refeição</b>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Nova refeição</h1>
          <p className="text-sm text-[#315477]">
            Registre os alimentos que você consumiu e acompanhe os nutrientes.
          </p>
        </div>
        <div className="flex gap-6">
          <label className="rounded-lg border border-[#bad0e6] bg-white px-4 py-2 text-xs font-semibold text-[#55718f]">
            Data e hora
            <input
              className="mt-1 block border-0 p-0 text-sm font-bold text-[#132e4d] outline-none"
              type="datetime-local"
              defaultValue="2026-08-02T12:30"
            />
          </label>
          <button className="hidden rounded-lg border border-[#bad0e6] bg-white px-4 py-3 text-left text-sm font-bold sm:block">
            👤 Jander da Costa Nery　⌄
          </button>
        </div>
      </header>

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
                  key={food.name}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-16 overflow-hidden rounded-lg bg-[#edf2f4]">
                      <Image
                        src={food.image}
                        alt={food.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <b className="text-sm">{food.name}</b>
                      <p className="text-xs text-[#55718f]">{food.category}</p>
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
                    {food.carbs}
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
            <div className="mt-4 flex justify-between">
              <button
                onClick={() => setItems([...items, foods[0]])}
                className="rounded-lg border border-[#1768c4] px-4 py-2 text-sm font-bold text-[#1768c4]"
              >
                ＋ Adicionar alimento
              </button>
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
                <input placeholder="Digite o nome do alimento　⌕" />
              </Field>
              <Field label="Categoria">
                <select>
                  <option>Todas</option>
                </select>
              </Field>
              <Field label="Tipo de medida">
                <select>
                  <option>Todas</option>
                </select>
              </Field>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#55718f]">
              <span>Sugestões populares:</span>
              {[
                "Arroz integral cozido",
                "Frango grelhado",
                "Batata doce",
                "Ovo",
                "Suco de laranja",
              ].map((x) => (
                <button
                  className="rounded-full border border-[#d5e2ef] bg-white px-3 py-1"
                  key={x}
                >
                  {x}
                </button>
              ))}
            </div>
          </Card>
          <div className="rounded-lg border border-[#b9d9fb] bg-[#eff7ff] px-6 py-3 text-sm text-[#55718f]">
            <b className="text-[#1e6dc4]">ⓘ　Importante</b>
            <p className="ml-8">
              Os valores nutricionais são calculados com base na TACO (Tabela
              Brasileira de Composição de Alimentos) por 100g da parte
              comestível.
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
              <div className="mb-3" key={f.name}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: f.color }}>
                    ●　<span className="text-[#55718f]">{f.name}</span>
                  </span>
                  <b>
                    {f.carbs} g　
                    <span className="font-normal text-[#55718f]">
                      {Math.round(
                        (Number(f.carbs.replace(",", ".")) /
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
                      width: `${Math.min(100, (Number(f.carbs.replace(",", ".")) / Math.max(total, 1)) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-5 grid gap-3 border-t border-[#d5e2ef] pt-4">
              <button
                onClick={() => setSaved(true)}
                className="rounded-lg bg-[#15509a] py-3 font-bold text-white"
              >
                ◉　{saved ? "Refeição salva!" : "Salvar refeição"}
              </button>
              <button className="rounded-lg border border-[#c8dcec] bg-white py-3 font-bold text-[#55718f]">
                Cancelar
              </button>
            </div>
          </Card>
        </aside>
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
      {label}
      {children}
    </label>
  );
}
