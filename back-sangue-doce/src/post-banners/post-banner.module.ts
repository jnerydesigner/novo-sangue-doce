import { ImageModule } from "@app/image/image.module";
import { SocialPublicationsModule } from "@app/social-publications/social-publications.module";
import { AwsS3Module } from "@infra/storage/aws-s3.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { PostBannerController } from "./post-banner.controller";
import { PostBannerProcessor } from "./post-banner.processor";
import { POST_BANNER_QUEUE, PostBannerQueue } from "./post-banner.queue";
import { PostBannerService } from "./post-banner.service";

@Module({
  imports: [
    BullModule.registerQueue({ name: POST_BANNER_QUEUE }),
    AwsS3Module,
    ImageModule,
    SocialPublicationsModule,
  ],
  controllers: [PostBannerController],
  providers: [PostBannerQueue, PostBannerService, PostBannerProcessor],
})
export class PostBannerModule {}
