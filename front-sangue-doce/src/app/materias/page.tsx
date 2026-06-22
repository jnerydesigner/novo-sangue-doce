import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/home/article-card";
import { Brand } from "@/components/home/brand";
import { SiteFooter } from "@/components/home/site-footer";
import { api } from "@/lib/api";
import { mapPostToArticle } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Materias | Sangue Doce",
  description:
    "Lista de materias do Sangue Doce sobre glicemia, alimentacao, rotina, sensores e cuidado diario.",
};

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
      <header className="sticky top-0 z-[100] border-b border-line bg-paper/85 shadow-sm backdrop-blur-xl">
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <nav className="flex items-center gap-5" aria-label="Materias">
            <Link
              href="/"
              className="text-[14px] font-semibold text-inkSoft transition hover:text-ink"
            >
              Inicio
            </Link>
            <Link
              href="/#guias"
              className="hidden rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 sm:inline-flex"
            >
              Guias
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="border-b border-line bg-paper2 py-[clamp(72px,10vw,128px)]">
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
              <div className="mt-6 grid grid-cols-3 divide-x divide-line rounded-lg border border-line bg-card">
                <div className="px-4 py-4">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Total
                  </span>
                  <strong className="font-serif text-[2rem] font-medium leading-none text-ink">
                    {postsPage.meta.total}
                  </strong>
                </div>
                <div className="px-4 py-4">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Pagina
                  </span>
                  <strong className="font-serif text-[2rem] font-medium leading-none text-ink">
                    {currentPage}
                  </strong>
                </div>
                <div className="px-4 py-4">
                  <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                    Serie
                  </span>
                  <strong className="font-serif text-[2rem] font-medium leading-none text-ink">
                    {totalPages}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-paper py-[clamp(56px,8vw,96px)]">
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
                    : "border-lineStrong text-greenDeep hover:-translate-y-px hover:bg-paper2"
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
                        ? "border-green bg-green text-white"
                        : "border-lineStrong text-greenDeep hover:-translate-y-px hover:bg-paper2"
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
                    : "border-lineStrong text-greenDeep hover:-translate-y-px hover:bg-paper2"
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
