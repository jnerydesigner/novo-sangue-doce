import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const CONTACT_EMAIL = "contato@sanguedoce.com.br";
const DESCRIPTION =
  "Termos de uso do Sangue Doce para acesso ao conteúdo editorial, cadastro e ferramentas de acompanhamento pessoal.";

export const metadata: Metadata = {
  title: "Termos de Serviço",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/termos-de-servico`,
  },
  openGraph: {
    title: `Termos de Serviço | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/termos-de-servico`,
    type: "website",
  },
};

export default function TermosDeServicoPage() {
  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap">
            <span className="eyebrow">Termos</span>
            <h1 className="mt-4 max-w-[22ch] text-balance font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] tracking-normal text-ink">
              Termos de Serviço
            </h1>
            <p className="mt-4 text-[15px] text-muted">Última atualização: julho de 2026.</p>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap max-w-[68ch] text-[1.05rem] leading-[1.7] text-inkSoft">
            <p>
              Estes termos regulam o acesso e uso do {SITE_NAME}, plataforma mantida pela
              Seligadev Tech. Ao acessar o site, criar uma conta ou usar as ferramentas disponíveis,
              você declara que leu, compreendeu e concorda com estas condições.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              1. Sobre o Sangue Doce
            </h2>
            <p className="mt-4">
              O {SITE_NAME} oferece conteúdo editorial, guias práticos, receitas e ferramentas de
              acompanhamento pessoal relacionadas a diabetes, alimentação, rotina e saúde
              metabólica. As informações publicadas têm caráter jornalístico e educativo.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              2. Uso das informações de saúde
            </h2>
            <p className="mt-4">
              O conteúdo do {SITE_NAME} não substitui avaliação, diagnóstico, prescrição ou
              acompanhamento por profissional de saúde. Antes de tomar decisões sobre tratamento,
              medicação, dieta, atividade física ou qualquer conduta clínica, consulte um
              profissional habilitado.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              3. Cadastro e conta
            </h2>
            <p className="mt-4">
              Para usar determinadas funcionalidades, você pode precisar informar dados como nome e
              e-mail. Você é responsável por manter as informações da sua conta corretas e por usar
              a plataforma de forma compatível com a lei e com estes termos.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              4. Condutas não permitidas
            </h2>
            <ul className="mt-4 grid gap-3">
              <li>Usar a plataforma para fins ilegais, abusivos ou fraudulentos.</li>
              <li>Tentar acessar contas, áreas administrativas ou sistemas sem autorização.</li>
              <li>Copiar, republicar ou explorar comercialmente conteúdos sem autorização.</li>
              <li>Inserir dados falsos, ofensivos ou que violem direitos de terceiros.</li>
            </ul>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              5. Propriedade intelectual
            </h2>
            <p className="mt-4">
              Textos, marcas, identidade visual, interfaces, imagens e demais conteúdos do{" "}
              {SITE_NAME} são protegidos por direitos autorais e outros direitos de propriedade
              intelectual, salvo quando indicado de outra forma.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              6. Disponibilidade e alterações
            </h2>
            <p className="mt-4">
              Podemos atualizar, suspender ou encerrar funcionalidades da plataforma para manutenção,
              segurança, melhoria do serviço ou cumprimento de obrigações legais. Estes termos
              também podem ser atualizados periodicamente, com publicação da versão mais recente
              nesta página.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              7. Privacidade
            </h2>
            <p className="mt-4">
              O tratamento de dados pessoais é descrito em nossa{" "}
              <a className="underline hover:text-navy" href="/privacidade">
                Política de Privacidade
              </a>
              , incluindo informações sobre coleta, uso, retenção, segurança e direitos dos
              titulares.
            </p>

            <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
              8. Contato
            </h2>
            <p className="mt-4">
              Dúvidas sobre estes termos podem ser enviadas para{" "}
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
