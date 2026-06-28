import Image from "next/image";
import { api } from "@/lib/api";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { AuthorCreateForm } from "./author-create-form";

export const dynamic = "force-dynamic";

export default async function AdminAuthorsPage() {
  const { accessToken, profile } = await requireAdmin();
  const [authors, users] = await Promise.all([api.authors.list(), api.users.list({ accessToken })]);
  const authorUserIds = new Set(authors.map((author) => author.userId));
  const availableUsers = users.filter((user) => !authorUserIds.has(user.id));

  return (
    <AdminShell
      active="authors"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section>
        <AuthorCreateForm users={availableUsers} />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {authors.map((author) => (
            <article className="rounded-lg border border-line bg-card p-5" key={author.id}>
              <div className="flex items-start gap-4">
                {resolvePublicImageUrl(author.avatarUrl) ? (
                  <Image
                    alt={author.name}
                    className="size-14 rounded-full border border-line object-cover"
                    height={56}
                    loading="lazy"
                    src={resolvePublicImageUrl(author.avatarUrl)}
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
