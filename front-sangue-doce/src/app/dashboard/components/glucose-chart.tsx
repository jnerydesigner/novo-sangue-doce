import type { Measurement, MeasurementNoteType } from "@/lib/api";

const noteOrder: MeasurementNoteType[] = [
  "FASTING_WAKE_UP", "BEFORE_BREAKFAST", "AFTER_BREAKFAST", "MORNING_RANDOM_CHECK",
  "BEFORE_LUNCH", "AFTER_LUNCH", "AFTERNOON_RANDOM_CHECK", "BEFORE_DINNER",
  "AFTER_DINNER", "BEFORE_SLEEP", "NIGHT_RANDOM_CHECK", "BEFORE_EXERCISE",
  "AFTER_EXERCISE", "FEELING_UNWELL", "ROUTINE_CHECK", "DAWN_RANDOM_CHECK",
];

const scheduledTimes: Partial<Record<MeasurementNoteType, string>> = {
  FASTING_WAKE_UP: "05h30", BEFORE_BREAKFAST: "06h", AFTER_BREAKFAST: "08h",
  BEFORE_LUNCH: "12h", AFTER_LUNCH: "14h", BEFORE_DINNER: "18h",
  AFTER_DINNER: "20h", BEFORE_SLEEP: "22h",
};

function formatMeasurementTime(value: string) {
  const time = value.split("T")[1] ?? "";
  const [hour, minute] = time.split(":");

  return hour && minute ? `${hour}h${minute}` : value;
}

export function GlucoseChart({ measurements }: { measurements: Measurement[] }) {
  const points = measurements
    .filter((measurement) => measurement.noteType)
    .sort((left, right) => {
      const noteDifference = noteOrder.indexOf(left.noteType!) - noteOrder.indexOf(right.noteType!);
      return noteDifference || new Date(left.measuredAt).getTime() - new Date(right.measuredAt).getTime();
    })
    .map((measurement, index) => ({
      id: measurement.id,
      index,
      value: measurement.glucoseValueMgDl,
      time: scheduledTimes[measurement.noteType!] ?? formatMeasurementTime(measurement.measuredAt),
    }));
  const width = 560;
  const height = 150;
  const padX = 10;
  const padTop = 16;
  const padBottom = 28;
  const targetLow = 70;
  const targetHigh = 140;
  const values = points.map((point) => point.value);
  const lowestValue = values.length > 0 ? Math.min(...values) : targetLow;
  const highestValue = values.length > 0 ? Math.max(...values) : targetHigh;
  const min = Math.min(targetLow - 10, Math.floor((lowestValue - 10) / 10) * 10);
  const max = Math.max(targetHigh + 10, Math.ceil((highestValue + 10) / 10) * 10);

  const getX = (index: number) => padX + (index / Math.max(points.length - 1, 1)) * (width - padX * 2);
  const getY = (value: number) =>
    padTop + (1 - (value - min) / (max - min)) * (height - padTop - padBottom);

  const line = points
    .map(
      (point) =>
        `${point.index === 0 ? "M" : "L"}${getX(point.index).toFixed(1)},${getY(point.value).toFixed(1)}`,
    )
    .join(" ");
  const area = points.length > 0
    ? `${line} L${getX(points.length - 1).toFixed(1)},${height - padBottom} L${getX(0).toFixed(1)},${height - padBottom} Z`
    : "";

  return (
    <svg
      aria-label="Grafico de glicemia nas ultimas 24 horas"
      className="mt-5 h-[150px] w-full overflow-hidden"
      preserveAspectRatio="none"
      role="img"
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id="dashboard-glucose-fill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3f7a4f" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#3f7a4f" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect
        fill="#3f7a4f"
        height={getY(targetLow) - getY(targetHigh)}
        opacity="0.07"
        width={width - padX * 2}
        x={padX}
        y={getY(targetHigh)}
      />
      <line
        opacity="0.38"
        stroke="#3f7a4f"
        strokeDasharray="4 5"
        x1={padX}
        x2={width - padX}
        y1={getY(targetHigh)}
        y2={getY(targetHigh)}
      />
      <line
        opacity="0.38"
        stroke="#3f7a4f"
        strokeDasharray="4 5"
        x1={padX}
        x2={width - padX}
        y1={getY(targetLow)}
        y2={getY(targetLow)}
      />
      <path d={area} fill="url(#dashboard-glucose-fill)" />
      <path
        d={line}
        fill="none"
        stroke="#3f7a4f"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      />
      {points.map((point) => (
        <circle
          cx={getX(point.index)}
          cy={getY(point.value)}
          fill={point.index === points.length - 1 ? "#2f5d3c" : "#fffdf8"}
          key={point.id}
          r={point.index === points.length - 1 ? 4.5 : 2.8}
          stroke="#3f7a4f"
          strokeWidth="1.6"
        />
      ))}
      {points.map((point) => (
        <text
          fill="#79705f"
          fontFamily="Hanken Grotesk, system-ui, sans-serif"
          fontSize="10"
          key={`${point.id}-label`}
          textAnchor="middle"
          x={getX(point.index)}
          y={height - 7}
        >
          {point.time}
        </text>
      ))}
    </svg>
  );
}
