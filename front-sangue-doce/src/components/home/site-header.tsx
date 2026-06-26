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
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboardHref = profile?.role === "ADMIN" ? "/admin" : "/dashboard";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[100] border-b transition duration-300 ${
          scrolled
            ? "border-line bg-paper/80 shadow-sm backdrop-blur-xl"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="wrap flex h-[76px] items-center justify-between gap-6">
          <div className={scrolled ? "text-ink" : "text-paper"}>
            <Brand />
          </div>

          <nav className="ml-auto hidden items-center gap-[30px] md:flex" aria-label="Principal">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className={`relative py-1 text-[15px] font-medium transition after:absolute after:bottom-[-2px] after:left-0 after:h-[1.5px] after:w-0 after:bg-green after:transition-all hover:after:w-full ${
                  scrolled ? "text-inkSoft" : "text-paper/85"
                }`}
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
                tone={scrolled ? "solid" : "light"}
              />
            </div>
          ) : (
            <Link
              className={`hidden rounded-lg border px-5 py-3 text-[15px] font-semibold transition hover:-translate-y-px md:inline-flex ${
                scrolled
                  ? "border-lineStrong text-greenDeep hover:bg-paper2"
                  : "border-white/35 bg-white/10 text-paper hover:bg-white/20"
              }`}
              href={isAuthenticated ? dashboardHref : "/login"}
            >
              Entrar
            </Link>
          )}

          <button
            className={`grid h-11 w-11 place-items-center md:hidden ${scrolled ? "text-ink" : "text-paper"}`}
            type="button"
            aria-label="Abrir menu"
            onClick={() => setMenuOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      <div
        className={`fixed inset-0 z-[99] flex flex-col justify-center bg-paper/95 px-[clamp(20px,5vw,64px)] backdrop-blur-lg transition duration-300 md:hidden ${
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
            className="mt-3 inline-flex self-start rounded-lg border border-lineStrong px-7 py-4 text-base font-semibold text-greenDeep"
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
