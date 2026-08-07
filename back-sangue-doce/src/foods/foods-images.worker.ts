import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Injectable, Logger } from "@nestjs/common";
import type { Job } from "bullmq";
import { FoodImagesService } from "./food-images.service";
import { FOODS_IMAGES_QUEUE } from "./foods-images.queue";

@Injectable()
@Processor(FOODS_IMAGES_QUEUE, { concurrency: 1 })
export class FoodsImagesWorker extends WorkerHost {
  private readonly logger = new Logger(FoodsImagesWorker.name);
  constructor(private readonly foodImagesService: FoodImagesService) { super(); }
  async process(job: Job<{ foodId: number }>) {
    const result = await this.foodImagesService.findAndAttach(job.data.foodId);
    this.logger.log(`Imagem do alimento ${job.data.foodId} processada com sucesso.`);
    return result;
  }
}
