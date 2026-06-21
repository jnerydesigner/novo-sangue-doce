export const READING_CONTEXTS = [
  'FASTING',
  'BEFORE_MEAL',
  'AFTER_MEAL',
  'BEDTIME',
  'EXERCISE',
  'MANUAL',
  'RANDOM',
] as const;

export const MEASUREMENT_SOURCES = ['MANUAL', 'SENSOR', 'IMPORT'] as const;

export const MEASUREMENT_NOTE_TYPES = [
  'FASTING_WAKE_UP',
  'BEFORE_BREAKFAST',
  'AFTER_BREAKFAST',
  'MORNING_RANDOM_CHECK',
  'BEFORE_LUNCH',
  'AFTER_LUNCH',
  'AFTERNOON_RANDOM_CHECK',
  'BEFORE_DINNER',
  'AFTER_DINNER',
  'BEFORE_SLEEP',
  'NIGHT_RANDOM_CHECK',
  'BEFORE_EXERCISE',
  'AFTER_EXERCISE',
  'FEELING_UNWELL',
  'ROUTINE_CHECK',
  'DAWN_RANDOM_CHECK',
] as const;

export type MeasurementReadingContext = (typeof READING_CONTEXTS)[number];
export type MeasurementNoteType = (typeof MEASUREMENT_NOTE_TYPES)[number];

export const MEASUREMENT_NOTE_LABELS: Record<MeasurementNoteType, string> = {
  FASTING_WAKE_UP: 'Jejum ao acordar',
  BEFORE_BREAKFAST: 'Antes do cafe da manha',
  AFTER_BREAKFAST: 'Depois do cafe da manha',
  MORNING_RANDOM_CHECK: 'Medicao aleatoria pela manha',
  BEFORE_LUNCH: 'Antes do almoco',
  AFTER_LUNCH: 'Depois do almoco',
  AFTERNOON_RANDOM_CHECK: 'Medicao aleatoria a tarde',
  BEFORE_DINNER: 'Antes do jantar',
  AFTER_DINNER: 'Depois do jantar',
  BEFORE_SLEEP: 'Antes de dormir',
  NIGHT_RANDOM_CHECK: 'Medicao aleatoria a noite',
  BEFORE_EXERCISE: 'Antes do exercicio',
  AFTER_EXERCISE: 'Depois do exercicio',
  FEELING_UNWELL: 'Sentindo mal-estar',
  ROUTINE_CHECK: 'Medicao de rotina',
  DAWN_RANDOM_CHECK: 'Medicao aleatoria na madrugada',
};

type MeasurementMomentRule = {
  startMinute: number;
  endMinute: number;
  readingContext: MeasurementReadingContext;
  noteType: MeasurementNoteType;
};

const MEASUREMENT_MOMENT_RULES: MeasurementMomentRule[] = [
  {
    startMinute: 0,
    endMinute: 359,
    readingContext: 'RANDOM',
    noteType: 'DAWN_RANDOM_CHECK',
  },
  {
    startMinute: 360,
    endMinute: 479,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_BREAKFAST',
  },
  {
    startMinute: 480,
    endMinute: 659,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_BREAKFAST',
  },
  {
    startMinute: 660,
    endMinute: 749,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_LUNCH',
  },
  {
    startMinute: 750,
    endMinute: 839,
    readingContext: 'AFTER_MEAL',
    noteType: 'AFTER_LUNCH',
  },
  {
    startMinute: 840,
    endMinute: 1079,
    readingContext: 'RANDOM',
    noteType: 'AFTERNOON_RANDOM_CHECK',
  },
  {
    startMinute: 1080,
    endMinute: 1199,
    readingContext: 'BEFORE_MEAL',
    noteType: 'BEFORE_DINNER',
  },
  {
    startMinute: 1200,
    endMinute: 1439,
    readingContext: 'BEDTIME',
    noteType: 'BEFORE_SLEEP',
  },
];

export function classifyMeasurementMoment(
  measuredAt: Date,
  timeZone = 'America/Sao_Paulo',
): {
  readingContext: MeasurementReadingContext;
  noteType: MeasurementNoteType;
} {
  const measuredTime = getTimePartsInTimeZone(measuredAt, timeZone);
  const measuredMinute = measuredTime.hour * 60 + measuredTime.minute;
  const rule = MEASUREMENT_MOMENT_RULES.find(
    (item) =>
      measuredMinute >= item.startMinute && measuredMinute <= item.endMinute,
  );

  if (!rule) {
    return { readingContext: 'RANDOM', noteType: 'ROUTINE_CHECK' };
  }

  return {
    readingContext: rule.readingContext,
    noteType: rule.noteType,
  };
}

function getTimePartsInTimeZone(
  date: Date,
  timeZone: string,
): { hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    hourCycle: 'h23',
    minute: '2-digit',
    timeZone,
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, part.value]),
  );

  return {
    hour: Number(values.hour),
    minute: Number(values.minute),
  };
}
