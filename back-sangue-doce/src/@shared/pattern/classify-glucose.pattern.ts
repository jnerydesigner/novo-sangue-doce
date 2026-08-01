type MeasurementResult = {
  status: "VERY_LOW" | "LOW" | "IN_RANGE" | "HIGH" | "VERY_HIGH";
  label: string;
  color: string;
};

const glucoseRules = [
  {
    match: (value: number) => value < 54,
    result: { status: "VERY_LOW", label: "Muito baixa", color: "#F72900" },
  },
  {
    match: (value: number) => value < 70,
    result: { status: "LOW", label: "Baixa", color: "#F7A200" },
  },
  {
    match: (value: number) => value <= 180,
    result: { status: "IN_RANGE", label: "Dentro da faixa", color: "#00B200" },
  },
  {
    match: (value: number) => value <= 250,
    result: { status: "HIGH", label: "Alta", color: "#F7A200" },
  },
  {
    match: (value: number) => value > 250,
    result: { status: "VERY_HIGH", label: "Muito alta", color: "#F72900" },
  },
] satisfies Array<{
  match: (value: number) => boolean;
  result: MeasurementResult;
}>;

export function classifyGlucose(value: number): MeasurementResult {
  const rule = glucoseRules.find((rule) => rule.match(value));

  if (!rule) {
    throw new Error("Invalid glucose value");
  }

  return rule.result;
}
