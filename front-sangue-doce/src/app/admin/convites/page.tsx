import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";
import { AdminShell } from "../admin-shell";
import { InviteList } from "../usuarios/users-list";

export const dynamic = "force-dynamic";

export default async function AdminInvitesPage() {
  const { accessToken, profile } = await requireAdmin();
  const invites = await api.invites.list({ accessToken });
  return <AdminShell active="invites" userAvatarUrl={profile.avatarUrl} userName={profile.name} userRole={profile.role}><InviteList invites={invites} /></AdminShell>;
}
