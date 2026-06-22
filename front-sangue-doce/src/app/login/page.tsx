import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/home/brand";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (accessToken) {
    const profile = await api.auth.profile(accessToken).catch(() => null);

    if (profile) {
      redirect(profile.role === "ADMIN" ? "/admin" : "/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="border-b border-line bg-card">
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-4">
          <div className="text-greenDeep">
            <Brand />
          </div>
          <Link
            className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
            href="/"
          >
            Voltar para home
          </Link>
        </div>
      </header>

      <section className="wrap grid min-h-[calc(100vh-76px)] items-center py-[clamp(48px,8vw,90px)]">
        <div className="mx-auto w-full max-w-[430px] rounded-lg border border-line bg-card p-[clamp(26px,5vw,38px)] shadow-editorial">
          <span className="eyebrow">Entrar</span>
          <h1 className="mt-3 font-serif text-[clamp(2rem,4vw,2.7rem)] font-medium leading-[1.05] tracking-normal">
            Entrar no Sangue Doce
          </h1>
          <p className="mt-3 text-[15.5px] text-inkSoft">
            Ao entrar, voce volta para a home com seu diario carregado e acesso rapido a Minha Area.
          </p>

          <LoginForm />

          <p className="mt-5 text-center text-[14px] text-muted">
            Ainda nao tem conta?{" "}
            <Link className="font-semibold text-greenDeep" href="/cadastro">
              Criar cadastro
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
