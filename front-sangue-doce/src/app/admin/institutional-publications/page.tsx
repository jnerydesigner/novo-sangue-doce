import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { InstitutionalPublicationManager } from "./publication-manager";

export const dynamic = "force-dynamic";

export default async function InstitutionalPublicationsPage() {
  const { accessToken, profile } = await requireAdmin();
  const publications = await api.institutionalPublications.list({ accessToken, limit: 20 });

  return (
    <AdminShell
      active="institutional-publications"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <InstitutionalPublicationManager initialData={publications} />
    </AdminShell>
  );
}
