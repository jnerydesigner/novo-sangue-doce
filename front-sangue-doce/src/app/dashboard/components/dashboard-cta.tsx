export function DashboardCta() {
  return (
    <section className="relative overflow-hidden rounded-lg bg-greenDeep p-[clamp(24px,4vw,36px)] text-paper">
      <div className="relative z-10 max-w-[620px]">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-paper/70">
          Continuar evoluindo
        </span>
        <h2 className="mt-3 max-w-[22ch] font-serif text-[clamp(1.7rem,3vw,2.4rem)] font-medium leading-[1.05] tracking-normal">
          Diario conectado aos seus dados reais
        </h2>
        <p className="mt-4 max-w-[58ch] text-paper/80">
          As leituras agora entram no seu historico, respeitam a sessao ativa e alimentam o
          relatorio mensal automaticamente.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="border-l border-paper/35 pl-3">
            <strong className="block font-serif text-[1.45rem] font-medium leading-none">
              14d
            </strong>
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-paper/65">
              Historico
            </span>
          </div>
          <div className="border-l border-paper/35 pl-3">
            <strong className="block font-serif text-[1.45rem] font-medium leading-none">
              JWT
            </strong>
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-paper/65">
              Sessao
            </span>
          </div>
          <div className="border-l border-paper/35 pl-3">
            <strong className="block font-serif text-[1.45rem] font-medium leading-none">1x</strong>
            <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-paper/65">
              Relatorio
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
