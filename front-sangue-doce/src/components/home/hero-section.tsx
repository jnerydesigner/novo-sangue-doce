"use client";

import Image from "next/image";
import { scrollToId } from "./utils";

export function HeroSection() {
  return (
    <section id="top" className="relative isolate flex min-h-[94vh] items-end overflow-hidden">
      <Image
        src="/images/saudavel.png"
        alt="Alimentos saudaveis sobre fundo claro para cuidado diario com diabetes"
        width={1920}
        height={1280}
        className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover object-center"
        fetchPriority="high"
        loading="eager"
        sizes="100vw"
        title="Alimentos saudaveis para cuidado diario com diabetes"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(10,24,36,.92)_0%,rgba(26,56,104,.48)_46%,rgba(26,56,104,.22)_100%),linear-gradient(105deg,rgba(10,24,36,.82)_0%,rgba(26,56,104,.38)_58%,rgba(24,192,228,.16)_100%)]" />

      <div className="wrap w-full pb-16 pt-[150px]">
        <div className="max-w-[760px]">
          <span className="eyebrow text-white/90 before:bg-spark">Saude metabolica, todo dia</span>
          <h1 className="mt-5 text-balance font-serif text-[clamp(2.6rem,6.2vw,5rem)] font-normal leading-[1.02] tracking-[-0.02em] text-white drop-shadow-2xl">
            Cuidado diario para viver <em className="italic text-energy">melhor</em> com diabetes
          </h1>
          <p className="mt-6 max-w-[620px] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-[1.55] text-white/90 drop-shadow">
            Noticias, guias e conversas praticas sobre glicemia, alimentacao, sono, exercicios e
            saude metabolica.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <button
              className="btn btn-primary px-6 py-4 text-base"
              onClick={() => scrollToId("materias")}
              type="button"
            >
              Ler destaques
            </button>
            <a className="btn btn-ghost px-6 py-4 text-base" href="#guias">
              Ver guias rapidos
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-[clamp(20px,5vw,64px)] z-10 hidden items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/80 sm:inline-flex">
        <span className="relative h-10 w-px overflow-hidden bg-current/50 after:absolute after:left-0 after:top-[-50%] after:h-1/2 after:w-full after:animate-[drip_2.2s_ease-in-out_infinite] after:bg-white" />
        Role para ler
      </div>
      <div className="absolute bottom-8 right-[clamp(20px,5vw,64px)] z-10 hidden border-l border-white/30 pl-5 text-right text-[12.5px] font-semibold uppercase leading-normal tracking-[0.14em] text-white/70 md:block">
        Em destaque
        <br />
        Ultimas materias
      </div>
    </section>
  );
}
