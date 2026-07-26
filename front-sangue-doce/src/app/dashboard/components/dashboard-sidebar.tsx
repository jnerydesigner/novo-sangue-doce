"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/home/brand";
import {
  adminSidebarGroups,
  dashboardSidebarGroups,
  type SidebarGroup,
  type SidebarItem,
} from "../dashboard.data";

type DashboardSidebarProps = {
  showAdminItems?: boolean;
};

type SidebarNavProps = {
  activeHref: string;
  ariaLabel: string;
  groups: SidebarGroup[];
};

function getActiveHref(groups: SidebarGroup[], activeHref: string) {
  const items = groups.flatMap((group) => group.items);

  return items
    .filter((item) => activeHref === item.href || activeHref.startsWith(`${item.href}/`))
    .sort((first, second) => second.href.length - first.href.length)[0]?.href;
}

function getItemMark(item: SidebarItem) {
  return item.mark ?? item.label.slice(0, 1);
}

export function SidebarNav({ activeHref, ariaLabel, groups }: SidebarNavProps) {
  const currentHref = getActiveHref(groups, activeHref);

  return (
    <nav aria-label={ariaLabel}>
      <div className="grid gap-2">
        {groups.map((group) => {
          const hasActiveItem = group.items.some((item) => item.href === currentHref);

          return (
            <details
              className="group rounded-lg border border-transparent open:border-line open:bg-paper/55"
              open={hasActiveItem}
              key={group.label}
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 rounded-lg px-3 py-2 text-[12px] font-bold uppercase tracking-[0.12em] text-muted transition hover:bg-paper2/70 hover:text-inkSoft [&::-webkit-details-marker]:hidden">
                <span>{group.label}</span>
                <span className="text-[14px] leading-none transition group-open:rotate-90">
                  &gt;
                </span>
              </summary>

              <ul className="grid gap-1 px-1 pb-2">
                {group.items.map((item) => {
                  const isActive = item.href === currentHref;

                  return (
                    <li key={item.href}>
                      <Link
                        className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left text-[15px] font-semibold transition ${
                          isActive
                            ? "bg-green/10 text-greenDeep"
                            : "text-inkSoft hover:bg-paper2 hover:text-ink"
                        }`}
                        href={item.href}
                      >
                        <span
                          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg text-sm ${
                            isActive ? "bg-card text-greenDeep" : "bg-paper text-inkSoft"
                          }`}
                        >
                          {getItemMark(item)}
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

export function DashboardSidebar({ showAdminItems = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarGroups = showAdminItems
    ? [...adminSidebarGroups, ...dashboardSidebarGroups]
    : dashboardSidebarGroups;

  return (
    <aside className="hidden border-r border-line bg-card px-5 py-7 lg:flex lg:flex-col">
      <div className="mb-8 px-2 text-greenDeep">
        <Brand />
      </div>

      <SidebarNav activeHref={pathname} ariaLabel="Menu da dashboard" groups={sidebarGroups} />

      <div className="mt-auto rounded-lg border border-line bg-paper p-4">
        <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
          Proxima etapa
        </span>
        <p className="mt-2 text-sm text-inkSoft">
          Conectar leituras ao banco e liberar filtros por periodo.
        </p>
      </div>
    </aside>
  );
}
