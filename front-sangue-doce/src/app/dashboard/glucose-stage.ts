export type GlucoseStage = {
  label: string;
  description: string;
  range: string;
  color: string;
  isNormal?: boolean;
  min?: number;
  max?: number;
};

export const GLUCOSE_STAGES: GlucoseStage[] = [
  {
    label: "Abaixo de 79",
    description: "Nivel preocupante",
    range: "(< 79 mg/dL)",
    color: "#ef1d12",
    max: 79,
  },
  {
    label: "Entre 80 e 120",
    description: "Nivel normal",
    range: "(80 - 120 mg/dL)",
    color: "#159455",
    isNormal: true,
    min: 80,
    max: 120,
  },
  {
    label: "Entre 121 e 180",
    description: "Acima da meta",
    range: "(121 - 180 mg/dL)",
    color: "#ff7a00",
    min: 121,
    max: 180,
  },
  {
    label: "Entre 181 e 250",
    description: "Elevada",
    range: "(181 - 250 mg/dL)",
    color: "#f04012",
    min: 181,
    max: 250,
  },
  {
    label: "Entre 251 e 300",
    description: "Muito elevada",
    range: "(251 - 300 mg/dL)",
    color: "#d60000",
    min: 251,
    max: 300,
  },
  {
    label: "Acima de 300",
    description: "Criticamente elevada",
    range: "(> 300 mg/dL)",
    color: "#98080c",
    min: 301,
  },
];

export function getGlucoseStage(value: number): GlucoseStage {
  return (
    GLUCOSE_STAGES.find((stage) => {
      const aboveMin = stage.min === undefined || value >= stage.min;
      const belowMax = stage.max === undefined || value <= stage.max;
      return aboveMin && belowMax;
    }) ?? GLUCOSE_STAGES[GLUCOSE_STAGES.length - 1]
  );
}

export function getGlucoseStageTone(value: number) {
  const stage = getGlucoseStage(value);

  return {
    backgroundColor: `${stage.color}1A`,
    borderColor: `${stage.color}55`,
    color: stage.color,
  };
}
