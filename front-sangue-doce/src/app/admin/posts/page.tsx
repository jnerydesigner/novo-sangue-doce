import Link from "next/link";
import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { PostsTable } from "./posts-table";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const { accessToken, profile } = await requireAdmin();
  const posts = await api.posts.adminList({
    accessToken,
    limit: 50,
  });

  return (
    <AdminShell
      active="posts"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="max-w-[64ch] text-[1.02rem] leading-relaxed text-inkSoft">
            Acompanhe o que esta publicado, revise rascunhos e tire materias do ar sem sair do
            painel.
          </p>
          <Link
            className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
            href="/admin/posts/novo"
          >
            Nova materia
          </Link>
        </div>

        <PostsTable posts={posts.data} />
      </section>
    </AdminShell>
  );
}
