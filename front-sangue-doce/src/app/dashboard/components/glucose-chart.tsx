import { glucosePoints, glucoseTimes, glucoseValues } from "../dashboard.data";

export function GlucoseChart() {
  const width = 560;
  const height = 150;
  const padX = 10;
  const padTop = 16;
  const padBottom = 28;
  const min = 60;
  const max = 160;
  const targetLow = 70;
  const targetHigh = 140;

  const getX = (index: number) => padX + (index / (glucoseValues.length - 1)) * (width - padX * 2);
  const getY = (value: number) =>
    padTop + (1 - (value - min) / (max - min)) * (height - padTop - padBottom);

  const line = glucosePoints
    .map(
      (point) =>
        `${point.index === 0 ? "M" : "L"}${getX(point.index).toFixed(1)},${getY(point.value).toFixed(1)}`,
    )
    .join(" ");
  const area = `${line} L${getX(glucoseValues.length - 1).toFixed(1)},${height - padBottom} L${getX(0).toFixed(1)},${height - padBottom} Z`;

  return (
    <svg
      aria-label="Grafico de glicemia nas ultimas 24 horas"
      className="mt-5 h-[150px] w-full overflow-visible"
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
      {glucosePoints.map((point) => (
        <circle
          cx={getX(point.index)}
          cy={getY(point.value)}
          fill={point.index === glucoseValues.length - 1 ? "#2f5d3c" : "#fffdf8"}
          key={point.id}
          r={point.index === glucoseValues.length - 1 ? 4.5 : 2.8}
          stroke="#3f7a4f"
          strokeWidth="1.6"
        />
      ))}
      {glucoseTimes.map((time, index) => (
        <text
          fill="#79705f"
          fontFamily="Hanken Grotesk, system-ui, sans-serif"
          fontSize="10"
          key={time}
          textAnchor="middle"
          x={getX(index)}
          y={height - 7}
        >
          {time}
        </text>
      ))}
    </svg>
  );
}
