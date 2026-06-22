import Image from "next/image";
import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  await requireAdmin();
  const authors = await api.authors.list();

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="wrap py-[clamp(40px,7vw,78px)]">
        <span className="eyebrow">Admin</span>
        <h1 className="mt-4 font-serif text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-[1.04] tracking-normal">
          Autores
        </h1>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {authors.map((author) => (
            <article className="rounded-lg border border-line bg-card p-5" key={author.id}>
              <div className="flex items-start gap-4">
                {author.avatarUrl ? (
                  <Image
                    alt={author.name}
                    className="size-14 rounded-full border border-line object-cover"
                    height={56}
                    src={author.avatarUrl}
                    width={56}
                  />
                ) : (
                  <div className="grid size-14 place-items-center rounded-full border border-line bg-paper2 font-bold text-greenDeep">
                    {author.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h2 className="font-serif text-2xl font-medium tracking-normal">{author.name}</h2>
                  <p className="mt-1 text-sm font-semibold text-greenDeep">{author.role}</p>
                </div>
              </div>
              {author.bio ? (
                <p className="mt-4 text-[15px] leading-relaxed text-inkSoft">{author.bio}</p>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
