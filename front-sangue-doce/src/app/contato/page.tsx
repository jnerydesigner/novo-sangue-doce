import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const CONTACT_EMAIL = "contato@sanguedoce.com.br";
const DESCRIPTION = "Fale com a equipe do Sangue Doce para dúvidas, sugestões de pauta ou parcerias.";

export const metadata: Metadata = {
  title: "Contato",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/contato`,
  },
  openGraph: {
    title: `Contato | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/contato`,
    type: "website",
  },
};

export default function ContatoPage() {
  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap">
            <span className="eyebrow">Contato</span>
            <h1 className="mt-4 max-w-[20ch] text-balance font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] tracking-normal text-ink">
              Fale com a gente
            </h1>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap max-w-[68ch] text-[1.08rem] leading-[1.7] text-inkSoft">
            <p>
              Dúvidas sobre uma matéria, sugestões de pauta, parcerias editoriais ou qualquer
              outro assunto: escreva para o e-mail abaixo.
            </p>
            <a
              className="mt-6 inline-block rounded-lg border border-lineStrong px-5 py-3 text-[15px] font-semibold text-navy transition hover:-translate-y-px hover:bg-subtle"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              {CONTACT_EMAIL}
            </a>
            <p className="mt-6 text-[15px] text-muted">
              Para solicitações relacionadas aos seus dados pessoais, veja também a nossa{" "}
              <a className="underline hover:text-inkSoft" href="/privacidade">
                política de privacidade
              </a>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
