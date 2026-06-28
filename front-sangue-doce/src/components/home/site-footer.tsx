import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="bg-[#1a1611] py-[clamp(56px,7vw,84px)] pb-8 text-paper/80">
      <div className="wrap">
        <div className="grid gap-10 border-b border-paper/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="md:col-span-2 lg:col-span-1">
            <Brand dark />
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-paper/60">
              Jornalismo e cuidado sobre diabetes, prevencao e saude metabolica, feito para o dia a
              dia de quem vive com a condicao.
            </p>
          </div>
          <FooterColumn
            title="Editorias"
            links={["Cuidado diario", "Alimentacao", "Prevencao", "Exercicio"]}
          />
          <FooterColumn title="Secoes" links={["Materias", "Guias", "Rotina", "Boletim"]} />
          <FooterColumn
            title="Sobre"
            links={["Quem somos", "Conselho editorial", "Contato", "Privacidade"]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 pt-6">
          <p className="m-0 text-[13.5px] text-paper/50">
            © 2026 Sangue Doce, uma criacao da Seligadev Tech. Todos os direitos reservados.
          </p>
          <div className="flex gap-2.5">
            {["Instagram", "YouTube", "Newsletter"].map((item) => (
              <a
                key={item}
                href="#news"
                aria-label={item}
                className="grid h-[38px] w-[38px] place-items-center rounded-full border border-paper/20 text-paper/75 transition hover:-translate-y-0.5 hover:border-[#f5e7c8] hover:bg-[#f5e7c8] hover:text-[#1a1611]"
              >
                <span className="h-2 w-2 rounded-full bg-current" />
              </a>
            ))}
          </div>
        </div>
        <p className="mt-5 max-w-[78ch] text-[12.5px] leading-relaxed text-paper/40">
          As informacoes publicadas tem carater jornalistico e educativo e nao substituem avaliacao,
          diagnostico ou tratamento por profissional de saude. Em caso de duvidas sobre sua
          condicao, consulte sempre seu medico.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: string[] }) {
  return (
    <div>
      <h4 className="mb-4 mt-1 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-paper/55">
        {title}
      </h4>
      <ul className="grid gap-2.5">
        {links.map((link) => (
          <li key={link}>
            <a
              className="text-[15px] text-paper/80 transition hover:pl-1 hover:text-[#f5e7c8]"
              href="#materias"
            >
              {link}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
