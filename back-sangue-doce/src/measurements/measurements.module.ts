import { AuthModule } from "@app/auth/auth.module";
import { UsersModule } from "@app/users/users.module";
import { Module } from "@nestjs/common";
import { MeasurementReportPdfService } from "./measurement-report-pdf.service";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsService } from "./measurements.service";

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, MeasurementReportPdfService],
})
export class MeasurementsModule {}
