import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Antes da Consulta — Guia 01 | Sangue Doce",
  description:
    "Chegue preparado para aproveitar melhor o tempo com o medico. Lista do que levar, o que observar e perguntas que valem fazer na consulta.",
};

const itemsToCarry = [
  "Lista dos medicamentos e doses utilizadas.",
  "Resultados de exames recentes.",
  "Registro das glicemias dos ultimos dias.",
  "Relatorio do sensor de glicose (se utilizar CGM).",
  "Lista de episodios de hipoglicemia ou hiperglicemia.",
];

const observationItems = [
  "Horarios em que a glicose mais sobe.",
  "Horarios em que a glicose mais cai.",
  "Relacao entre alimentacao, exercicio e glicemia.",
  "Sintomas incomuns ou mudancas recentes.",
];

const questionItems = [
  "Minha medicacao esta adequada?",
  "Como posso reduzir as oscilacoes da glicemia?",
  "Preciso ajustar a alimentacao?",
  "Preciso alterar a dose de insulina?",
  "Quais exames devo realizar antes da proxima consulta?",
];

const otherGuides = [
  {
    number: "02",
    title: "No mercado",
    copy: "Como ler rotulos sem estresse e montar uma cesta que ajuda a estabilizar a glicemia.",
    color: "text-green",
    href: "/guias/no-mercado",
    image: "/no_mercado.png",
  },
  {
    number: "03",
    title: "Depois do exercicio",
    copy: "Reposicao, hidratacao e sinais de atencao para fechar o treino com seguranca.",
    color: "text-blue",
    href: "/guias/depois-do-exercicio",
    image: "/depois_do_exercicio.png",
  },
];

export default function AntesDaConsultaPage() {
  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-line bg-paper/80 shadow-sm backdrop-blur-xl">
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <Link
            href="/"
            className="font-serif text-[1.6rem] font-medium tracking-normal text-greenDeep"
          >
            Sangue Doce
          </Link>
          <nav className="flex items-center gap-5">
            <Link
              href="/#guias"
              className="text-[14px] font-semibold text-inkSoft transition hover:text-ink"
            >
              ← Guias
            </Link>
            <Link
              href="/"
              className="hidden rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 sm:inline-flex"
            >
              Voltar para home
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden">
          <Image
            src="/antes_da_consulta.png"
            alt="Pessoa revisando anotacoes antes de uma consulta medica"
            fill
            priority
            className="-z-20 object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,16,12,.90)_0%,rgba(20,16,12,.45)_50%,rgba(20,16,12,.20)_100%)]" />

          <div className="wrap w-full pb-16 pt-[120px]">
            <div className="max-w-[700px]">
              <span className="eyebrow text-paper/85 before:bg-tomato">Guia rapido 01</span>
              <h1 className="mt-4 text-balance font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium leading-[1.02] tracking-normal text-paper drop-shadow-2xl">
                Antes da consulta
              </h1>
              <p className="mt-5 max-w-[52ch] text-[clamp(1.05rem,1.7vw,1.25rem)] leading-[1.55] text-paper/85 drop-shadow">
                Chegue preparado para aproveitar melhor o tempo com o medico.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="bg-paper py-[clamp(64px,9vw,110px)]">
          <div className="wrap">
            <div className="mx-auto max-w-[780px]">
              {/* Intro */}
              <p className="mb-12 max-w-[58ch] text-[1.1rem] leading-[1.65] text-inkSoft">
                Consultas bem aproveitadas comecam antes do consultorio. Reunir as informacoes
                certas com antecedencia torna a conversa mais objetiva e aumenta as chances de sair
                com um plano de cuidado mais ajustado a sua rotina.
              </p>

              {/* Section 1 — O que levar */}
              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-tomato">01</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Preparacao
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      O que levar
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {itemsToCarry.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-tomato" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 2 — O que observar */}
              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-blue">02</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Atencao
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      O que observar antes da consulta
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {observationItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-blue" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Section 3 — Perguntas importantes */}
              <div className="rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-greenDeep">03</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Dialogo
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Perguntas importantes
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {questionItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[5px] shrink-0 rounded-sm bg-green/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-greenDeep">
                        ?
                      </span>
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Disclaimer */}
              <p className="mt-8 text-[13px] leading-relaxed text-muted">
                Este guia tem carater educativo e nao substitui a orientacao do seu medico ou equipe
                de saude. Adapte as perguntas ao seu contexto clinico.
              </p>
            </div>
          </div>
        </section>

        {/* Other guides */}
        <section className="border-t border-line bg-paper2 py-[clamp(56px,8vw,96px)]">
          <div className="wrap">
            <div className="mb-10">
              <span className="eyebrow">Continue lendo</span>
              <h2 className="mt-3 font-serif text-[clamp(1.75rem,3vw,2.4rem)] font-medium leading-[1.05] tracking-normal">
                Outros guias rapidos
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {otherGuides.map((guide) => (
                <article
                  key={guide.number}
                  className="group overflow-hidden rounded-lg border border-line bg-card transition hover:-translate-y-1 hover:border-lineStrong hover:shadow-editorial"
                >
                  <div className="relative aspect-[16/9] bg-paper2">
                    <Image
                      src={guide.image}
                      alt={guide.title}
                      fill
                      className="object-cover"
                      sizes="600px"
                    />
                  </div>
                  <div className="p-7">
                    <span
                      className={`mb-3 block font-serif text-[2.2rem] leading-none ${guide.color}`}
                    >
                      {guide.number}
                    </span>
                    <h3 className="mb-2 font-serif text-[1.35rem] font-medium leading-tight tracking-normal text-ink transition group-hover:text-greenDeep">
                      {guide.title}
                    </h3>
                    <p className="mb-5 text-[15px] leading-[1.55] text-inkSoft">{guide.copy}</p>
                    <Link
                      href={guide.href}
                      className="inline-flex items-center gap-2 text-[14px] font-semibold text-greenDeep transition group-hover:gap-3"
                    >
                      Abrir guia
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 16 16"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 8h10M9 4l4 4-4 4"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
