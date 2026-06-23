import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const DESCRIPTION =
  "Pequenas escolhas no carrinho fazem grande diferença no controle glicêmico. Veja o que priorizar, como ler rótulos e o que evitar comprar em excesso.";

export const metadata: Metadata = {
  title: "No Mercado — Guia 02",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/guias/no-mercado`,
  },
  openGraph: {
    title: `No Mercado — Guia 02 | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/guias/no-mercado`,
    type: "article",
    images: [{ url: `${SITE_URL}/no_mercado.png`, alt: "No Mercado" }],
  },
};

const priorityItems = [
  "Verduras e legumes.",
  "Ovos.",
  "Frango, peixe e carnes magras.",
  "Feijao, lentilha e grao-de-bico.",
  "Castanhas e sementes.",
  "Iogurte natural sem acucar.",
];

const labelItems = [
  "Carboidratos totais.",
  "Acucares adicionados.",
  "Quantidade de fibras.",
  "Tamanho da porcao.",
];

const avoidItems = [
  "Refrigerantes.",
  "Sucos industrializados.",
  "Biscoitos recheados.",
  "Doces e sobremesas ultraprocessadas.",
  "Cereais acucarados.",
];

const otherGuides = [
  {
    number: "01",
    title: "Antes da consulta",
    copy: "O que anotar, quais perguntas levar e como chegar preparado para uma conversa que rende.",
    color: "text-tomato",
    href: "/guias/antes-da-consulta",
    image: "/antes_da_consulta.png",
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

export default function NoMercadoPage() {
  return (
    <>
      <header className="sticky top-0 z-[100] border-b border-line bg-paper/80 shadow-sm backdrop-blur-xl">
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <div className="text-greenDeep">
            <Brand />
          </div>
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
        <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden">
          <Image
            src="/no_mercado.png"
            alt="Compras saudaveis no mercado"
            width={1920}
            height={1280}
            className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
            fetchPriority="high"
            loading="eager"
            sizes="100vw"
            title="No mercado"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,16,12,.88)_0%,rgba(20,16,12,.42)_52%,rgba(20,16,12,.18)_100%)]" />

          <div className="wrap w-full pb-16 pt-[120px]">
            <div className="max-w-[720px]">
              <span className="eyebrow text-paper/85 before:bg-green">Guia rapido 02</span>
              <h1 className="mt-4 text-balance font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium leading-[1.02] tracking-normal text-paper drop-shadow-2xl">
                No mercado
              </h1>
              <p className="mt-5 max-w-[52ch] text-[clamp(1.05rem,1.7vw,1.25rem)] leading-[1.55] text-paper/85 drop-shadow">
                Pequenas escolhas no carrinho fazem grande diferenca no controle glicemico.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper py-[clamp(64px,9vw,110px)]">
          <div className="wrap">
            <div className="mx-auto max-w-[780px]">
              <p className="mb-12 max-w-[58ch] text-[1.1rem] leading-[1.65] text-inkSoft">
                Uma compra bem pensada facilita a rotina inteira. A ideia nao e transformar o
                mercado em uma prova, mas montar uma base simples, nutritiva e mais previsivel para
                a glicemia ao longo da semana.
              </p>

              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-greenDeep">01</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Carrinho base
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Priorize
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5 sm:grid-cols-2">
                  {priorityItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-green" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-blue">02</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Rotulo
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Aprenda a ler o rotulo
                    </h2>
                  </div>
                </div>
                <p className="mb-5 text-[1rem] leading-[1.6] text-inkSoft">Observe:</p>
                <ul className="grid gap-3.5">
                  {labelItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[5px] shrink-0 rounded-sm bg-blue/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-blue">
                        Ver
                      </span>
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-tomato">03</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Limites
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Evite comprar em excesso
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {avoidItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-tomato" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg bg-greenDeep p-[clamp(26px,4vw,42px)] text-paper">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-paper/70">
                  Regra rapida
                </span>
                <p className="mt-3 max-w-[54ch] font-serif text-[clamp(1.65rem,3vw,2.25rem)] font-medium leading-[1.12] tracking-normal">
                  Quanto menos ingredientes e mais proximo do alimento natural, melhor.
                </p>
              </div>

              <p className="mt-8 text-[13px] leading-relaxed text-muted">
                Este guia tem carater educativo e nao substitui a orientacao do seu medico ou equipe
                de saude. Ajuste as escolhas ao seu plano alimentar e contexto clinico.
              </p>
            </div>
          </div>
        </section>

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
                      width={600}
                      height={338}
                      className="h-full w-full object-cover"
                      loading="lazy"
                      sizes="600px"
                      title={guide.title}
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
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.6"
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
