import type { CreateMeasurementDto } from "../dto/create-measurement.dto";
import type { SmartMeasurementReportResponseDto } from "../dto/smart-measurement-response.dto";
import {
  MEASUREMENT_NOTE_SCHEDULE,
  type MeasurementNoteType,
  type MeasurementReadingContext,
} from "../measurement.constants";

const MAX_DISTANCE_FROM_TARGET_MINUTES = 30;

const REPORT_NOTE_TYPES = [
  "BEFORE_BREAKFAST",
  "AFTER_BREAKFAST",
  "BEFORE_LUNCH",
  "AFTER_LUNCH",
  "BEFORE_DINNER",
  "AFTER_DINNER",
] as const satisfies readonly MeasurementNoteType[];

type CandidateMeasurement = {
  measuredAt: string;
  glucoseValueMgDl: number;
  day: string;
  minuteOfDay: number;
};

export class ReportSmartMapper {
  static mapSmartReportToMeasurements(
    smartReport: SmartMeasurementReportResponseDto,
  ): CreateMeasurementDto[] {
    const candidates = smartReport.measurements.flatMap((smartMeasurement) => {
      const parsed = this.parseSmartMeasuredAt(smartMeasurement.measured_at);

      if (!parsed) return [];

      return [
        {
          measuredAt: this.toLocalIsoDateTime(smartMeasurement.measured_at),
          glucoseValueMgDl: smartMeasurement.glucose_value_mg_dl,
          ...parsed,
        },
      ];
    });
    const candidatesByDay = new Map<string, CandidateMeasurement[]>();
    for (const candidate of candidates) {
      candidatesByDay.set(candidate.day, [...(candidatesByDay.get(candidate.day) ?? []), candidate]);
    }

    return [...candidatesByDay.values()].flatMap((dayCandidates) =>
      this.pickScheduledMeasurementsForDay(dayCandidates),
    );
  }

  private static pickScheduledMeasurementsForDay(
    candidates: CandidateMeasurement[],
  ): CreateMeasurementDto[] {
    return REPORT_NOTE_TYPES.flatMap((noteType) => {
      const schedule = MEASUREMENT_NOTE_SCHEDULE[noteType];
      if (!schedule) return [];

      const targetMinute = schedule.hour * 60 + schedule.minute;
      const closest = candidates
        .map((candidate) => ({
          candidate,
          distance: Math.abs(candidate.minuteOfDay - targetMinute),
        }))
        .filter(({ distance }) => distance <= MAX_DISTANCE_FROM_TARGET_MINUTES)
        .sort((left, right) => left.distance - right.distance)[0];

      if (!closest) return [];

      return [
        {
          measuredAt: closest.candidate.measuredAt,
          glucoseValueMgDl: closest.candidate.glucoseValueMgDl,
          readingContext: this.getReadingContext(noteType),
          source: "IMPORT",
          noteType,
          timeZone: "America/Manaus",
        },
      ];
    });
  }

  private static parseSmartMeasuredAt(
    measuredAt: string,
  ): Pick<CandidateMeasurement, "day" | "minuteOfDay"> | null {
    const match = measuredAt.match(/^(\d{4}-\d{2}-\d{2}) (\d{2}):(\d{2}):\d{2}\.\d{3}$/);

    if (!match) return null;

    const [, day, hour, minute] = match;

    return {
      day,
      minuteOfDay: Number(hour) * 60 + Number(minute),
    };
  }

  private static toLocalIsoDateTime(measuredAt: string): string {
    return measuredAt.replace(" ", "T");
  }

  private static getReadingContext(noteType: MeasurementNoteType): MeasurementReadingContext {
    if (noteType === "FASTING_WAKE_UP") return "FASTING";
    if (["BEFORE_BREAKFAST", "BEFORE_LUNCH", "BEFORE_DINNER"].includes(noteType)) {
      return "BEFORE_MEAL";
    }
    if (["AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"].includes(noteType)) {
      return "AFTER_MEAL";
    }
    if (noteType === "BEFORE_SLEEP") return "BEDTIME";
    if (["BEFORE_EXERCISE", "AFTER_EXERCISE"].includes(noteType)) return "EXERCISE";
    return ["FEELING_UNWELL", "ROUTINE_CHECK"].includes(noteType) ? "MANUAL" : "RANDOM";
  }
}
