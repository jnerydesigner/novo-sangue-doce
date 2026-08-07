import { ImageService } from '@app/image/image.service';
import { AwsS3Module } from '@infra/storage/aws-s3.module';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { FoodImagesController } from './food-images.controller';
import { FoodImagesService } from './food-images.service';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { FOODS_IMAGES_QUEUE, FoodsImagesQueue } from './foods-images.queue';
import { FoodsImagesWorker } from './foods-images.worker';
import { FoodConsumptionsController } from './food-consumptions.controller';
import { FoodConsumptionsService } from './food-consumptions.service';

@Module({
    imports: [AwsS3Module, BullModule.registerQueue({ name: FOODS_IMAGES_QUEUE })],
    controllers: [
        FoodsController, FoodImagesController, FoodConsumptionsController],
    providers: [
        FoodsService, FoodImagesService, ImageService, FoodsImagesQueue, FoodsImagesWorker, FoodConsumptionsService],
})
export class FoodsModule { }
