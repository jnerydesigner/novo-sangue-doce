import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { requireAdmin } from "../../_lib/require-admin";
import { AdminShell } from "../../admin-shell";
import { NewPostForm } from "./new-post-form";

export const dynamic = "force-dynamic";

type NewAdminPostPageProps = {
  searchParams: Promise<{
    id?: string;
  }>;
};

export default async function NewAdminPostPage({ searchParams }: NewAdminPostPageProps) {
  const { accessToken, profile } = await requireAdmin();
  const { id } = await searchParams;
  const [authors, categories, tags] = await Promise.all([
    api.authors.list({ accessToken }),
    api.posts.categories(),
    api.posts.tags(),
  ]);
  const post = id ? await api.posts.get(id, { accessToken }).catch(() => null) : null;

  if (post?.status === "PUBLISHED") {
    const draft = await api.posts.createDraft(post.id, { accessToken });
    redirect(`/admin/posts/novo?id=${draft.id}`);
  }

  return (
    <AdminShell
      active="posts"
      subtitle="Criacao e organizacao de conteudo editorial."
      title={post ? "Editar materia" : "Nova materia"}
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section>
        <NewPostForm authors={authors} categories={categories} initialPost={post} tags={tags} />
      </section>
    </AdminShell>
  );
}
