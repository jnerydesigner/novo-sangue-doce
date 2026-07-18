import {
  type ScheduledSocialPublicationJobData,
  type SocialPublicationJobData,
} from "@app/social-publications/types";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { SocialPublicationRepository } from "../domain/social-publication.repository";
import { LinkedinService } from "./linkedin.service";
import { ProcessSocialPublicationUseCase } from "./process-social-publication.use-case";
import {
  GENERATE_SOCIAL_PUBLICATION_JOB,
  PUBLISH_SCHEDULED_SOCIAL_PUBLICATION_JOB,
  SOCIAL_PUBLICATION_QUEUE,
} from "./social-publication.queue";

@Injectable()
@Processor(SOCIAL_PUBLICATION_QUEUE, { concurrency: 2 })
export class SocialPublicationProcessor extends WorkerHost {
  private readonly logger = new Logger(SocialPublicationProcessor.name);

  constructor(
    private readonly processSocialPublicationUseCase: ProcessSocialPublicationUseCase,
    private readonly linkedinService: LinkedinService,
    private readonly socialPublicationRepository: SocialPublicationRepository,
  ) {
    super();
  }

  async process(
    job: Job<SocialPublicationJobData | ScheduledSocialPublicationJobData>,
  ): Promise<void> {
    if (job.name === PUBLISH_SCHEDULED_SOCIAL_PUBLICATION_JOB) {
      await this.publishScheduled(job as Job<ScheduledSocialPublicationJobData>);
      return;
    }

    if (job.name !== GENERATE_SOCIAL_PUBLICATION_JOB) {
      this.logger.warn(`Ignoring unknown social publication job=${job.name} id=${job.id}`);
      return;
    }

    await this.generate(job as Job<SocialPublicationJobData>);
  }

  private async generate(job: Job<SocialPublicationJobData>): Promise<void> {
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

  private async publishScheduled(job: Job<ScheduledSocialPublicationJobData>): Promise<void> {
    this.logger.log(
      `Publishing scheduled social publication job=${job.id} socialPublicationId=${job.data.socialPublicationId} attempt=${job.attemptsMade + 1}`,
    );

    await job.updateProgress(10);

    await this.linkedinService.publishCompleted(job.data.socialPublicationId);
    await this.socialPublicationRepository.markScheduleDispatched(job.data.socialPublicationId);

    await job.updateProgress(100);

    this.logger.log(
      `Scheduled social publication completed job=${job.id} socialPublicationId=${job.data.socialPublicationId}`,
    );
  }
}
