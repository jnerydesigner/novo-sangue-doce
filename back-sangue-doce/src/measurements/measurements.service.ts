import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { type ZodType } from 'zod';
import { PrismaService } from '@infra/database/prisma.service';
import {
  type CreateMeasurementDto,
  type CreateMeasurementInput,
  createMeasurementInputSchema,
} from './dto/create-measurement.dto';
import {
  MEASUREMENT_NOTE_LABELS,
  MeasurementNoteType,
  classifyMeasurementMoment,
} from './measurement.constants';
import { UsersService } from '@app/users/users.service';
import { AuthService } from '@app/auth/auth.service';
import type { AuthenticatedRequest } from '@app/@infra/guard/auth.guard';

const MEASUREMENT_TIME_ZONE = 'America/Sao_Paulo';
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type MeasurementRecord = Prisma.MeasurementGetPayload<Record<string, never>>;

export type PublicMeasurement = {
  id: string;
  userId: string;
  measuredAt: Date;
  glucoseValueMgDl: number;
  readingContext: string;
  source: string;
  noteType?: string;
  noteLabel?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type MonthlyMeasurementReportDay = {
  date: string;
  day: number;
  measurements: PublicMeasurement[];
  summary: {
    averageGlucoseMgDl: number | null;
    totalMeasurements: number;
  };
};

export type MonthlyMeasurementReport = {
  userId: string;
  userName: string;
  year: number;
  month: number;
  period: {
    startDate: Date;
    endDate: Date;
  };
  excludedContexts: string[];
  summary: {
    averageGlucoseMgDl: number | null;
    daysWithMeasurements: number;
    totalMeasurements: number;
  };
  days: MonthlyMeasurementReportDay[];
};

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
  ) {}

  async create(
    userRequest: AuthenticatedRequest,
    createMeasurementDto: CreateMeasurementDto,
  ): Promise<PublicMeasurement> {
    const userAuthenticated =
      this.authService.getAuthenticatedUser(userRequest);
    const payload = this.parseCreateMeasurementInput({
      ...createMeasurementDto,
      userId: userAuthenticated.sub,
    });

    if (!payload.userId || !this.isValidUuid(payload.userId)) {
      throw new BadRequestException('Invalid user id.');
    }

    const userTimeZone = this.getSupportedTimeZone(payload.timeZone);
    const measuredAt = this.parseDateTimeInMeasurementTimeZone(
      payload.measuredAt,
      userTimeZone,
    );
    const inferredMoment = classifyMeasurementMoment(measuredAt, userTimeZone);
    const measurementDay = this.getDatePartsInTimeZone(
      measuredAt,
      userTimeZone,
    );
    const dayStart = this.createDateInTimeZone(
      measurementDay.year,
      measurementDay.month,
      measurementDay.day,
      0,
      0,
      0,
      0,
      userTimeZone,
    );
    const dayEnd = this.createDateInTimeZone(
      measurementDay.year,
      measurementDay.month,
      measurementDay.day,
      23,
      59,
      59,
      999,
      userTimeZone,
    );

    try {
      const existingMeasurement = await this.prisma.measurement.findFirst({
        where: {
          measuredAt: {
            gte: dayStart,
            lte: dayEnd,
          },
          noteType: inferredMoment.noteType,
          userId: payload.userId,
        },
        orderBy: {
          measuredAt: 'desc',
        },
      });

      const measurementData = {
        glucoseValueMgDl: payload.glucoseValueMgDl,
        measuredAt,
        noteType: inferredMoment.noteType,
        readingContext: inferredMoment.readingContext,
        source: payload.source,
      };

      const measurement = existingMeasurement
        ? await this.prisma.measurement.update({
            data: measurementData,
            where: {
              id: existingMeasurement.id,
            },
          })
        : await this.prisma.measurement.create({
            data: {
              ...measurementData,
              userId: payload.userId,
            },
          });

      return this.toPublicMeasurement(measurement);
    } catch (error) {
      if (this.isForeignKeyError(error)) {
        throw new BadRequestException('User not found.');
      }

      throw error;
    }
  }

  async findAll(
    userRequest: AuthenticatedRequest,
    startDate?: string,
    endDate?: string,
  ): Promise<PublicMeasurement[]> {
    const userAuthenticated =
      this.authService.getAuthenticatedUser(userRequest);
    const where: Prisma.MeasurementWhereInput = {};

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException('Invalid user id.');
    }

    where.userId = userAuthenticated.sub;

    if (startDate || endDate) {
      where.measuredAt = {};

      if (startDate) {
        where.measuredAt.gte = this.parseFilterDate(startDate, 'startDate');
      }

      if (endDate) {
        where.measuredAt.lte = this.parseFilterDate(endDate, 'endDate');
      }
    }

    const measurements = await this.prisma.measurement.findMany({
      where,
      orderBy: { measuredAt: 'desc' },
    });

    return measurements.map((measurement) =>
      this.toPublicMeasurement(measurement),
    );
  }

  async findToday(
    userRequest: AuthenticatedRequest,
    timeZone?: string,
  ): Promise<PublicMeasurement[]> {
    const userAuthenticated =
      this.authService.getAuthenticatedUser(userRequest);

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException('Invalid user id.');
    }

    const userTimeZone = this.getSupportedTimeZone(timeZone);
    const today = this.getDatePartsInTimeZone(new Date(), userTimeZone);
    const dayStart = this.createDateInTimeZone(
      today.year,
      today.month,
      today.day,
      0,
      0,
      0,
      0,
      userTimeZone,
    );
    const dayEnd = this.createDateInTimeZone(
      today.year,
      today.month,
      today.day,
      23,
      59,
      59,
      999,
      userTimeZone,
    );

    const measurements = await this.prisma.measurement.findMany({
      where: {
        measuredAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        userId: userAuthenticated.sub,
      },
      orderBy: { measuredAt: 'desc' },
    });

    return measurements.map((measurement) =>
      this.toPublicMeasurement(measurement),
    );
  }

  async findOne(
    userRequest: AuthenticatedRequest,
    id: string,
  ): Promise<PublicMeasurement> {
    const userAuthenticated =
      this.authService.getAuthenticatedUser(userRequest);

    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid measurement id.');
    }

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException('Invalid user id.');
    }

    const measurement = await this.prisma.measurement.findFirst({
      where: { id, userId: userAuthenticated.sub },
    });

    if (!measurement) {
      throw new BadRequestException('Measurement not found.');
    }

    return this.toPublicMeasurement(measurement);
  }

  async getMonthlyFormalReport(
    userRequest: AuthenticatedRequest,
    yearInput?: string,
    monthInput?: string,
    startDateInput?: string,
    endDateInput?: string,
  ): Promise<MonthlyMeasurementReport> {
    const userAuthenticated =
      this.authService.getAuthenticatedUser(userRequest);
    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException('Invalid user id.');
    }

    const now = this.getDatePartsInTimeZone(new Date(), MEASUREMENT_TIME_ZONE);
    const period = this.resolveReportPeriod(
      {
        endDate: endDateInput,
        month: monthInput,
        startDate: startDateInput,
        year: yearInput,
      },
      now,
    );
    const user = await this.userService.findOne(userAuthenticated.sub);

    if (!user) {
      throw new BadRequestException('User not found.');
    }

    const measurements = await this.prisma.measurement.findMany({
      where: {
        measuredAt: { gte: period.startDate, lte: period.endDate },
        readingContext: { not: 'RANDOM' },
        userId: userAuthenticated.sub,
      },
      orderBy: { measuredAt: 'asc' },
    });

    const publicMeasurements = measurements.map((measurement) =>
      this.toPublicMeasurement(measurement),
    );
    const days = this.buildReportDays(
      period.startDate,
      period.endDate,
      publicMeasurements,
    );
    const totalMeasurements = publicMeasurements.length;
    const glucoseTotal = publicMeasurements.reduce(
      (total, measurement) => total + measurement.glucoseValueMgDl,
      0,
    );

    return {
      userId: userAuthenticated.sub,
      userName: user.name,
      year: period.year,
      month: period.month,
      period: {
        startDate: period.startDate,
        endDate: period.endDate,
      },
      excludedContexts: ['RANDOM'],
      summary: {
        averageGlucoseMgDl:
          totalMeasurements > 0
            ? Math.round(glucoseTotal / totalMeasurements)
            : null,
        daysWithMeasurements: days.filter(
          (day) => day.summary.totalMeasurements > 0,
        ).length,
        totalMeasurements,
      },
      days,
    };
  }

  private parseCreateMeasurementInput(
    createMeasurementDto: unknown,
  ): CreateMeasurementInput {
    const schema =
      createMeasurementInputSchema as ZodType<CreateMeasurementInput>;
    const result = schema.safeParse(createMeasurementDto);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue): string => issue.message),
      );
    }

    return result.data;
  }

  private parseFilterDate(value: string, fieldName: string): Date {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parsedDate = dateOnlyMatch
      ? this.parseDateOnlyInMeasurementTimeZone(value, fieldName)
      : this.parseDateTimeInMeasurementTimeZone(value);

    if (Number.isNaN(parsedDate.getTime())) {
      throw new BadRequestException(`${fieldName} must be a valid date.`);
    }

    return parsedDate;
  }

  private parseDateOnlyInMeasurementTimeZone(
    value: string,
    fieldName: string,
  ): Date {
    const [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
    const isEndDate = fieldName === 'endDate';

    return this.createDateInTimeZone(
      Number(year),
      Number(month),
      Number(day),
      isEndDate ? 23 : 0,
      isEndDate ? 59 : 0,
      isEndDate ? 59 : 0,
      isEndDate ? 999 : 0,
      MEASUREMENT_TIME_ZONE,
    );
  }

  private parseDateTimeInMeasurementTimeZone(
    value: string,
    timeZone = MEASUREMENT_TIME_ZONE,
  ): Date {
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?/,
    );

    if (!match) {
      return new Date(Number.NaN);
    }

    const [, year, month, day, hour, minute, second = '0', millisecond = '0'] =
      match;

    return this.createDateInTimeZone(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, '0')),
      timeZone,
    );
  }

  private parseReportMonth(value: string | undefined, fallback: number) {
    const month = value ? Number(value) : fallback;

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException(
        'month must be an integer between 1 and 12.',
      );
    }

    return month;
  }

  private parseReportYear(value: string | undefined, fallback: number) {
    const year = value ? Number(value) : fallback;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new BadRequestException(
        'year must be an integer between 2000 and 2100.',
      );
    }

    return year;
  }

  private resolveReportPeriod(
    params: {
      endDate?: string;
      month?: string;
      startDate?: string;
      year?: string;
    },
    fallback: { month: number; year: number },
  ): {
    endDate: Date;
    month: number;
    startDate: Date;
    year: number;
  } {
    if (params.startDate || params.endDate) {
      if (!params.startDate || !params.endDate) {
        throw new BadRequestException(
          'startDate and endDate must be provided together.',
        );
      }

      const startDate = this.parseFilterDate(params.startDate, 'startDate');
      const endDate = this.parseFilterDate(params.endDate, 'endDate');

      if (startDate.getTime() > endDate.getTime()) {
        throw new BadRequestException(
          'startDate must be before or equal to endDate.',
        );
      }

      const startParts = this.getDatePartsInTimeZone(
        startDate,
        MEASUREMENT_TIME_ZONE,
      );

      return {
        endDate,
        month: startParts.month,
        startDate,
        year: startParts.year,
      };
    }

    const year = this.parseReportYear(params.year, fallback.year);
    const month = this.parseReportMonth(params.month, fallback.month);
    const startDate = this.createDateInTimeZone(
      year,
      month,
      1,
      0,
      0,
      0,
      0,
      MEASUREMENT_TIME_ZONE,
    );
    const endDate = new Date(
      this.createDateInTimeZone(
        year,
        month + 1,
        1,
        0,
        0,
        0,
        0,
        MEASUREMENT_TIME_ZONE,
      ).getTime() - 1,
    );

    return {
      endDate,
      month,
      startDate,
      year,
    };
  }

  private buildReportDays(
    startDate: Date,
    endDate: Date,
    measurements: PublicMeasurement[],
  ): MonthlyMeasurementReportDay[] {
    const days: MonthlyMeasurementReportDay[] = [];
    const startParts = this.getDatePartsInTimeZone(
      startDate,
      MEASUREMENT_TIME_ZONE,
    );
    let cursor = this.createDateInTimeZone(
      startParts.year,
      startParts.month,
      startParts.day,
      0,
      0,
      0,
      0,
      MEASUREMENT_TIME_ZONE,
    );

    while (cursor.getTime() <= endDate.getTime()) {
      const cursorParts = this.getDatePartsInTimeZone(
        cursor,
        MEASUREMENT_TIME_ZONE,
      );
      const date = this.formatReportDate(
        cursorParts.year,
        cursorParts.month,
        cursorParts.day,
      );
      const dayMeasurements = measurements.filter(
        (measurement) =>
          this.formatDateOnly(measurement.measuredAt, MEASUREMENT_TIME_ZONE) ===
          date,
      );
      const glucoseTotal = dayMeasurements.reduce(
        (total, measurement) => total + measurement.glucoseValueMgDl,
        0,
      );

      days.push({
        date,
        day: cursorParts.day,
        measurements: dayMeasurements,
        summary: {
          averageGlucoseMgDl:
            dayMeasurements.length > 0
              ? Math.round(glucoseTotal / dayMeasurements.length)
              : null,
          totalMeasurements: dayMeasurements.length,
        },
      });

      cursor = this.createDateInTimeZone(
        cursorParts.year,
        cursorParts.month,
        cursorParts.day + 1,
        0,
        0,
        0,
        0,
        MEASUREMENT_TIME_ZONE,
      );
    }

    return days;
  }

  private formatDateOnly(date: Date, timeZone: string): string {
    const parts = this.getDatePartsInTimeZone(date, timeZone);

    return this.formatReportDate(parts.year, parts.month, parts.day);
  }

  private formatReportDate(year: number, month: number, day: number): string {
    const paddedMonth = String(month).padStart(2, '0');
    const paddedDay = String(day).padStart(2, '0');

    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  private toPublicMeasurement(
    measurement: MeasurementRecord,
  ): PublicMeasurement {
    return {
      id: measurement.id,
      userId: measurement.userId,
      measuredAt: measurement.measuredAt,
      glucoseValueMgDl: measurement.glucoseValueMgDl,
      readingContext: measurement.readingContext,
      source: measurement.source,
      noteType: measurement.noteType ?? undefined,
      noteLabel: this.getNoteLabel(measurement.noteType ?? undefined),
      createdAt: measurement.createdAt,
      updatedAt: measurement.updatedAt,
    };
  }

  private isValidUuid(id: string): boolean {
    return UUID_REGEX.test(id);
  }

  private isForeignKeyError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    );
  }

  private getSupportedTimeZone(timeZone?: string): string {
    if (!timeZone) {
      return MEASUREMENT_TIME_ZONE;
    }

    try {
      new Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
      return timeZone;
    } catch {
      return MEASUREMENT_TIME_ZONE;
    }
  }

  private getNoteLabel(noteType?: string): string | undefined {
    if (!noteType || !(noteType in MEASUREMENT_NOTE_LABELS)) {
      return undefined;
    }

    return MEASUREMENT_NOTE_LABELS[noteType as MeasurementNoteType];
  }

  private createDateInTimeZone(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
    timeZone: string,
  ): Date {
    const localTimestamp = Date.UTC(
      year,
      month - 1,
      day,
      hour,
      minute,
      second,
      millisecond,
    );
    const firstOffset = this.getTimeZoneOffsetInMilliseconds(
      new Date(localTimestamp),
      timeZone,
    );
    const secondOffset = this.getTimeZoneOffsetInMilliseconds(
      new Date(localTimestamp - firstOffset),
      timeZone,
    );

    return new Date(localTimestamp - secondOffset);
  }

  private getDatePartsInTimeZone(
    date: Date,
    timeZone: string,
  ): { year: number; month: number; day: number } {
    const parts = this.getDateTimePartsInTimeZone(date, timeZone);

    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
    };
  }

  private getTimeZoneOffsetInMilliseconds(
    date: Date,
    timeZone: string,
  ): number {
    const parts = this.getDateTimePartsInTimeZone(date, timeZone);
    const localTimestamp = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
    );

    return localTimestamp - (date.getTime() - date.getUTCMilliseconds());
  }

  private getDateTimePartsInTimeZone(
    date: Date,
    timeZone: string,
  ): Record<string, string> {
    const parts = new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
      minute: '2-digit',
      month: '2-digit',
      second: '2-digit',
      timeZone,
      year: 'numeric',
    }).formatToParts(date);

    return Object.fromEntries(
      parts
        .filter((part) => part.type !== 'literal')
        .map((part) => [part.type, part.value]),
    );
  }
}
