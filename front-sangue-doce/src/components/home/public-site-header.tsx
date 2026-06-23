import { cookies } from "next/headers";
import Link from "next/link";
import { api } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { Brand } from "./brand";
import { navItems } from "./data";
import { UserMenu } from "./user-menu";

function getPublicHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export async function PublicSiteHeader() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const profile = accessToken
    ? await api.auth.profile(accessToken).catch(() => null)
    : null;
  const dashboardHref = profile?.role === "ADMIN" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-[100] border-b border-line bg-paper/90 shadow-sm backdrop-blur-xl">
      <div className="wrap flex h-[76px] items-center justify-between gap-6">
        <div className="text-greenDeep">
          <Brand />
        </div>
        <nav
          className="ml-auto hidden items-center gap-[30px] md:flex"
          aria-label="Principal"
        >
          {navItems.map((link) => (
            <Link
              className="relative py-1 text-[15px] font-medium text-inkSoft transition after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-green after:transition-all hover:text-ink hover:after:w-full"
              href={getPublicHref(link.href)}
              key={link.href}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            className="hidden rounded-lg bg-green px-5 py-3 text-[15px] font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep sm:inline-flex"
            href="/#news"
          >
            Receber boletim
          </Link>

          {profile ? (
            <div className="hidden sm:block">
              <UserMenu dashboardHref={dashboardHref} name={profile.name} />
            </div>
          ) : (
            <Link
              className="hidden rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 sm:inline-flex"
              href="/login"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
