import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { AuthorProfileForm } from "./author-profile-form";
import { AuthorSelfCreateForm } from "./author-self-create-form";
import { ImageUploadField } from "./image-upload-field";
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

  const authorProfile = await api.authors.me({ accessToken }).catch(() => null);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr]">
        <DashboardSidebar showAdminItems={userData.role === "ADMIN"} />

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6">
          <DashboardHeader
            avatarUrl={userData.avatarUrl}
            subtitle="Essa e uma area de atualizacao de dados."
            title="Atualizacao de dados"
            userName={userData.name}
          />

          <div className="mt-6 grid max-w-[1320px] items-start gap-5 xl:grid-cols-[minmax(0,720px)_minmax(360px,1fr)]">
            <div className="rounded-lg border border-line bg-card p-[clamp(22px,4vw,34px)] shadow-editorial">
              <span className="eyebrow">Minha conta</span>
              <h1 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.45rem)] font-medium leading-[1.08] tracking-normal">
                Dados pessoais
              </h1>
              <p className="mt-3 text-[15px] leading-7 text-inkSoft">
                Mantenha seus dados principais atualizados para personalizar melhor seu diario.
              </p>

              <ImageUploadField initialImageUrl={userData.avatarUrl} profileName={userData.name} />

              <ProfileForm profile={userData} />
            </div>

            <div className="rounded-lg border border-line bg-card p-[clamp(22px,4vw,34px)] shadow-editorial">
              <span className="eyebrow">Perfil de autor</span>
              <h2 className="mt-3 font-serif text-[clamp(1.8rem,3vw,2.35rem)] font-medium leading-[1.08] tracking-normal">
                Bio editorial
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-inkSoft">
                Atualize a tagline e a biografia exibidas nas materias vinculadas ao seu autor.
              </p>

              {authorProfile ? (
                <AuthorProfileForm author={authorProfile} />
              ) : userData.role === "ADMIN" ? (
                <AuthorSelfCreateForm profile={userData} />
              ) : (
                <p className="mt-6 rounded-lg border border-line bg-paper px-4 py-3 text-[14px] leading-6 text-inkSoft">
                  Nenhum perfil de autor esta vinculado a esta conta.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
