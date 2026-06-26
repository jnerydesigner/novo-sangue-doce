import { AdminShell } from "../../admin-shell";
import { requireAdmin } from "../../_lib/require-admin";
import { DraftPreview } from "./draft-preview";
import { api } from "@/lib/api";

export const dynamic = "force-dynamic";

type AdminPostPreviewPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function AdminPostPreviewPage({
  searchParams,
}: AdminPostPreviewPageProps) {
  const { accessToken, profile } = await requireAdmin();
  const { id } = await searchParams;
  const post = id ? await api.posts.get(id, { accessToken }).catch(() => null) : null;

  return (
    <AdminShell
      active="posts"
      subtitle="Validacao visual antes da publicacao."
      title="Previa da materia"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <DraftPreview post={post} />
    </AdminShell>
  );
}
