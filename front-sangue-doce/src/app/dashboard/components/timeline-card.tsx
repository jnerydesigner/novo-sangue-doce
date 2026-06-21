import { timelineItems } from "../dashboard.data";
import { ToneDot } from "./tone-dot";

export function TimelineCard() {
  return (
    <section className="rounded-lg border border-line bg-card p-[clamp(20px,3vw,28px)]">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        <ToneDot tone="blue" />
        Linha do tempo
      </div>
      <ol className="mt-4 grid gap-3">
        {timelineItems.map((item) => (
          <li className="rounded-lg border border-line bg-paper p-4" key={item.title}>
            <strong className="block text-[15px]">{item.title}</strong>
            <span className="text-sm text-inkSoft">{item.description}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
