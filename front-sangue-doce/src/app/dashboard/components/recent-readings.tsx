import type { Measurement, ReadingContext } from "@/lib/api";
import { ToneDot } from "./tone-dot";

type RecentReadingsProps = {
  measurements: Measurement[];
};

const contextLabels: Record<ReadingContext, string> = {
  AFTER_MEAL: "Pos-refeicao",
  BEDTIME: "Noite",
  BEFORE_MEAL: "Pre-refeicao",
  EXERCISE: "Exercicio",
  FASTING: "Jejum",
  MANUAL: "Manual",
  RANDOM: "Rotina",
};

function getDayLabel(measuredAt: string) {
  const date = new Date(measuredAt);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const dateKey = formatter.format(date);
  const todayKey = formatter.format(today);
  const yesterdayKey = formatter.format(yesterday);

  if (dateKey === todayKey) {
    return "Hoje";
  }

  if (dateKey === yesterdayKey) {
    return "Ontem";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function getTimeLabel(measuredAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(measuredAt));
}

function getReadingTag(measurement: Measurement) {
  return measurement.noteLabel ?? contextLabels[measurement.readingContext];
}

export function RecentReadings({ measurements }: RecentReadingsProps) {
  const recentReadings = [...measurements]
    .sort(
      (left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime(),
    )
    .slice(0, 5);

  return (
    <section className="rounded-lg border border-line bg-card p-[clamp(20px,3vw,28px)] shadow-editorial">
      <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
        <ToneDot tone="green" />
        Leituras recentes
      </div>

      {recentReadings.length > 0 ? (
        <div className="mt-4 overflow-hidden rounded-lg border border-line">
          <table className="w-full border-collapse bg-paper text-sm">
            <tbody>
              {recentReadings.map((reading) => (
                <tr className="border-b border-line last:border-b-0" key={reading.id}>
                  <td className="px-3 py-3 font-semibold text-ink">
                    {getDayLabel(reading.measuredAt)}
                  </td>
                  <td className="px-3 py-3 text-muted">{getTimeLabel(reading.measuredAt)}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                        reading.glucoseValueMgDl > 140
                          ? "bg-tomato/10 text-tomato"
                          : "bg-green/10 text-greenDeep"
                      }`}
                    >
                      {getReadingTag(reading)}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right font-serif text-[1.1rem] font-medium">
                    {reading.glucoseValueMgDl}
                    <span className="font-sans text-[0.68em] text-muted"> mg/dL</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-4 rounded-lg border border-line bg-paper px-4 py-5 text-sm font-semibold text-muted">
          Nenhuma leitura registrada ainda.
        </p>
      )}
    </section>
  );
}
