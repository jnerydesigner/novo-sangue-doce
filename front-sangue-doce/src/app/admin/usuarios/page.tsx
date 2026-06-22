import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { api } from "@/lib/api";
import { requireAdmin } from "../_lib/require-admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const { accessToken } = await requireAdmin();
  const users = await api.users.list({ accessToken });

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/admin"
          >
            Admin
          </Link>
        </div>
      </header>

      <section className="wrap py-[clamp(40px,7vw,78px)]">
        <span className="eyebrow">Admin</span>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-[clamp(2.2rem,4vw,3.8rem)] font-medium leading-[1.04] tracking-normal">
              Usuarios
            </h1>
            <p className="mt-3 text-inkSoft">{users.length} contas cadastradas</p>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-line bg-card">
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
    </main>
  );
}
