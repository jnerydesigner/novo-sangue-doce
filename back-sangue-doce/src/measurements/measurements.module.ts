import { AuthModule } from "@app/auth/auth.module";
import { UsersModule } from "@app/users/users.module";
import { Module } from "@nestjs/common";
import { MeasurementReportPdfService } from "./measurement-report-pdf.service";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsService } from "./measurements.service";
import { HttpModule } from "@nestjs/axios";
import { MeasurementSmartService } from "./measurement-smart.service";

@Module({
  imports: [AuthModule, UsersModule, HttpModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementReportPdfService, MeasurementSmartService],
})
export class MeasurementsModule {}
