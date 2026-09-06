"use client";

import { useEffect, useState } from "react";
import type { PendingInvite, User } from "@/lib/api";
import { toast } from "sonner";
import { InviteUserButton } from "./invite-user-button";

export function UsersList({ initialUsers, initialInvites, showInvites = true }: { initialUsers: User[]; initialInvites: PendingInvite[]; showInvites?: boolean }) {
  const [users, setUsers] = useState(initialUsers);
  const [invites, setInvites] = useState(initialInvites);

  useEffect(() => {
    const refresh = async () => {
      const [usersResponse, invitesResponse] = await Promise.all([fetch("/api/admin/users", { cache: "no-store" }), fetch("/api/admin/invites", { cache: "no-store" })]);
      if (usersResponse.ok) setUsers((await usersResponse.json()) as User[]);
      if (invitesResponse.ok) setInvites((await invitesResponse.json()) as PendingInvite[]);
    };

    const interval = window.setInterval(() => void refresh(), 10_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <>
      <div className="grid gap-1 sm:flex sm:items-end sm:justify-between">
        <p className="text-inkSoft">{users.length} contas cadastradas</p>
        <InviteUserButton />
      </div>

      <div className="grid gap-3 lg:hidden">
        {users.map((user) => (
          <article className="rounded-lg border border-line bg-card p-4" key={user.id}>
            <h2 className="break-words text-base font-bold leading-snug text-ink">{user.name}</h2>
            <p className="mt-1 break-all text-sm leading-relaxed text-inkSoft">{user.email}</p>
            <span className="mt-3 inline-flex w-fit rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">{user.role}</span>
          </article>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-line bg-card lg:block">
        <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr] border-b border-line bg-paper2 px-5 py-3 text-sm font-bold text-inkSoft">
          <span>Nome</span><span>E-mail</span><span>Role</span>
        </div>
        {users.map((user) => (
          <div className="grid grid-cols-[1.2fr_1.4fr_0.8fr] items-center border-b border-line px-5 py-4 text-sm last:border-b-0" key={user.id}>
            <span className="font-semibold text-ink">{user.name}</span>
            <span className="break-all text-inkSoft">{user.email}</span>
            <span className="w-fit rounded-full border border-green/30 bg-green/10 px-3 py-1 text-xs font-bold text-greenDeep">{user.role}</span>
          </div>
        ))}
      </div>

      {showInvites ? <InviteList invites={invites} onResent={(updated) => setInvites((current) => current.map((item) => item.id === updated.id ? updated : item))} /> : null}
    </>
  );
}

export function InviteList({ invites, onResent }: { invites: PendingInvite[]; onResent?: (invite: PendingInvite) => void }) {
  const [items, setItems] = useState(invites);
  const handleResent = (updated: PendingInvite) => {
    setItems((current) => current.map((item) => item.id === updated.id ? updated : item));
    onResent?.(updated);
  };
  return <section className="grid gap-3">
        <div><h2 className="font-serif text-2xl text-ink">Convites ativos</h2><p className="text-sm text-inkSoft">Usuários que ainda não concluíram o cadastro.</p></div>
        <div className="overflow-hidden rounded-lg border border-line bg-card">
          {items.length === 0 ? <p className="p-5 text-sm text-inkSoft">Nenhum convite pendente.</p> : items.map((invite) => <InviteRow invite={invite} key={invite.id} onResent={handleResent} />)}
        </div>
      </section>
}

function InviteRow({ invite, onResent }: { invite: PendingInvite; onResent: (invite: PendingInvite) => void }) {
  const [sending, setSending] = useState(false);
  const resend = async () => {
    setSending(true);
    const response = await fetch(`/api/admin/invites/${invite.id}/resend`, { method: "POST" });
    if (!response.ok) toast.error("Não foi possível reenviar o convite.");
    else { const updated = (await response.json()) as PendingInvite; onResent(updated); toast.success("Convite reenviado."); }
    setSending(false);
  };
  return <div className="grid gap-3 border-b border-line p-4 last:border-b-0 sm:grid-cols-[1fr_auto_auto] sm:items-center"><span className="break-all text-sm font-semibold text-ink">{invite.email}</span><span className="text-sm text-inkSoft">Expira em {new Date(invite.expiresAt).toLocaleDateString("pt-BR")}</span><button className="btn btn-primary w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-65" disabled={sending} onClick={() => void resend()} type="button">{sending ? "Enviando..." : "Reenviar convite"}</button></div>;
}
