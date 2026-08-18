import Link from "next/link";
import { SignupForm } from "../../cadastro/signup-form";

type InvitePageProps = { params: Promise<{ token: string }> };

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const apiUrl = process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011";
  const response = await fetch(`${apiUrl}/invites/${encodeURIComponent(token)}`, { cache: "no-store" });
  const data = (await response.json().catch(() => null)) as { email?: string; message?: string } | null;

  if (!response.ok || !data?.email) {
    return (
      <main className="wrap py-24">
        <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-8 text-center">
          <h1 className="font-serif text-3xl text-ink">Convite indisponível</h1>
          <p className="mt-4 text-inkSoft">{data?.message ?? "Este convite é inválido ou expirou."}</p>
          <Link className="mt-6 inline-flex rounded-lg bg-green px-4 py-2.5 font-bold text-white" href="/login">Ir para o login</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="wrap min-h-screen py-16">
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-8">
        <span className="eyebrow">Convite recebido</span>
        <h1 className="mt-3 font-serif text-3xl text-ink">Crie sua conta</h1>
        <p className="mt-3 text-inkSoft">Seu convite autorizou o e-mail abaixo. Complete seus dados para continuar.</p>
        <SignupForm initialEmail={data.email} invited />
      </div>
    </main>
  );
}
