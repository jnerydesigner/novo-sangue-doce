import { InjectQueue } from "@nestjs/bullmq";
import { Injectable } from "@nestjs/common";
import type { Queue } from "bullmq";

export const FOODS_IMAGES_QUEUE = "foods-images";
export const PROCESS_FOOD_IMAGE_JOB = "process-food-image";

@Injectable()
export class FoodsImagesQueue {
  constructor(@InjectQueue(FOODS_IMAGES_QUEUE) private readonly queue: Queue) {}
  async add(foodId: number) {
    return this.queue.add(PROCESS_FOOD_IMAGE_JOB, { foodId }, { attempts: 3, backoff: { type: "exponential", delay: 10_000 }, removeOnComplete: true, removeOnFail: false });
  }
}
