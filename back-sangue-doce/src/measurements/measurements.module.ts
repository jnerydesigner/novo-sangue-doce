import { AuthService } from "@app/auth/auth.service";
import { UsersModule } from "@app/users/users.module";
import { Module } from "@nestjs/common";
import { MeasurementReportPdfService } from "./measurement-report-pdf.service";
import { MeasurementsController } from "./measurements.controller";
import { MeasurementsService } from "./measurements.service";

@Module({
  imports: [UsersModule],
  controllers: [MeasurementsController],
  providers: [MeasurementsService, AuthService, MeasurementReportPdfService],
})
export class MeasurementsModule {}
