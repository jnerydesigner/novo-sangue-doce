import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { ShortLinksManager } from "./short-links-manager";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  const { profile } = await requireAdmin();
  return (
    <AdminShell active="links" userAvatarUrl={profile.avatarUrl} userName={profile.name} userRole={profile.role}>
      <ShortLinksManager />
    </AdminShell>
  );
}
