import { readings } from "../dashboard.data";
import { ToneDot } from "./tone-dot";

export function RecentReadings() {
  return (
    <section className="rounded-lg border border-line bg-card p-[clamp(20px,3vw,28px)] shadow-editorial">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        <ToneDot tone="green" />
        Leituras recentes
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-line">
        <table className="w-full border-collapse bg-paper text-sm">
          <tbody>
            {readings.map((reading) => (
              <tr
                className="border-b border-line last:border-b-0"
                key={`${reading.day}-${reading.time}`}
              >
                <td className="px-3 py-3 font-semibold text-ink">{reading.day}</td>
                <td className="px-3 py-3 text-muted">{reading.time}</td>
                <td className="px-3 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                      reading.tone === "tomato"
                        ? "bg-tomato/10 text-tomato"
                        : "bg-green/10 text-greenDeep"
                    }`}
                  >
                    {reading.tag}
                  </span>
                </td>
                <td className="px-3 py-3 text-right font-serif text-[1.1rem] font-medium">
                  {reading.value}
                  <span className="font-sans text-[0.68em] text-muted"> mg/dL</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
