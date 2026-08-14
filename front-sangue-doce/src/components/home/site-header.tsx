"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthProfile } from "@/lib/api";
import { Brand } from "./brand";
import { navItems } from "./data";
import { CloseIcon, MenuIcon } from "./icons";
import { UserMenu } from "./user-menu";
import { scrollToId } from "./utils";

function getNavHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

type SiteHeaderProps = {
  isAuthenticated: boolean;
  opaque?: boolean;
  position?: "fixed" | "sticky";
  profile: AuthProfile | null;
};

export function SiteHeader({ isAuthenticated, opaque = false, position = "sticky", profile }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardHref = profile?.role === "ADMIN" ? "/admin" : "/dashboard";

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header className={`${position} top-0 z-[100] border-b border-line bg-bg shadow-sm`}>
        <div className="wrap flex min-h-[76px] flex-wrap items-center justify-between gap-4 py-3 lg:gap-6">
          <div className="text-navy">
            <Brand />
          </div>

          <nav className="ml-auto hidden items-center gap-6 xl:flex" aria-label="Principal">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={getNavHref(item.href)}
                className="relative py-1 text-[15px] font-medium text-inkSoft transition after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-spark after:transition-all hover:text-navy hover:after:w-full"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <button
            className="btn btn-primary hidden md:inline-flex"
            onClick={() => scrollToId("news")}
            type="button"
          >
            Receber boletim
          </button>

          {profile ? (
            <div className="hidden md:block">
              <UserMenu
                avatarUrl={profile.avatarUrl}
                dashboardHref={dashboardHref}
                name={profile.name}
                tone="solid"
              />
            </div>
          ) : (
            <Link
              className="hidden rounded-lg border border-lineStrong px-5 py-3 text-[15px] font-semibold text-navy transition hover:-translate-y-px hover:bg-subtle md:inline-flex"
              href={isAuthenticated ? dashboardHref : "/login"}
            >
              Entrar
            </Link>
          )}

          <button
            className="grid h-11 w-11 place-items-center text-ink xl:hidden"
            type="button"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="order-last grid w-full gap-3 md:hidden">
            {profile ? (
              <UserMenu
                className="w-full"
                avatarUrl={profile.avatarUrl}
                dashboardHref={dashboardHref}
                name={profile.name}
                tone="solid"
              />
            ) : (
              <Link
                className="inline-flex w-full justify-center rounded-lg border border-lineStrong px-5 py-3 text-[15px] font-semibold text-navy"
                href={isAuthenticated ? dashboardHref : "/login"}
              >
                Entrar
              </Link>
            )}
            <button
              className="btn btn-primary w-full justify-center"
              onClick={() => scrollToId("news")}
              type="button"
            >
              Receber boletim
            </button>
          </div>
        </div>
      </header>

      <div
        className={`fixed inset-y-0 right-0 z-[101] flex w-[min(86vw,380px)] flex-col justify-start overflow-y-auto border-l border-line bg-bg px-6 pb-8 pt-28 shadow-xl transition duration-300 xl:hidden ${
          menuOpen ? "visible translate-x-0" : "invisible translate-x-full"
        }`}
      >
        <button
          className="absolute right-5 top-5 grid h-11 w-11 place-items-center rounded-lg border border-lineStrong text-ink"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        >
          <CloseIcon />
        </button>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={getNavHref(item.href)}
            className="border-b border-line py-3.5 font-serif text-[2.2rem] text-ink"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
      </div>
    </>
  );
}
