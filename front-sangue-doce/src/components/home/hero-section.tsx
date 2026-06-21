"use client";

import Image from "next/image";
import { scrollToId } from "./utils";

export function HeroSection() {
  return (
    <section id="top" className="relative isolate flex min-h-[94vh] items-end overflow-hidden">
      <Image
        src="/images/saudavel.png"
        alt="Alimentos saudaveis sobre fundo claro para cuidado diario com diabetes"
        fill
        priority
        className="-z-20 scale-105 object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_top,rgba(20,16,12,.86)_0%,rgba(20,16,12,.34)_42%,rgba(20,16,12,.22)_100%),linear-gradient(105deg,rgba(20,16,12,.70)_0%,rgba(20,16,12,.26)_58%,rgba(20,16,12,.10)_100%)]" />

      <div className="wrap w-full pb-16 pt-[150px]">
        <div className="max-w-[760px]">
          <span className="eyebrow text-paper/90 before:bg-tomato">Saude metabolica, todo dia</span>
          <h1 className="mt-5 text-balance font-serif text-[clamp(2.6rem,6.2vw,5rem)] font-medium leading-[1.02] tracking-normal text-paper drop-shadow-2xl">
            Cuidado diario para viver <em className="italic text-[#f5e7c8]">melhor</em> com diabetes
          </h1>
          <p className="mt-6 max-w-[620px] text-[clamp(1.05rem,1.7vw,1.3rem)] leading-[1.55] text-paper/90 drop-shadow">
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

      <div className="absolute bottom-6 left-[clamp(20px,5vw,64px)] z-10 hidden items-center gap-3 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-paper/80 sm:inline-flex">
        <span className="relative h-10 w-px overflow-hidden bg-current/50 after:absolute after:left-0 after:top-[-50%] after:h-1/2 after:w-full after:animate-[drip_2.2s_ease-in-out_infinite] after:bg-paper" />
        Role para ler
      </div>
      <div className="absolute bottom-8 right-[clamp(20px,5vw,64px)] z-10 hidden border-l border-paper/30 pl-5 text-right text-[12.5px] font-semibold uppercase leading-normal tracking-[0.14em] text-paper/70 md:block">
        Em destaque
        <br />
        Ultimas materias
      </div>
    </section>
  );
}
