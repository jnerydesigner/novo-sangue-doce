import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const CONTACT_EMAIL = "contato@sanguedoce.com.br";
const DESCRIPTION =
  "Instruções para solicitar a exclusão de conta e dados pessoais no Sangue Doce.";

export const metadata: Metadata = {
  title: "Exclusão de Dados",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/exclusao-de-dados`,
  },
  openGraph: {
    title: `Exclusão de Dados | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/exclusao-de-dados`,
    type: "website",
  },
};

export default function ExclusaoDeDadosPage() {
  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap">
            <span className="eyebrow">Dados pessoais</span>
            <h1 className="mt-4 max-w-[22ch] text-balance font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] tracking-normal text-ink">
              Exclusão de Dados do Usuário
            </h1>
            <p className="mt-4 text-[15px] text-muted">Última atualização: julho de 2026.</p>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap max-w-[68ch] text-[1.05rem] leading-[1.7] text-inkSoft">
            <p>
              Esta página explica como solicitar a exclusão da sua conta e dos dados pessoais
              associados ao {SITE_NAME}, plataforma mantida pela Seligadev Tech.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              Como solicitar a exclusão
            </h2>
            <p className="mt-4">
              Envie um e-mail para{" "}
              <a className="underline hover:text-navy" href={`mailto:${CONTACT_EMAIL}`}>
                {CONTACT_EMAIL}
              </a>{" "}
              com o assunto <b className="text-ink">Exclusão de dados</b>. No corpo da mensagem,
              informe o e-mail usado na sua conta do {SITE_NAME} e declare que deseja excluir sua
              conta e seus dados pessoais.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              O que será excluído
            </h2>
            <ul className="mt-4 grid gap-3">
              <li>Dados de cadastro, como nome e e-mail.</li>
              <li>Registros de saúde inseridos voluntariamente no painel, quando houver.</li>
              <li>Informações associadas à sua conta de usuário.</li>
            </ul>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              Prazo de atendimento
            </h2>
            <p className="mt-4">
              Após recebermos a solicitação, poderemos pedir informações adicionais para confirmar a
              titularidade da conta. Concluída a verificação, a exclusão será processada em prazo
              razoável, respeitando obrigações legais, regulatórias ou de segurança que possam exigir
              retenção temporária de determinados registros.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              Login por terceiros
            </h2>
            <p className="mt-4">
              Se você acessou o {SITE_NAME} usando uma conta de terceiros, como serviços de login
              social, a exclusão no Sangue Doce remove os dados mantidos por nós. Para remover dados
              mantidos pelo próprio provedor de login, consulte também as configurações e políticas
              desse provedor.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              Dúvidas sobre privacidade
            </h2>
            <p className="mt-4">
              Para mais detalhes sobre coleta, uso, retenção e direitos dos titulares, consulte a{" "}
              <a className="underline hover:text-navy" href="/privacidade">
                Política de Privacidade
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
