import { Processor, WorkerHost } from "@nestjs/bullmq";
import type { Job } from "bullmq";
import { POST_BANNER_QUEUE, type PostBannerJobData } from "./post-banner.queue";
import { PostBannerService } from "./post-banner.service";

@Processor(POST_BANNER_QUEUE, { concurrency: 2 })
export class PostBannerProcessor extends WorkerHost {
  constructor(private readonly service: PostBannerService) {
    super();
  }

  process(job: Job<PostBannerJobData>) {
    return this.service.process(job.data.postId, (progress) => job.updateProgress(progress));
  }
}
