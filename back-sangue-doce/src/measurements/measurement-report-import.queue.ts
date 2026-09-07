import { randomUUID } from "node:crypto";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";
import {
  MEASUREMENT_REPORT_IMPORT_JOB,
  MEASUREMENT_REPORT_IMPORT_QUEUE,
} from "./measurement-report-import.constants";
import type { MeasurementReportImportJobData } from "./types";

@Injectable()
export class MeasurementReportImportQueue {
  constructor(
    @InjectQueue(MEASUREMENT_REPORT_IMPORT_QUEUE)
    private readonly queue: Queue<MeasurementReportImportJobData>,
  ) {}

  async enqueue(data: MeasurementReportImportJobData) {
    return this.queue.add(MEASUREMENT_REPORT_IMPORT_JOB, data, {
      attempts: 3,
      backoff: {
        delay: 30_000,
        type: "exponential",
      },
      jobId: randomUUID(),
      removeOnComplete: {
        age: 60 * 60 * 24 * 7,
        count: 500,
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 14,
        count: 500,
      },
    });
  }

  async getJob(jobId: string) {
    return this.queue.getJob(jobId);
  }
}
