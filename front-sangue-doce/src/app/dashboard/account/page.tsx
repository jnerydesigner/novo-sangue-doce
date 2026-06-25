import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { ProfileForm } from "./profile-form";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const userData = await api.auth.profile(accessToken).catch(() => null);

  if (!userData) {
    redirect("/login");
  }

  if (userData.passwordSetupRequired) {
    redirect("/dashboard/account/password");
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={userData.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader userName={userData.name} />

          <div className="mt-6 max-w-[720px] rounded-lg border border-line bg-card p-[clamp(22px,4vw,34px)] shadow-editorial">
            <span className="eyebrow">Minha conta</span>
            <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.45rem)] font-medium leading-[1.08] tracking-normal">
              Dados pessoais
            </h1>
            <p className="mt-3 text-[15px] leading-7 text-inkSoft">
              Mantenha seus dados principais atualizados para personalizar melhor seu diario.
            </p>

            <ProfileForm profile={userData} />
          </div>
        </section>
      </div>
    </main>
  );
}
