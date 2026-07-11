"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AuthProfile } from "@/lib/api";
import { Brand } from "./brand";
import { navItems } from "./data";
import { CloseIcon, MenuIcon } from "./icons";
import { UserMenu } from "./user-menu";
import { scrollToId } from "./utils";

type SiteHeaderProps = {
  isAuthenticated: boolean;
  profile: AuthProfile | null;
};

export function SiteHeader({ isAuthenticated, profile }: SiteHeaderProps) {
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
      <header className="fixed inset-x-0 top-0 z-[100] border-b border-line bg-bg shadow-sm">
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <div className="text-navy">
            <Brand />
          </div>

          <nav
            className="ml-auto hidden items-center gap-[30px] md:flex"
            aria-label="Principal"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
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
            className="grid h-11 w-11 place-items-center text-ink md:hidden"
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[99] flex flex-col justify-center bg-bg px-[clamp(20px,5vw,64px)] transition duration-300 md:hidden ${
          menuOpen ? "visible translate-y-0" : "invisible -translate-y-full"
        }`}
      >
        <button
          className="absolute right-[clamp(20px,5vw,64px)] top-6 grid h-11 w-11 place-items-center text-ink"
          type="button"
          aria-label="Fechar menu"
          onClick={() => setMenuOpen(false)}
        >
          <CloseIcon />
        </button>
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="border-b border-line py-3.5 font-serif text-[2.2rem] text-ink"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </a>
        ))}
        <button
          className="btn btn-primary mt-7 self-start px-7 py-4 text-base"
          onClick={() => {
            setMenuOpen(false);
            scrollToId("news");
          }}
          type="button"
        >
          Receber boletim
        </button>
        {profile ? (
          <div className="mt-3 self-start">
            <UserMenu
              avatarUrl={profile.avatarUrl}
              dashboardHref={dashboardHref}
              name={profile.name}
            />
          </div>
        ) : (
          <Link
            className="mt-3 inline-flex self-start rounded-lg border border-lineStrong px-7 py-4 text-base font-semibold text-navy"
            href={isAuthenticated ? dashboardHref : "/login"}
            onClick={() => setMenuOpen(false)}
          >
            Entrar
          </Link>
        )}
      </div>
    </>
  );
}
