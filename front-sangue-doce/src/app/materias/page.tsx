import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/home/article-card";
import { PublicSiteHeader } from "@/components/home/public-site-header";
import { SiteFooter } from "@/components/home/site-footer";
import { api } from "@/lib/api";
import { mapPostToArticle } from "@/lib/posts";
import { SITE_NAME, SITE_URL } from "@/lib/seo";

const MATERIASPAGE_DESCRIPTION =
  "Leituras sobre glicemia, alimentação, sensores, consultas e cuidado diário com diabetes.";

export async function generateMetadata({ searchParams }: MateriasPageProps): Promise<Metadata> {
  const params = await searchParams;
  const page = parsePage(params?.pagina);
  const isPaginated = page > 1;
  const canonicalUrl = isPaginated ? `${SITE_URL}/materias?pagina=${page}` : `${SITE_URL}/materias`;

  return {
    title: isPaginated ? `Matérias — Página ${page}` : "Matérias",
    description: MATERIASPAGE_DESCRIPTION,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Matérias | ${SITE_NAME}`,
      description: MATERIASPAGE_DESCRIPTION,
      url: canonicalUrl,
      type: "website",
    },
    ...(isPaginated && { robots: { index: false, follow: true } }),
  };
}

const ARTICLES_PER_PAGE = 6;

type MateriasPageProps = {
  searchParams?: Promise<{
    pagina?: string;
  }>;
};

function parsePage(value?: string) {
  const page = Number(value);

  if (!Number.isInteger(page) || page < 1) {
    return 1;
  }

  return page;
}

function getPageHref(page: number) {
  return page === 1 ? "/materias" : `/materias?pagina=${page}`;
}

export default async function MateriasPage({ searchParams }: MateriasPageProps) {
  const params = await searchParams;
  const requestedPage = parsePage(params?.pagina);
  const postsPage = await api.posts.list({ page: requestedPage, limit: ARTICLES_PER_PAGE });
  const totalPages = postsPage.meta.totalPages;
  const currentPage = postsPage.meta.page;
  const pageStart = (currentPage - 1) * ARTICLES_PER_PAGE;
  const visibleArticles = postsPage.data.map(mapPostToArticle);

  return (
    <>
      <PublicSiteHeader />

      <main>
        <section className="border-b border-line bg-subtle py-[clamp(72px,10vw,128px)]">
          <div className="wrap grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
            <div>
              <span className="eyebrow">Materias</span>
              <h1 className="mt-4 max-w-[13ch] text-balance font-serif text-[clamp(2.7rem,6vw,5rem)] font-medium leading-[1.02] tracking-normal text-ink">
                Leituras para cuidar melhor da rotina
              </h1>
            </div>
            <div className="max-w-[34rem] lg:justify-self-end">
              <p className="text-[1.05rem] leading-[1.65] text-inkSoft">
                Conteudos editoriais sobre glicemia, alimentacao, sensores, consultas e pequenas
                decisoes que ajudam a tornar o cuidado mais claro no dia a dia.
              </p>
              <div className="mt-6 grid grid-cols-3 divide-x divide-line overflow-hidden rounded-lg border border-line bg-surface">
                <div className="flex min-h-[86px] flex-col items-center justify-center px-4 py-3 text-center">
                  <span className="block text-[11.5px] font-semibold uppercase tracking-[0.13em] text-muted">
                    Total
                  </span>
                  <strong className="mt-1 block font-serif text-[2rem] font-normal leading-none text-ink tabular-nums">
                    {postsPage.meta.total}
                  </strong>
                </div>
                <div className="flex min-h-[86px] flex-col items-center justify-center px-4 py-3 text-center">
                  <span className="block text-[11.5px] font-semibold uppercase tracking-[0.13em] text-muted">
                    Pagina
                  </span>
                  <strong className="mt-1 block font-serif text-[2rem] font-normal leading-none text-ink tabular-nums">
                    {currentPage}
                  </strong>
                </div>
                <div className="flex min-h-[86px] flex-col items-center justify-center px-4 py-3 text-center">
                  <span className="block text-[11.5px] font-semibold uppercase tracking-[0.13em] text-muted">
                    Serie
                  </span>
                  <strong className="mt-1 block font-serif text-[2rem] font-normal leading-none text-ink tabular-nums">
                    {totalPages}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-bg py-[clamp(56px,8vw,96px)]">
          <div className="wrap">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Listagem
                </span>
                <h2 className="mt-2 font-serif text-[clamp(1.8rem,3vw,2.45rem)] font-medium leading-[1.05] tracking-normal text-ink">
                  Todas as materias
                </h2>
              </div>
              <p className="text-sm font-medium text-muted">
                Mostrando {pageStart + 1}-{pageStart + visibleArticles.length} de{" "}
                {postsPage.meta.total}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleArticles.map((article, index) => (
                <ArticleCard article={article} key={article.title} seq={pageStart + index + 1} />
              ))}
            </div>

            <nav
              className="mt-12 flex flex-wrap items-center justify-center gap-3"
              aria-label="Paginacao de materias"
            >
              <Link
                aria-disabled={currentPage === 1}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  currentPage === 1
                    ? "pointer-events-none border-line text-muted"
                    : "border-lineStrong text-navy hover:-translate-y-px hover:bg-subtle"
                }`}
                href={getPageHref(Math.max(1, currentPage - 1))}
              >
                Anterior
              </Link>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                const isCurrent = page === currentPage;

                return (
                  <Link
                    aria-current={isCurrent ? "page" : undefined}
                    className={`grid h-11 w-11 place-items-center rounded-lg border text-sm font-bold transition ${
                      isCurrent
                        ? "border-azure bg-azure text-white"
                        : "border-lineStrong text-navy hover:-translate-y-px hover:bg-subtle"
                    }`}
                    href={getPageHref(page)}
                    key={page}
                  >
                    {page}
                  </Link>
                );
              })}

              <Link
                aria-disabled={currentPage === totalPages}
                className={`rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
                  currentPage === totalPages
                    ? "pointer-events-none border-line text-muted"
                    : "border-lineStrong text-navy hover:-translate-y-px hover:bg-subtle"
                }`}
                href={getPageHref(Math.min(totalPages, currentPage + 1))}
              >
                Proxima
              </Link>
            </nav>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
