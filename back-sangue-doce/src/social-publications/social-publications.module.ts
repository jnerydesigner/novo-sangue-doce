 
import { ImageModule } from "@app/image/image.module";
import { PostsModule } from "@app/posts/posts.module";
import { AwsS3Module } from "@infra/storage/aws-s3.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { LlmImageGateway } from "./infrastructure/gateways/llm-image.gateway";
import { LlmTextGateway } from "./infrastructure/gateways/llm-text.gateway";
import { InstagramController } from "./infrastructure/instagram.controller";
import { InstagramService } from "./infrastructure/instagram.service";
import { LinkedinController } from "./infrastructure/linkedin.controller";
import { LinkedinService } from "./infrastructure/linkedin.service";
import { ProcessSocialPublicationUseCase } from "./infrastructure/process-social-publication.use-case";
import { SocialPublicationController } from "./infrastructure/social-publication.controller";
import { SocialPublicationProcessor } from "./infrastructure/social-publication.processor";
import {
  SOCIAL_PUBLICATION_QUEUE,
  SocialPublicationProducer,
} from "./infrastructure/social-publication.queue";
import { SocialPublicationService } from "./infrastructure/social-publication.service";

@Module({
  imports: [
    BullModule.registerQueue({
      name: SOCIAL_PUBLICATION_QUEUE,
    }),
    AwsS3Module,
    ImageModule,
    PostsModule,
  ],
  controllers: [SocialPublicationController, LinkedinController, InstagramController],
  providers: [
    SocialPublicationProducer,
    SocialPublicationProcessor,
    SocialPublicationService,
    ProcessSocialPublicationUseCase,
    LlmTextGateway,
    LlmImageGateway,
    LinkedinService,
    InstagramService,
  ],
  exports: [SocialPublicationService, LlmImageGateway, LlmTextGateway],
})
export class SocialPublicationsModule {}
