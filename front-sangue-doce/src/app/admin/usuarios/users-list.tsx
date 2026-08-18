"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/api";
import { InviteUserButton } from "./invite-user-button";

export function UsersList({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState(initialUsers);

  useEffect(() => {
    const refresh = async () => {
      const response = await fetch("/api/admin/users", { cache: "no-store" });
      if (response.ok) setUsers((await response.json()) as User[]);
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
    </>
  );
}
