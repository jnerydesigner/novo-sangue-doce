import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { accessToken, profile } = await requireAdmin();
  const users = await api.users.list({ accessToken });

  return (
    <AdminShell
      active="users"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-5">
        <div className="grid gap-1 sm:flex sm:items-end sm:justify-between">
          <p className="text-inkSoft">{users.length} contas cadastradas</p>
        </div>

        <div className="grid gap-3 lg:hidden">
          {users.map((user) => (
            <article className="rounded-lg border border-line bg-card p-4" key={user.id}>
              <div className="grid gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-base font-bold leading-snug text-ink">
                    {user.name}
                  </h2>
                  <p className="mt-1 break-all text-sm leading-relaxed text-inkSoft">
                    {user.email}
                  </p>
                </div>
                <div>
                  <span className="inline-flex w-fit rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">
                    {user.role}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="hidden overflow-hidden rounded-lg border border-line bg-card lg:block">
          <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr] border-b border-line bg-paper2 px-5 py-3 text-sm font-bold text-inkSoft">
            <span>Nome</span>
            <span>E-mail</span>
            <span>Role</span>
          </div>
          {users.map((user) => (
            <div
              className="grid grid-cols-[1.2fr_1.4fr_0.8fr] items-center border-b border-line px-5 py-4 text-sm last:border-b-0"
              key={user.id}
            >
              <span className="font-semibold text-ink">{user.name}</span>
              <span className="break-all text-inkSoft">{user.email}</span>
              <span className="w-fit rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">
                {user.role}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
