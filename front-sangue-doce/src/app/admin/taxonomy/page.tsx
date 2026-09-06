import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { TaxonomyManager } from "./taxonomy-manager";

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
      <TaxonomyManager categories={categories} tags={tags} />
    </AdminShell>
  );
}
