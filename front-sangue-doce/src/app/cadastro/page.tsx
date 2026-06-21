import Link from "next/link";
import { SignupForm } from "./signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <Link
            className="font-serif text-[1.6rem] font-medium tracking-normal text-greenDeep"
            href="/"
          >
            Sangue Doce
          </Link>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/login"
          >
            Entrar
          </Link>
        </div>
      </header>

      <section className="wrap grid min-h-[calc(100vh-76px)] items-center py-[clamp(48px,8vw,90px)]">
        <div className="mx-auto w-full max-w-[520px] rounded-lg border border-line bg-card p-[clamp(26px,5vw,38px)] shadow-editorial">
          <span className="eyebrow">Cadastro</span>
          <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,2.7rem)] font-medium leading-[1.05] tracking-normal">
            Criar sua conta
          </h1>
          <p className="mt-3 text-[15.5px] text-inkSoft">
            Seus dados iniciais liberam o painel de acompanhamento.
          </p>

          <SignupForm />
        </div>
      </section>
    </main>
  );
}
