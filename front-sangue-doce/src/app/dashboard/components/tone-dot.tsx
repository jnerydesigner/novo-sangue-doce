import type { DashboardTone } from "../dashboard.data";

type ToneDotProps = {
  tone: DashboardTone;
};

export function ToneDot({ tone }: ToneDotProps) {
  const toneClass = tone === "blue" ? "bg-blue" : tone === "tomato" ? "bg-tomato" : "bg-green";

  return <span className={`h-2 w-2 rounded-full ${toneClass}`} />;
}
