import type { SensorManufacturer } from "./enums/sensor-manufacturer.enum";
import type { PublicMeasurement } from "./measurements.service";

export type MeasurementReportImportJobData = {
  fileBase64: string;
  mimetype: string;
  originalName?: string;
  sensorManufacturer: SensorManufacturer;
  size: number;
  userId: string;
};

export type QueuedMeasurementReportImport = {
  jobId: string;
  status: "queued";
};

export type MeasurementReportImportResult = {
  importedCount: number;
  measurements: PublicMeasurement[];
};

export type MeasurementReportImportJobStatus = {
  error?: string;
  importedCount?: number;
  jobId: string;
  progress: number;
  status: "queued" | "processing" | "completed" | "failed" | "unknown";
};
