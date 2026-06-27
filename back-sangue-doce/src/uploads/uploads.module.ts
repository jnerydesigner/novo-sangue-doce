import { ImageModule } from "@app/image/image.module";
import { Module } from "@nestjs/common";
import { UploadsController } from "./uploads.controller";
import { UploadsService } from "./uploads.service";

@Module({
  imports: [ImageModule],
  controllers: [UploadsController],
  providers: [UploadsService],
})
export class UploadsModule {}
