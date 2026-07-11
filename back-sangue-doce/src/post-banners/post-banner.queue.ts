import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";

export const POST_BANNER_QUEUE = "post-banner";
export const GENERATE_POST_BANNER_JOB = "generate-post-banner";

export type PostBannerJobData = {
  postId: string;
  requestedBy: string;
};

@Injectable()
export class PostBannerQueue {
  constructor(@InjectQueue(POST_BANNER_QUEUE) private readonly queue: Queue<PostBannerJobData>) {}

  enqueue(data: PostBannerJobData) {
    return this.queue.add(GENERATE_POST_BANNER_JOB, data, {
      attempts: 3,
      backoff: { type: "exponential", delay: 5_000 },
      removeOnComplete: { age: 60 * 60 * 24, count: 500 },
      removeOnFail: { age: 60 * 60 * 24 * 7 },
    });
  }

  getJob(jobId: string) {
    return this.queue.getJob(jobId);
  }
}
