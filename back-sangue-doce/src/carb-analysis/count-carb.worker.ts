import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Job } from "bullmq";
import { CarbAnalysisService } from "./carb-analysis.service";
import { COUNT_CARB_QUEUE } from "./count-carb.constants";
import type { CountCarbJobData } from "./types";

@Injectable()
@Processor(COUNT_CARB_QUEUE)
export class CountCarbWorker extends WorkerHost {
  constructor(private readonly carbAnalysisService: CarbAnalysisService) {
    super();
  }

  async process(job: Job<CountCarbJobData>) {
    await job.updateProgress(10);
    const analysis = await this.carbAnalysisService.processQueuedAnalysis(job.data, String(job.id));
    await job.updateProgress(100);

    return { analysisId: analysis.id };
  }
}
