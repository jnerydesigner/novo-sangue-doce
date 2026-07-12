import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const CONTACT_EMAIL = "contato@sanguedoce.com.br";
const DESCRIPTION =
  "Como o Sangue Doce coleta, usa e protege seus dados pessoais, incluindo os registros de saúde inseridos no painel.";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/privacidade`,
  },
  openGraph: {
    title: `Política de Privacidade | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/privacidade`,
    type: "website",
  },
};

export default function PrivacidadePage() {
  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap">
            <span className="eyebrow">Privacidade</span>
            <h1 className="mt-4 max-w-[22ch] text-balance font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] tracking-normal text-ink">
              Política de Privacidade
            </h1>
            <p className="mt-4 text-[15px] text-muted">Última atualização: julho de 2026.</p>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap max-w-[68ch] text-[1.05rem] leading-[1.7] text-inkSoft">
            <p>
              Esta política explica como o {SITE_NAME}, plataforma mantida pela Seligadev Tech
              (&quot;controladora&quot;), coleta, usa e protege dados pessoais de quem acessa o site
              e usa o painel de acompanhamento, em conformidade com a Lei Geral de Proteção de Dados
              (Lei nº 13.709/2018).
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              1. Quais dados coletamos
            </h2>
            <ul className="mt-4 grid gap-3">
              <li>
                <b className="text-ink">Dados de cadastro:</b> nome e e-mail, usados para criar e
                autenticar sua conta.
              </li>
              <li>
                <b className="text-ink">Dados de saúde inseridos por você:</b> registros de
                glicemia, refeições e sono lançados voluntariamente no painel, usados para gerar seu
                acompanhamento e histórico pessoal.
              </li>
              <li>
                <b className="text-ink">Dados de navegação essenciais:</b> um cookie de sessão usado
                exclusivamente para manter você autenticado.
              </li>
            </ul>
            <p className="mt-4 text-[15px] text-muted">
              Não utilizamos cookies de publicidade ou de rastreamento de terceiros neste site.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              2. Para que usamos seus dados
            </h2>
            <p className="mt-4">
              Usamos esses dados para viabilizar o funcionamento do painel de acompanhamento,
              autenticar seu acesso e, quando aplicável, enviar o boletim para quem se inscreveu
              voluntariamente. Não vendemos nem compartilhamos seus dados de saúde com terceiros
              para fins comerciais.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              3. Seus direitos
            </h2>
            <p className="mt-4">
              Você pode solicitar a qualquer momento a confirmação, correção, exclusão ou exportação
              dos seus dados pessoais, além de revogar consentimentos dados anteriormente. Para
              exercer esses direitos, envie um e-mail para{" "}
              <a className="underline hover:text-navy" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>
              .
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              4. Retenção e segurança
            </h2>
            <p className="mt-4">
              Seus dados são mantidos enquanto sua conta estiver ativa ou pelo tempo necessário para
              cumprir obrigações legais. Adotamos medidas técnicas razoáveis para proteger essas
              informações contra acesso não autorizado.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              5. Contato
            </h2>
            <p className="mt-4">
              Dúvidas sobre esta política podem ser enviadas para{" "}
              <a className="underline hover:text-navy" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
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
