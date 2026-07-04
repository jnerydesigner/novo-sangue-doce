import { AuthModule } from "@app/auth/auth.module";
import { AwsS3Module } from "@infra/storage/aws-s3.module";
import { ImageModule } from "@app/image/image.module";
import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  imports: [AuthModule, AwsS3Module, ImageModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
