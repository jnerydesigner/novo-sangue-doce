import { quickActions } from "../dashboard.data";
import { GlucoseChart } from "./glucose-chart";
import { ToneDot } from "./tone-dot";

export function GlucosePanel() {
  return (
    <section className="rounded-lg border border-line bg-card p-[clamp(20px,3vw,28px)] shadow-editorial">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            <ToneDot tone="green" />
            Glicemia ultimas 24h
          </div>
          <p className="mt-2 text-sm text-inkSoft">
            Faixa-alvo 70-140 mg/dL. Media recente de 112 mg/dL.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {quickActions.map((action) => (
            <button
              className="rounded-full border border-lineStrong bg-paper px-3 py-2 text-sm font-semibold text-inkSoft transition hover:-translate-y-px hover:bg-paper2"
              key={action}
              type="button"
            >
              {action}
            </button>
          ))}
        </div>
      </div>
      <GlucoseChart />
    </section>
  );
}
