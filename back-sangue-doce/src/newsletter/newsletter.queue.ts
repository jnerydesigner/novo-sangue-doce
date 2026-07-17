import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";

export const NEWSLETTER_QUEUE = "newsletter";
export const SEND_CONFIRMATION_JOB = "send-confirmation";

export type NewsletterConfirmationJob = { subscriberId: string; token: string };

@Injectable()
export class NewsletterQueue {
  constructor(@InjectQueue(NEWSLETTER_QUEUE) private readonly queue: Queue<NewsletterConfirmationJob>) {}

  enqueueConfirmation(data: NewsletterConfirmationJob) {
    return this.queue.add(SEND_CONFIRMATION_JOB, data, {
      jobId: `newsletter-confirmation:${data.subscriberId}`,
      attempts: 5,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { age: 86_400, count: 500 },
      removeOnFail: { age: 604_800 },
    });
  }
}
