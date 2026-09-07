import { AuthModule } from "@app/auth/auth.module";
import { UsersModule } from "@app/users/users.module";
import { BullModule } from "@nestjs/bullmq";
import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { MEASUREMENT_REPORT_IMPORT_QUEUE } from "./measurement-report-import.constants";
import { MeasurementReportImportQueue } from "./measurement-report-import.queue";
import { MeasurementReportImportWorker } from "./measurement-report-import.worker";
import { MeasurementReportPdfService } from "./measurement-report-pdf.service";
import { MeasurementSmartService } from "./measurement-smart.service";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsService } from "./measurements.service";

@Module({
  imports: [
    AuthModule,
    UsersModule,
    HttpModule,
    BullModule.registerQueue({
      name: MEASUREMENT_REPORT_IMPORT_QUEUE,
    }),
  ],
  controllers: [MeasurementsController],
  providers: [
    MeasurementsService,
    MeasurementReportPdfService,
    MeasurementSmartService,
    MeasurementReportImportQueue,
    MeasurementReportImportWorker,
  ],
})
export class MeasurementsModule {}
