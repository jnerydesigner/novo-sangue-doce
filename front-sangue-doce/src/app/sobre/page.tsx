import type { Metadata } from "next";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const DESCRIPTION =
  "Conheça o Sangue Doce: jornalismo e conteúdo educativo sobre diabetes, alimentação e saúde metabólica para o dia a dia.";

export const metadata: Metadata = {
  title: "Quem somos",
  description: DESCRIPTION,
  alternates: {
    canonical: `${SITE_URL}/sobre`,
  },
  openGraph: {
    title: `Quem somos | ${SITE_NAME}`,
    description: DESCRIPTION,
    url: `${SITE_URL}/sobre`,
    type: "website",
  },
};

export default function SobrePage() {
  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap">
            <span className="eyebrow">Quem somos</span>
            <h1 className="mt-4 max-w-[22ch] text-balance font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium leading-[1.05] tracking-normal text-ink">
              Cuidado diário com diabetes, contado de forma clara
            </h1>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,720px)_1fr]">
            <div className="max-w-[68ch] text-[1.08rem] leading-[1.7] text-inkSoft">
              <p>
                O Sangue Doce é um site de jornalismo e conteúdo educativo dedicado a quem vive com
                diabetes ou cuida de alguém com a condição. Publicamos matérias, guias práticos e
                ferramentas de acompanhamento sobre glicemia, alimentação, sono e exercício, com
                foco em decisões simples que ajudam na rotina.
              </p>
              <p className="mt-5">
                O projeto é uma criação da Seligadev Tech e reúne conteúdo assinado por jornalistas
                e colaboradores da área da saúde. Cada matéria publicada traz o nome e a função de
                quem escreveu, disponíveis no rodapé do próprio texto.
              </p>

              <h2 className="mt-10 font-serif text-2xl font-medium tracking-normal text-ink">
                Nosso compromisso editorial
              </h2>
              <p className="mt-4">
                Buscamos precisão e clareza acima de sensacionalismo. Sempre que possível, indicamos
                fontes e evitamos promessas de cura ou tratamento milagroso.
              </p>
              <p className="mt-4 text-[15px] text-muted">
                As informações publicadas têm caráter jornalístico e educativo e não substituem
                avaliação, diagnóstico ou tratamento por profissional de saúde. Em caso de dúvidas
                sobre sua condição, consulte sempre seu médico.
              </p>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
