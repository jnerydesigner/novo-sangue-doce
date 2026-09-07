import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Job } from "bullmq";
import { MEASUREMENT_REPORT_IMPORT_QUEUE } from "./measurement-report-import.constants";
import { MeasurementsService } from "./measurements.service";
import type { MeasurementReportImportJobData, MeasurementReportImportResult } from "./types";

@Injectable()
@Processor(MEASUREMENT_REPORT_IMPORT_QUEUE)
export class MeasurementReportImportWorker extends WorkerHost {
  constructor(private readonly measurementsService: MeasurementsService) {
    super();
  }

  async process(job: Job<MeasurementReportImportJobData>): Promise<MeasurementReportImportResult> {
    await job.updateProgress(10);

    const file = {
      buffer: Buffer.from(job.data.fileBase64, "base64"),
      mimetype: job.data.mimetype,
      originalname: job.data.originalName,
      size: job.data.size,
    };

    await job.updateProgress(25);

    const measurements = await this.measurementsService.readSmartReport(
      { user: { sub: job.data.userId } } as never,
      file,
      job.data.sensorManufacturer,
    );

    await job.updateProgress(100);

    return {
      importedCount: measurements.length,
      measurements,
    };
  }
}
