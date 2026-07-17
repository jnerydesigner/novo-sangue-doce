import Link from "next/link";

type ConfirmPageProps = { searchParams: Promise<{ token?: string }> };

export default async function NewsletterConfirmPage({ searchParams }: ConfirmPageProps) {
  const { token } = await searchParams;
  let message = "Não foi possível confirmar sua assinatura.";
  let success = false;

  if (token) {
    const response = await fetch(
      `${process.env.INTERNAL_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011"}/newsletter/subscriptions/confirm?token=${encodeURIComponent(token)}`,
      { cache: "no-store" },
    );
    const data = (await response.json().catch(() => null)) as { message?: string } | null;
    message = data?.message ?? message;
    success = response.ok;
  }

  return (
    <main className="wrap py-24">
      <div className="mx-auto max-w-xl rounded-xl border border-line bg-card p-8 text-center">
        <h1 className="font-serif text-3xl text-ink">{success ? "Assinatura confirmada" : "Confirmação"}</h1>
        <p className="mt-4 text-inkSoft">{message}</p>
        <Link className="mt-6 inline-flex rounded-lg bg-green px-4 py-2.5 font-bold text-white" href="/">
          Voltar para o Sangue Doce
        </Link>
      </div>
    </main>
  );
}
