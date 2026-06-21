import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/home/site-footer";

export const metadata: Metadata = {
  title: "Depois do Exercício — Guia 03 | Sangue Doce",
  description:
    "A atividade fisica continua impactando a glicose mesmo apos o treino. Veja como monitorar, reconhecer sinais de alerta e recuperar com seguranca.",
};

const afterExerciseItems = [
  "Hidrate-se adequadamente.",
  "Monitore a glicemia.",
  "Faca uma refeicao equilibrada para recuperacao.",
];

const attentionItems = [
  "Hipoglicemia imediata.",
  "Hipoglicemia tardia (horas depois).",
  "Queda da glicose durante o sono.",
];

const alertItems = [
  "Tremores.",
  "Sudorese excessiva.",
  "Tontura.",
  "Confusao mental.",
  "Fraqueza intensa.",
];

const recoveryItems = [
  "Tenha uma fonte rapida de carboidrato por perto.",
  "Evite treinar em jejum sem orientacao.",
  "Observe como cada atividade afeta sua glicemia.",
  "Registre os resultados para ajustar os proximos treinos.",
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
    number: "02",
    title: "No mercado",
    copy: "Como ler rotulos sem estresse e montar uma cesta que ajuda a estabilizar a glicemia.",
    color: "text-green",
    href: "/guias/no-mercado",
    image: "/no_mercado.png",
  },
];

export default function DepoisDoExercicioPage() {
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
        <section className="relative isolate flex min-h-[68vh] items-end overflow-hidden">
          <Image
            src="/depois_do_exercicio.png"
            alt="Pessoa se recuperando depois de atividade fisica"
            fill
            priority
            className="-z-20 object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,16,12,.88)_0%,rgba(20,16,12,.42)_52%,rgba(20,16,12,.18)_100%)]" />

          <div className="wrap w-full pb-16 pt-[120px]">
            <div className="max-w-[720px]">
              <span className="eyebrow text-paper/85 before:bg-blue">Guia rapido 03</span>
              <h1 className="mt-4 text-balance font-serif text-[clamp(2.8rem,6vw,4.8rem)] font-medium leading-[1.02] tracking-normal text-paper drop-shadow-2xl">
                Depois do exercicio
              </h1>
              <p className="mt-5 max-w-[52ch] text-[clamp(1.05rem,1.7vw,1.25rem)] leading-[1.55] text-paper/85 drop-shadow">
                A atividade fisica continua impactando a glicose mesmo apos o treino.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-paper py-[clamp(64px,9vw,110px)]">
          <div className="wrap">
            <div className="mx-auto max-w-[780px]">
              <p className="mb-12 max-w-[58ch] text-[1.1rem] leading-[1.65] text-inkSoft">
                O cuidado nao termina quando o treino acaba. A glicose pode continuar variando por
                horas, e observar esse padrao ajuda a planejar alimentacao, descanso e proximas
                atividades com mais seguranca.
              </p>

              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-blue">01</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Recuperacao
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Logo apos o exercicio
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {afterExerciseItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-blue" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-12 rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-greenDeep">02</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Atencao
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Fique atento
                    </h2>
                  </div>
                </div>
                <p className="mb-5 text-[1rem] leading-[1.6] text-inkSoft">
                  O exercicio pode provocar:
                </p>
                <ul className="grid gap-3.5">
                  {attentionItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[5px] shrink-0 rounded-sm bg-green/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-greenDeep">
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
                      Sinais
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Sinais de alerta
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5 sm:grid-cols-2">
                  {alertItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[6px] h-2 w-2 shrink-0 rounded-full bg-tomato" />
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-lg border border-line bg-card p-[clamp(26px,4vw,42px)] shadow-editorial">
                <div className="mb-6 flex items-center gap-4">
                  <span className="font-serif text-[3rem] leading-none text-greenDeep">04</span>
                  <div>
                    <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                      Rotina
                    </span>
                    <h2 className="mt-0.5 font-serif text-[1.65rem] font-medium leading-tight tracking-normal text-ink">
                      Para uma recuperacao segura
                    </h2>
                  </div>
                </div>
                <ul className="grid gap-3.5">
                  {recoveryItems.map((item) => (
                    <li key={item} className="flex items-start gap-3.5">
                      <span className="mt-[5px] shrink-0 rounded-sm bg-blue/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-blue">
                        OK
                      </span>
                      <span className="text-[1rem] leading-[1.6] text-inkSoft">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-8 text-[13px] leading-relaxed text-muted">
                Este guia tem carater educativo e nao substitui a orientacao do seu medico ou equipe
                de saude. Procure orientacao individual antes de mudar treino, alimentacao ou
                medicacao.
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
