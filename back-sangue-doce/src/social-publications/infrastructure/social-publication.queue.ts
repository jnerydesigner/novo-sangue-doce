import type { SocialPublicationJobData } from "@app/social-publications/types";
import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";

export const SOCIAL_PUBLICATION_QUEUE = "social-publication";
export const GENERATE_SOCIAL_PUBLICATION_JOB = "generate-social-publication";

@Injectable()
export class SocialPublicationProducer {
  constructor(
    @InjectQueue(SOCIAL_PUBLICATION_QUEUE)
    private readonly socialPublicationQueue: Queue,
  ) {}

  async enqueueGeneration(data: SocialPublicationJobData, jobId: string) {
    return this.socialPublicationQueue.add(GENERATE_SOCIAL_PUBLICATION_JOB, data, {
      jobId,
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5_000,
      },
      removeOnComplete: {
        age: 60 * 60 * 24 * 7,
        count: 1_000,
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 30,
      },
    });
  }
}
