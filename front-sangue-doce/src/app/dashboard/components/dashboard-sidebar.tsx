"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { Brand } from "@/components/home/brand";
import {
  adminSidebarGroups,
  dashboardSidebarGroups,
  type SidebarGroup,
  type SidebarItem,
} from "../dashboard.data";

type DashboardSidebarProps = {
  footer?: ReactNode;
  navLabel?: string;
  showAdminItems?: boolean;
};

type SidebarNavProps = {
  activeHref: string;
  ariaLabel: string;
  groups: SidebarGroup[];
  onNavigate?: () => void;
};

function getActiveHref(groups: SidebarGroup[], activeHref: string) {
  const items = groups.flatMap((group) => group.items);

  return items
    .filter((item) => activeHref === item.href || activeHref.startsWith(`${item.href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;
}

function getActiveGroupLabel(groups: SidebarGroup[], currentHref?: string) {
  return groups.find((group) => group.items.some((item) => item.href === currentHref))?.label;
}

export function SidebarNav({ activeHref, ariaLabel, groups, onNavigate }: SidebarNavProps) {
  const currentHref = getActiveHref(groups, activeHref);
  const activeGroupLabel = getActiveGroupLabel(groups, currentHref);
  const firstGroupLabel = groups[0]?.label;
  const [openGroupLabel, setOpenGroupLabel] = useState<string | undefined>(
    () => activeGroupLabel ?? firstGroupLabel,
  );

  return (
    <nav aria-label={ariaLabel}>
      <div className="grid gap-2">
        {groups.map((group) => {
          const hasActiveItem = group.items.some((item) => item.href === currentHref);
          const isOpen = openGroupLabel === group.label;

          return (
            <details
              className="group rounded-lg border border-transparent open:border-line open:bg-paper/55"
              key={group.label}
              open={isOpen}
            >
              <summary
                className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-muted transition hover:bg-paper2/70 hover:text-inkSoft [&::-webkit-details-marker]:hidden"
                onClick={(event) => {
                  event.preventDefault();
                  setOpenGroupLabel((currentGroupLabel) =>
                    currentGroupLabel === group.label ? undefined : group.label,
                  );
                }}
              >
                <span>{group.label}</span>
                <span className="text-[14px] leading-none transition group-open:rotate-90">
                  &gt;
                </span>
              </summary>

              <ul className="grid gap-1 px-1 pb-2">
                {group.items.map((item) => {
                  const isActive = item.href === currentHref;
                  const Icon = item.icon;

                  return (
                    <li key={item.href}>
                      <Link
                        aria-current={isActive ? "page" : undefined}
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] font-semibold transition ${
                          isActive
                            ? "bg-green/10 text-greenDeep"
                            : "text-inkSoft hover:bg-paper2 hover:text-ink"
                        }`}
                        href={item.href}
                        onClick={onNavigate}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${
                            isActive ? "bg-card text-greenDeep" : "bg-paper text-inkSoft"
                          }`}
                        >
                          <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={2.2} />
                        </span>
                        <span className="min-w-0 leading-snug">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </nav>
  );
}

export function DashboardSidebar({
  footer,
  navLabel = "Menu da dashboard",
  showAdminItems = false,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarGroups = showAdminItems
    ? [...adminSidebarGroups, ...dashboardSidebarGroups]
    : dashboardSidebarGroups;

  return (
    <>
      <MobileSidebar activeHref={pathname} ariaLabel={navLabel} groups={sidebarGroups} />

      <aside className="hidden border-r border-line bg-card px-5 py-7 lg:flex lg:flex-col">
        <div className="mb-8 px-2 text-greenDeep">
          <Brand />
        </div>

        <SidebarNav
          activeHref={pathname}
          ariaLabel={navLabel}
          groups={sidebarGroups}
          key={pathname}
        />

        {footer ?? (
          <div className="mt-auto rounded-lg border border-line bg-paper p-4">
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
              Proxima etapa
            </span>
            <p className="mt-2 text-sm text-inkSoft">
              Conectar leituras ao banco e liberar filtros por periodo.
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

function MobileSidebar({ activeHref, ariaLabel, groups }: SidebarNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="contents lg:hidden">
      <button
        aria-expanded={isOpen}
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        className="fixed left-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-lg border border-line bg-card text-ink shadow-sm"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
      >
        {isOpen ? (
          <X aria-hidden="true" className="h-5 w-5" />
        ) : (
          <Menu aria-hidden="true" className="h-5 w-5" />
        )}
      </button>

      {isOpen ? (
        <button
          aria-label="Fechar menu"
          className="fixed inset-0 z-40 bg-ink/30"
          onClick={() => setIsOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        aria-label={ariaLabel}
        className={`fixed inset-y-0 left-0 z-40 w-[min(82vw,300px)] overflow-y-auto border-r border-line bg-card px-5 py-7 shadow-xl transition-transform duration-200 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 px-2 text-greenDeep">
          <Brand />
        </div>
        <SidebarNav
          activeHref={activeHref}
          ariaLabel={ariaLabel}
          groups={groups}
          key={activeHref}
          onNavigate={() => setIsOpen(false)}
        />
      </aside>
    </div>
  );
}
