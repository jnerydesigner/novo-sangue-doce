import type { SocialPublicationJobData } from "@app/social-publications/types";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { ProcessSocialPublicationUseCase } from "./process-social-publication.use-case";
import { SOCIAL_PUBLICATION_QUEUE } from "./social-publication.queue";

@Injectable()
@Processor(SOCIAL_PUBLICATION_QUEUE, { concurrency: 2 })
export class SocialPublicationProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialPublicationProcessor.name);

  constructor(private readonly processSocialPublicationUseCase: ProcessSocialPublicationUseCase) {
    super();
  }

  async process(job: Job<SocialPublicationJobData>): Promise<void> {
    this.logger.log(
      `Processing social publication job=${job.id} postId=${job.data.postId} attempt=${job.attemptsMade + 1}`,
    );

    await job.updateProgress(10);

    await this.processSocialPublicationUseCase.execute({
      socialPublicationId: job.data.socialPublicationId,
      postId: job.data.postId,
      correlationId: job.data.correlationId,
      requestedBy: job.data.requestedBy,
      attempt: job.attemptsMade + 1,
    });

    await job.updateProgress(100);

    this.logger.log(`Social publication job completed job=${job.id} postId=${job.data.postId}`);
  }
}
