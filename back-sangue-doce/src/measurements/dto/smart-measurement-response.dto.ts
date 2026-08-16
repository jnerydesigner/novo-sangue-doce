import type { MeasurementNoteType, MeasurementReadingContext } from "../measurement.constants";

export interface SmartMeasurementResponseDto {
  ok: boolean;
  measurement: Measurement | null;
  evidence: Evidence;
  warnings: any[];
}

export interface Measurement {
  measuredAt: string;
  glucoseValueMgDl: number;
  readingContext: MeasurementReadingContext;
  source: "MANUAL" | "SENSOR" | "IMPORT";
  noteType: MeasurementNoteType;
  timeZone: string;
}

export interface Evidence {
  currentReadingMgDl: number;
  date: string;
  estimatedReadingTime: string;
  estimatedTimeConfidence: string;
  whatsappFilenameTimestamp: any;
  sentAt: string;
  foundTimes: string[];
  foundReadingsMgDl: number[];
  ocrText: string;
}
