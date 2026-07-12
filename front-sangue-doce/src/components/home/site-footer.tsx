import Link from "next/link";
import { Brand } from "./brand";

export function SiteFooter() {
  return (
    <footer className="bg-[#0A1824] py-[clamp(56px,7vw,84px)] pb-8 text-white/80">
      <div className="wrap">
        <div className="grid gap-10 border-b border-white/10 pb-12 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)]">
          <div className="md:col-span-2 lg:col-span-1">
            <Brand dark />
            <p className="mt-4 max-w-[34ch] text-[15px] leading-relaxed text-white/60">
              Jornalismo e cuidado sobre diabetes, prevencao e saude metabolica, feito para o dia a
              dia de quem vive com a condicao.
            </p>
          </div>
          <FooterColumn
            title="Editorias"
            links={[
              { label: "Cuidado diario", href: "/materias" },
              { label: "Alimentacao", href: "/materias" },
              { label: "Prevencao", href: "/materias" },
              { label: "Exercicio", href: "/materias" },
            ]}
          />
          <FooterColumn
            title="Secoes"
            links={[
              { label: "Materias", href: "/materias" },
              { label: "Receitas", href: "/receitas" },
              { label: "Guias", href: "/#guias" },
              { label: "Rotina", href: "/#rotina" },
              { label: "Boletim", href: "/#news" },
            ]}
          />
          <FooterColumn
            title="Sobre"
            links={[
              { label: "Quem somos", href: "/sobre" },
              // { label: "Conselho editorial", href: "/sobre" },
              { label: "Contato", href: "/contato" },
              { label: "Privacidade", href: "/privacidade" },
            ]}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-5 pt-6">
          <p className="m-0 text-[13.5px] text-white/50">
            © 2026 Sangue Doce, uma criacao da Seligadev Tech. Todos os direitos reservados.
          </p>
          <div className="flex gap-2.5">
            <Link
              href="/#news"
              className="grid h-[38px] w-[38px] place-items-center rounded-full border border-white/20 text-white/75 transition hover:-translate-y-0.5 hover:border-spark hover:bg-spark hover:text-[#0A1824]"
            >
              <span className="sr-only">Newsletter</span>
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-current" />
            </Link>
          </div>
        </div>
        <p className="mt-5 max-w-[78ch] text-[12.5px] leading-relaxed text-white/40">
          As informacoes publicadas tem carater jornalistico e educativo e nao substituem avaliacao,
          diagnostico ou tratamento por profissional de saude. Em caso de duvidas sobre sua
          condicao, consulte sempre seu medico.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <h4 className="mb-4 mt-1 text-[12.5px] font-semibold uppercase tracking-[0.14em] text-white/55">
        {title}
      </h4>
      <ul className="grid gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <Link
              className="text-[15px] text-white/80 transition hover:pl-1 hover:text-spark"
              href={link.href}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
