import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UseGuards,
  Delete,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import type { Response } from "express";
import type { CreateMeasurementDto } from "./dto/create-measurement.dto";
import type { UpdateMeasurementDto } from "./dto/update-measurement.dto";
import { MeasurementReportPdfService } from "./measurement-report-pdf.service";
import {
  MeasurementsService,
  type MonthlyMeasurementReport,
  type PublicMeasurement,
} from "./measurements.service";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { UploadedImageFile } from "@app/uploads/types/uploaded-image-file.type";

type MeasurementUploadFiles = {
  image?: UploadedImageFile[];
  file?: UploadedImageFile[];
};

@Controller("measurements")
export class MeasurementsController {
  constructor(
    private readonly measurementsService: MeasurementsService,
    private readonly measurementReportPdfService: MeasurementReportPdfService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createMeasurementDto: CreateMeasurementDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    return this.measurementsService.create(req, createMeasurementDto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard)
  update(
    @Param("id") id: string,
    @Body() updateMeasurementDto: UpdateMeasurementDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    return this.measurementsService.update(req, id, updateMeasurementDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<PublicMeasurement[]> {
    return this.measurementsService.findAll(req, startDate, endDate);
  }

  @Get("today")
  @UseGuards(AuthGuard)
  findToday(
    @Request() req: AuthenticatedRequest,
    @Query("timeZone") timeZone?: string,
  ): Promise<PublicMeasurement[]> {
    return this.measurementsService.findToday(req, timeZone);
  }

  @Get("reports/monthly")
  @UseGuards(AuthGuard)
  getMonthlyFormalReport(
    @Request() req: AuthenticatedRequest,
    @Query("year") year?: string,
    @Query("month") month?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ): Promise<MonthlyMeasurementReport> {
    return this.measurementsService.getMonthlyFormalReport(req, year, month, startDate, endDate);
  }

  @Get("reports/monthly.pdf")
  @UseGuards(AuthGuard)
  async getMonthlyFormalReportPdf(
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query("year") year?: string,
    @Query("month") month?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("birthDate") birthDate?: string,
    @Query("diabetesType") diabetesType?: string,
    @Query("reportUrl") reportUrl?: string,
  ) {
    const report = await this.measurementsService.getMonthlyFormalReport(
      req,
      year,
      month,
      startDate,
      endDate,
    );
    const pdf = await this.measurementReportPdfService.generateMonthlyReportPdf({
      birthDate,
      diabetesType,
      report,
      reportUrl,
    });
    const firstReportDay = report.days[0]?.date;
    const lastReportDay = report.days.at(-1)?.date;
    const filePeriod =
      firstReportDay && lastReportDay
        ? `${firstReportDay}-${lastReportDay}`
        : `${report.year}-${String(report.month).padStart(2, "0")}`;

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="relatorio-glicemia-${filePeriod}.pdf"`,
    );
    res.setHeader("Content-Length", pdf.length);

    return res.send(pdf);
  }

  @Get("reports/monthly.png")
  @UseGuards(AuthGuard)
  async getMonthlyFormalReportImage(
    @Request() req: AuthenticatedRequest,
    @Res() res: Response,
    @Query("year") year?: string,
    @Query("month") month?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
    @Query("birthDate") birthDate?: string,
    @Query("diabetesType") diabetesType?: string,
    @Query("reportUrl") reportUrl?: string,
  ) {
    const report = await this.measurementsService.getMonthlyFormalReport(
      req,
      year,
      month,
      startDate,
      endDate,
    );
    const image = await this.measurementReportPdfService.generateMonthlyReportImage({
      birthDate,
      diabetesType,
      report,
      reportUrl,
    });
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Content-Disposition", 'attachment; filename="relatorio-glicemia.png"');
    res.setHeader("Content-Length", image.length);
    return res.send(image);
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  findOne(
    @Param("id") id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    return this.measurementsService.findOne(req, id);
  }

  @Delete(":id/measurement")
  @UseGuards(AuthGuard)
  delete(
    @Param("id") id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement[]> {
    return this.measurementsService.delete(req, id);
  }

  @Post("upload/image/measurement")
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: "image", maxCount: 1 },
        { name: "file", maxCount: 1 },
      ],
      {
        limits: {
          fileSize: 5 * 1024 * 1024,
        },
      },
    ),
  )
  @UseGuards(AuthGuard)
  uploadImageMeasurementToSmart(
    @UploadedFiles() files: MeasurementUploadFiles,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    const file = files.image?.[0] ?? files.file?.[0];

    return this.measurementsService.createFromSmartImage(req, file);
  }
}
