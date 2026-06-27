"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Brand } from "@/components/home/brand";
import { adminSidebarItems, dashboardSidebarItems } from "../dashboard.data";

type DashboardSidebarProps = {
  showAdminItems?: boolean;
};

export function DashboardSidebar({ showAdminItems = false }: DashboardSidebarProps) {
  const pathname = usePathname();
  const sidebarItems = showAdminItems
    ? [...adminSidebarItems, ...dashboardSidebarItems]
    : dashboardSidebarItems;

  return (
    <aside className="hidden border-r border-line bg-card px-5 py-7 lg:flex lg:flex-col">
      <div className="mb-8 px-2 text-greenDeep">
        <Brand />
      </div>

      <nav aria-label="Menu da dashboard">
        <ul className="grid gap-1">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === item.href && item.label === "Hoje"
                : pathname === item.href;
            const mark =
              "mark" in item && typeof item.mark === "string" ? item.mark : item.label.slice(0, 1);

            return (
              <li key={item.label}>
                <Link
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-semibold transition ${
                    isActive
                      ? "bg-green/10 text-greenDeep"
                      : "text-inkSoft hover:bg-paper2 hover:text-ink"
                  }`}
                  href={item.href}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper text-sm">
                    {mark}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

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
