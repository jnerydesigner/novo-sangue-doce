import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import type { CreateMeasurementDto } from './dto/create-measurement.dto';
import {
  MeasurementsService,
  type MonthlyMeasurementReport,
  type PublicMeasurement,
} from './measurements.service';
import {
  type AuthenticatedRequest,
  AuthGuard,
} from '@app/@infra/guard/auth.guard';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(
    @Body() createMeasurementDto: CreateMeasurementDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    return this.measurementsService.create(req, createMeasurementDto);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(
    @Request() req: AuthenticatedRequest,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<PublicMeasurement[]> {
    return this.measurementsService.findAll(req, startDate, endDate);
  }

  @Get('today')
  @UseGuards(AuthGuard)
  findToday(
    @Request() req: AuthenticatedRequest,
    @Query('timeZone') timeZone?: string,
  ): Promise<PublicMeasurement[]> {
    return this.measurementsService.findToday(req, timeZone);
  }

  @Get('reports/monthly')
  @UseGuards(AuthGuard)
  getMonthlyFormalReport(
    @Request() req: AuthenticatedRequest,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ): Promise<MonthlyMeasurementReport> {
    return this.measurementsService.getMonthlyFormalReport(req, year, month);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<PublicMeasurement> {
    return this.measurementsService.findOne(req, id);
  }
}
