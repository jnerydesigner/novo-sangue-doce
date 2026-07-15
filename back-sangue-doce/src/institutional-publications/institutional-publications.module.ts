import { ImageModule } from "@app/image/image.module";
import { AwsS3Module } from "@infra/storage/aws-s3.module";
import { Module } from "@nestjs/common";
import { InstitutionalPublicationsController } from "./institutional-publications.controller";
import { InstitutionalPublicationsService } from "./institutional-publications.service";

@Module({
  imports: [AwsS3Module, ImageModule],
  controllers: [InstitutionalPublicationsController],
  providers: [InstitutionalPublicationsService],
})
export class InstitutionalPublicationsModule {}
