import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { TaxonomyForm } from "./taxonomy-form";

export const dynamic = "force-dynamic";

export default async function AdminTaxonomyPage() {
  const { profile } = await requireAdmin();
  const [categories, tags] = await Promise.all([api.posts.categories(), api.posts.tags()]);

  return (
    <AdminShell
      active="taxonomy"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-5 xl:grid-cols-2">
        <TaxonomyForm type="category" />
        <TaxonomyForm type="tag" />
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">Categorias</h2>
          <div className="mt-4 grid gap-2">
            {categories.map((category) => (
              <div
                className="flex items-center justify-between gap-3 rounded-lg border border-line bg-paper px-4 py-3 text-sm"
                key={category.id}
              >
                <div>
                  <p className="font-semibold text-ink">{category.name}</p>
                  <p className="text-muted">{category.slug}</p>
                </div>
                <span className="rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">
                  {category.color}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-line bg-card p-5">
          <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">Tags</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                className="rounded-full border border-lineStrong bg-paper px-3 py-1 text-sm font-semibold text-inkSoft"
                key={tag.id}
              >
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </section>
    </AdminShell>
  );
}
