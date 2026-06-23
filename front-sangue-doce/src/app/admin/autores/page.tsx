import Image from "next/image";
import { AdminShell } from "../admin-shell";
import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const { profile } = await requireAdmin();
  const authors = await api.authors.list();

  return (
    <AdminShell active="authors" userName={profile.name} userRole={profile.role}>
      <section>
        <div className="grid gap-5 md:grid-cols-2">
          {authors.map((author) => (
            <article className="rounded-lg border border-line bg-card p-5" key={author.id}>
              <div className="flex items-start gap-4">
                {author.avatarUrl ? (
                  <Image
                    alt={author.name}
                    className="size-14 rounded-full border border-line object-cover"
                    height={56}
                    loading="lazy"
                    src={author.avatarUrl}
                    title={author.name}
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
    </AdminShell>
  );
}
