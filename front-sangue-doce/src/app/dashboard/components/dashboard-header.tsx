import { LogoutButton } from "./logout-button";
import { UserAvatar } from "./user-avatar";

type DashboardHeaderProps = {
  userName: string;
};

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
      <div>
        <span className="text-sm font-semibold text-muted">Bom dia, {userName}!</span>
        <h1 className="font-serif text-[clamp(2rem,4vw,3.1rem)] font-medium leading-[1.04] tracking-normal">
          Resumo de hoje
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <UserAvatar name={userName} />
        <LogoutButton />
      </div>
    </header>
  );
}
