import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { SocialPublicationCards } from "./social-publication-cards";

export const dynamic = "force-dynamic";

export default async function SocialPublicationsPage() {
  const { accessToken, profile } = await requireAdmin();
  const publications = await api.socialPublications.list({ accessToken, limit: 24 });

  return (
    <AdminShell
      active="social-publications"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-5">
        <div className="grid gap-3 sm:flex sm:items-end sm:justify-between">
          <p className="max-w-[65ch] text-[1.02rem] leading-relaxed text-inkSoft">
            Veja o andamento das geracoes, revise o resultado e retome rapidamente as que precisam
            de uma nova tentativa.
          </p>
          <span className="text-sm font-semibold text-muted sm:text-right">
            {publications.meta.total} {publications.meta.total === 1 ? "publicacao" : "publicacoes"}
          </span>
        </div>

        <SocialPublicationCards initialData={publications} />
      </section>
    </AdminShell>
  );
}
