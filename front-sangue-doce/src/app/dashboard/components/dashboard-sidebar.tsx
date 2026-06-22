import Link from "next/link";
import { Brand } from "@/components/home/brand";
import { sidebarItems } from "../dashboard.data";

export function DashboardSidebar() {
  return (
    <aside className="hidden border-r border-line bg-card px-5 py-7 lg:flex lg:flex-col">
      <div className="mb-8 px-2 text-greenDeep">
        <Brand />
      </div>

      <nav aria-label="Menu da dashboard">
        <ul className="grid gap-1">
          {sidebarItems.map((item, index) => (
            <li key={item}>
              <button
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-[15px] font-semibold transition ${
                  index === 0
                    ? "bg-green/10 text-greenDeep"
                    : "text-inkSoft hover:bg-paper2 hover:text-ink"
                }`}
                type="button"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-paper text-sm">
                  {item.slice(0, 1)}
                </span>
                {item}
              </button>
            </li>
          ))}
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
