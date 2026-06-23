"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoutButton } from "@/app/dashboard/components/logout-button";
import { UserAvatar } from "@/app/dashboard/components/user-avatar";

type UserMenuProps = {
  actionLabel?: string;
  dashboardHref: string;
  name: string;
  sectionLabel?: string;
  statusLabel?: string;
  tone?: "light" | "solid";
};

export function UserMenu({
  actionLabel = "Acessar area logada",
  dashboardHref,
  name,
  sectionLabel = "Area logada",
  statusLabel = "Sessao ativa",
  tone = "solid",
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const triggerClass =
    tone === "light"
      ? "border-white/35 bg-white/10 text-paper hover:bg-white/20"
      : "border-lineStrong text-greenDeep hover:bg-paper2";

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-3 rounded-lg border px-3 py-2 text-[15px] font-semibold transition hover:-translate-y-px ${triggerClass}`}
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <UserAvatar name={name} />
        <span className="max-w-[150px] truncate">{name}</span>
        <span className="text-xs" aria-hidden="true">
          v
        </span>
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+8px)] z-[110] grid min-w-[240px] gap-2 rounded-lg border border-line bg-card p-2 shadow-editorial"
          role="menu"
        >
          <div className="rounded-md bg-paper2 px-3 py-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-muted">
              {sectionLabel}
            </span>
            <div className="mt-2 flex items-center gap-3">
              <UserAvatar name={name} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-ink">{name}</div>
                <div className="text-xs text-muted">{statusLabel}</div>
              </div>
            </div>
          </div>
          <Link
            className="rounded-md px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 hover:text-ink"
            href={dashboardHref}
            onClick={() => setOpen(false)}
            role="menuitem"
          >
            {actionLabel}
          </Link>
          <LogoutButton />
        </div>
      ) : null}
    </div>
  );
}
