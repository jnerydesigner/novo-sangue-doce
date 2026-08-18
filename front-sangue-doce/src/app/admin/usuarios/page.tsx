import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { UsersList } from "./users-list";

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
        <UsersList initialUsers={users} />
      </section>
    </AdminShell>
  );
}
