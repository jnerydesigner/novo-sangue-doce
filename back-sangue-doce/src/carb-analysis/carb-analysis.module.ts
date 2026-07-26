import { AwsS3Module } from "@infra/storage/aws-s3.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { MailModule } from "@app/mail/mail.module";
import { CarbAnalysisController } from "./carb-analysis.controller";
import { CarbAnalysisService } from "./carb-analysis.service";
import { CarbAnalysisReportPdfService } from "./carb-analysis-report-pdf.service";
import { AnthropicCarbAnalysisService } from "./anthropic-carb-analysis.service";
import { COUNT_CARB_QUEUE } from "./count-carb.constants";
import { CountCarbProducer } from "./count-carb.producer";
import { CountCarbWorker } from "./count-carb.worker";

@Module({
  imports: [
    BullModule.registerQueue({
      name: COUNT_CARB_QUEUE,
    }),
    AwsS3Module,
    MailModule,
  ],
  controllers: [CarbAnalysisController],
  providers: [
    AnthropicCarbAnalysisService,
    CarbAnalysisService,
    CarbAnalysisReportPdfService,
    CountCarbProducer,
    CountCarbWorker,
  ],
})
export class CarbAnalysisModule {}
