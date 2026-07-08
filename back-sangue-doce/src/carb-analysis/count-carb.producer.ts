import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";
import { COUNT_CARB_ANALYZE_JOB, COUNT_CARB_QUEUE } from "./count-carb.constants";
import type { CountCarbJobData } from "./types";

@Injectable()
export class CountCarbProducer {
  constructor(@InjectQueue(COUNT_CARB_QUEUE) private readonly countCarbQueue: Queue) {}

  async enqueueAnalysis(data: CountCarbJobData) {
    return this.countCarbQueue.add(COUNT_CARB_ANALYZE_JOB, data, {
      attempts: 3,
      backoff: {
        delay: 30_000,
        type: "exponential",
      },
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
}
