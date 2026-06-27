import type React from "react";
import { UserMenu } from "@/components/home/user-menu";

type DashboardHeaderProps = {
  action?: React.ReactNode;
  avatarUrl?: string;
  subtitle?: string;
  title?: string;
  userName: string;
};

export function DashboardHeader({
  action,
  avatarUrl,
  subtitle,
  title = "Resumo de hoje",
  userName,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <div>
        <span className="text-sm font-semibold text-muted">
          {subtitle ?? `Bom dia, ${userName}!`}
        </span>
        <h1 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-normal">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        {action}
        <UserMenu
          actionLabel="Ver site"
          avatarUrl={avatarUrl}
          dashboardHref="/"
          name={userName}
          sectionLabel="Site publico"
          statusLabel="Sangue Doce"
        />
      </div>
    </header>
  );
}
