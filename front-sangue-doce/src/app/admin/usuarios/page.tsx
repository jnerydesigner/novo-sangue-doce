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
      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-inkSoft">{users.length} contas cadastradas</p>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-lg border border-line bg-card">
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
