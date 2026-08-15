import type React from "react";
import { UserMenu } from "@/components/home/user-menu";
import { DateTimeCard } from "./date-time-card";

type DashboardHeaderProps = {
  action?: React.ReactNode;
  avatarUrl?: string;
  subtitle?: string;
  title?: string;
  userMenuDashboardHref?: string;
  userName: string;
};

export function DashboardHeader({
  action,
  avatarUrl,
  subtitle,
  title = "Resumo de hoje",
  userMenuDashboardHref = "/",
  userName,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <div className="min-w-0">
        <span className="text-sm font-semibold text-muted">
          {subtitle ?? `Bom dia, ${userName}!`}
        </span>
        <h1 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-normal">
          {title}
        </h1>
      </div>

      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        {action}
        <div className="order-last w-full sm:order-first sm:w-auto">
          <DateTimeCard className="w-full sm:w-auto" />
        </div>
        <div className="order-first w-full sm:order-last sm:w-auto">
          <UserMenu
            className="w-full sm:w-auto"
            actionLabel="Ver site"
            avatarUrl={avatarUrl}
            dashboardHref={userMenuDashboardHref}
            name={userName}
            sectionLabel="Site publico"
            statusLabel="Sangue Doce"
          />
        </div>
      </div>
    </header>
  );
}
