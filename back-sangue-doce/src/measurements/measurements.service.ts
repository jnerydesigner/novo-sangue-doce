import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { AuthService } from "@app/auth/auth.service";
import { UsersService } from "@app/users/users.service";
import { PrismaService } from "@infra/database/prisma.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { $Enums, Prisma } from "@prisma/client";
import type { ZodType } from "zod";
import {
  type CreateMeasurementDto,
  type CreateMeasurementInput,
  createMeasurementInputSchema,
} from "./dto/create-measurement.dto";
import {
  classifyMeasurementMoment,
  MEASUREMENT_NOTE_LABELS,
  MEASUREMENT_NOTE_SCHEDULE,
  type MeasurementNoteType,
} from "./measurement.constants";
import { type UpdateMeasurementDto, updateMeasurementSchema } from "./dto/update-measurement.dto";

const MEASUREMENT_TIME_ZONE = "America/Manaus";
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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
  userAvatarUrl?: string;
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
    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);
    const payload = this.parseCreateMeasurementInput({
      ...createMeasurementDto,
      userId: userAuthenticated.sub,
    });

    if (!payload.userId || !this.isValidUuid(payload.userId)) {
      throw new BadRequestException("Invalid user id.");
    }

    const userTimeZone = this.getSupportedTimeZone(payload.timeZone);
    const sentMeasuredAt = this.parseDateTimeInMeasurementTimeZone(
      payload.measuredAt,
      userTimeZone,
    );
    const measuredAt = payload.noteType
      ? this.resolveMeasuredAtForNoteType(sentMeasuredAt, payload.noteType, userTimeZone)
      : sentMeasuredAt;
    const measuredAtInstant = this.toInstantFromStoredLocalDate(measuredAt, userTimeZone);
    const inferredMoment = payload.noteType
      ? { noteType: payload.noteType, readingContext: this.getReadingContext(payload.noteType) }
      : classifyMeasurementMoment(measuredAtInstant, userTimeZone);
    const measurementDay = this.getStoredDateParts(measuredAt);
    const dayStart = this.createStoredLocalDateTime(
      measurementDay.year,
      measurementDay.month,
      measurementDay.day,
      0,
      0,
      0,
      0
    );
    const dayEnd = this.createStoredLocalDateTime(
      measurementDay.year,
      measurementDay.month,
      measurementDay.day,
      23,
      59,
      59,
      999
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
          measuredAt: "desc",
        },
      });

      const measurementData = {
        glucoseValueMgDl: payload.glucoseValueMgDl,
        measuredAt,
        noteType: inferredMoment.noteType,
        readingContext: inferredMoment.readingContext,
        source: payload.source,
      };
      const now = this.createStoredLocalNow(userTimeZone);

      const measurement = existingMeasurement
        ? await this.prisma.measurement.update({
            data: {
              ...measurementData,
              updatedAt: now,
            },
            where: {
              id: existingMeasurement.id,
            },
          })
        : await this.prisma.measurement.create({
            data: {
              ...measurementData,
              createdAt: now,
              updatedAt: now,
              userId: payload.userId,
            },
          });

      return this.toPublicMeasurement(measurement);
    } catch (error) {
      if (this.isForeignKeyError(error)) {
        throw new BadRequestException("User not found.");
      }

      throw error;
    }
  }

  async update(
    userRequest: AuthenticatedRequest,
    id: string,
    updateMeasurementDto: UpdateMeasurementDto,
  ): Promise<PublicMeasurement> {
    const userId = this.authService.getAuthenticatedUser(userRequest).sub;
    if (!this.isValidUuid(id)) throw new BadRequestException("Invalid measurement id.");
    if (!this.isValidUuid(userId)) throw new BadRequestException("Invalid user id.");
    const parsed = updateMeasurementSchema.safeParse(updateMeasurementDto);
    if (!parsed.success)
      throw new BadRequestException(parsed.error.issues.map((issue) => issue.message));

    const existing = await this.prisma.measurement.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException("Measurement not found.");
    const noteType = parsed.data.noteType ?? existing.noteType;
    const timeZone = this.getSupportedTimeZone(parsed.data.timeZone);
    const dateParts = this.getStoredDateParts(existing.measuredAt);
    const measuredAt = noteType
      ? this.resolveMeasuredAtForNoteType(existing.measuredAt, noteType, timeZone, dateParts)
      : existing.measuredAt;
    const measurement = await this.prisma.measurement.update({
      where: { id },
      data: {
        ...(parsed.data.glucoseValueMgDl === undefined
          ? {}
          : { glucoseValueMgDl: parsed.data.glucoseValueMgDl }),
        noteType,
        measuredAt,
        readingContext: noteType ? this.getReadingContext(noteType) : existing.readingContext,
        updatedAt: this.createStoredLocalNow(timeZone),
      },
    });
    return this.toPublicMeasurement(measurement);
  }

  async findAll(
    userRequest: AuthenticatedRequest,
    startDate?: string,
    endDate?: string,
  ): Promise<PublicMeasurement[]> {
    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);
    const where: Prisma.MeasurementWhereInput = {};

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException("Invalid user id.");
    }

    where.userId = userAuthenticated.sub;

    if (startDate || endDate) {
      where.measuredAt = {};

      if (startDate) {
        where.measuredAt.gte = this.parseFilterDate(startDate, "startDate");
      }

      if (endDate) {
        where.measuredAt.lte = this.parseFilterDate(endDate, "endDate");
      }
    }

    const measurements = await this.prisma.measurement.findMany({
      where,
      orderBy: { measuredAt: "desc" },
    });

    return measurements.map((measurement) => this.toPublicMeasurement(measurement));
  }

  async findToday(
    userRequest: AuthenticatedRequest,
    timeZone?: string,
  ): Promise<PublicMeasurement[]> {
    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException("Invalid user id.");
    }

    const userTimeZone = this.getSupportedTimeZone(timeZone);
    const today = this.getDatePartsInTimeZone(new Date(), userTimeZone);

    const dayStart = this.createStoredLocalDateTime(
      today.year,
      today.month,
      today.day,
      0,
      0,
      0,
      0
    );

    const dayEnd = this.createStoredLocalDateTime(
      today.year,
      today.month,
      today.day,
      23,
      59,
      59,
      999
    );

    const noteTypeOrder: $Enums.MeasurementNoteType[] = [
      "BEFORE_BREAKFAST",
      "AFTER_BREAKFAST",
      "BEFORE_LUNCH",
      "AFTER_LUNCH",
      "BEFORE_DINNER",
      "AFTER_DINNER",
    ];

    const measurements = await this.prisma.measurement.findMany({
      where: {
        measuredAt: {
          gte: dayStart,
          lte: dayEnd,
        },
        userId: userAuthenticated.sub,
        noteType: {
          in: noteTypeOrder,
        },
      },
      orderBy: {
        measuredAt: "asc",
      },
    });

    measurements.sort((a, b) => {
      const orderA = noteTypeOrder.indexOf(a.noteType as $Enums.MeasurementNoteType);
      const orderB = noteTypeOrder.indexOf(b.noteType as $Enums.MeasurementNoteType);

      return orderA - orderB;
    });

    return measurements.map((measurement) => this.toPublicMeasurement(measurement));
  }

  async findOne(userRequest: AuthenticatedRequest, id: string): Promise<PublicMeasurement> {
    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);

    if (!this.isValidUuid(id)) {
      throw new BadRequestException("Invalid measurement id.");
    }

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException("Invalid user id.");
    }

    const measurement = await this.prisma.measurement.findFirst({
      where: { id, userId: userAuthenticated.sub },
    });

    if (!measurement) {
      throw new BadRequestException("Measurement not found.");
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
    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);
    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException("Invalid user id.");
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
      throw new BadRequestException("User not found.");
    }

    const measurements = await this.prisma.measurement.findMany({
      where: {
        measuredAt: { gte: period.startDate, lte: period.endDate },
        readingContext: { not: "RANDOM" },
        userId: userAuthenticated.sub,
      },
      orderBy: { measuredAt: "asc" },
    });

    const publicMeasurements = measurements.map((measurement) =>
      this.toPublicMeasurement(measurement),
    );
    const days = this.buildReportDays(period.startDate, period.endDate, publicMeasurements);
    const totalMeasurements = publicMeasurements.length;
    const glucoseTotal = publicMeasurements.reduce(
      (total, measurement) => total + measurement.glucoseValueMgDl,
      0,
    );

    return {
      userId: userAuthenticated.sub,
      userAvatarUrl: user.avatarUrl,
      userName: user.name,
      year: period.year,
      month: period.month,
      period: {
        startDate: period.startDate,
        endDate: period.endDate,
      },
      excludedContexts: ["RANDOM"],
      summary: {
        averageGlucoseMgDl:
          totalMeasurements > 0 ? Math.round(glucoseTotal / totalMeasurements) : null,
        daysWithMeasurements: days.filter((day) => day.summary.totalMeasurements > 0).length,
        totalMeasurements,
      },
      days,
    };
  }

  async delete(
    userRequest: AuthenticatedRequest,
    idMeasurement: string,
  ): Promise<PublicMeasurement[]> {
    const findMeasurement = await this.prisma.measurement.findUnique({
      where: {
        id: idMeasurement,
      },
    });

    if (!findMeasurement) {
      throw new BadRequestException("Measurement not found.");
    }

    const userAuthenticated = this.authService.getAuthenticatedUser(userRequest);

    if (!this.isValidUuid(userAuthenticated.sub)) {
      throw new BadRequestException("Invalid user id.");
    }

    if (findMeasurement.userId !== userAuthenticated.sub) {
      throw new BadRequestException("You are not authorized to delete this measurement.");
    }

    await this.prisma.measurement.delete({
      where: {
        id: idMeasurement,
      },
    });

    return await this.findToday(userRequest);
  }

  private parseCreateMeasurementInput(createMeasurementDto: unknown): CreateMeasurementInput {
    const schema = createMeasurementInputSchema as ZodType<CreateMeasurementInput>;
    const result = schema.safeParse(createMeasurementDto);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue): string => issue.message));
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

  private parseDateOnlyInMeasurementTimeZone(value: string, fieldName: string): Date {
    const [, year, month, day] = value.match(/^(\d{4})-(\d{2})-(\d{2})$/) ?? [];
    const isEndDate = fieldName === "endDate";

    return this.createStoredLocalDateTime(
      Number(year),
      Number(month),
      Number(day),
      isEndDate ? 23 : 0,
      isEndDate ? 59 : 0,
      isEndDate ? 59 : 0,
      isEndDate ? 999 : 0
    );
  }

  private parseDateTimeInMeasurementTimeZone(
    value: string,
    timeZone = MEASUREMENT_TIME_ZONE,
  ): Date {
    if (/(?:Z|[+-]\d{2}:?\d{2})$/i.test(value)) {
      const instant = new Date(value);
      if (Number.isNaN(instant.getTime())) return new Date(Number.NaN);
      const parts = this.getDateTimePartsInTimeZone(instant, timeZone);

      return this.createStoredLocalDateTime(
        Number(parts.year),
        Number(parts.month),
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
        Number(parts.second),
        instant.getUTCMilliseconds(),
      );
    }

    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?/,
    );

    if (!match) {
      return new Date(Number.NaN);
    }

    const [, year, month, day, hour, minute, second = "0", millisecond = "0"] = match;

    return this.createStoredLocalDateTime(
      Number(year),
      Number(month),
      Number(day),
      Number(hour),
      Number(minute),
      Number(second),
      Number(millisecond.padEnd(3, "0"))
    );
  }

  private resolveMeasuredAtForNoteType(
    date: Date,
    noteType: MeasurementNoteType,
    timeZone: string,
    dateParts = this.getStoredDateParts(date),
  ): Date {
    const schedule = MEASUREMENT_NOTE_SCHEDULE[noteType];
    if (!schedule) return date;
    return this.createStoredLocalDateTime(
      dateParts.year,
      dateParts.month,
      dateParts.day,
      schedule.hour,
      schedule.minute,
      0,
      8
    );
  }

  private getReadingContext(noteType: MeasurementNoteType) {
    if (noteType === "FASTING_WAKE_UP") return "FASTING" as const;
    if (["BEFORE_BREAKFAST", "BEFORE_LUNCH", "BEFORE_DINNER"].includes(noteType))
      return "BEFORE_MEAL" as const;
    if (["AFTER_BREAKFAST", "AFTER_LUNCH", "AFTER_DINNER"].includes(noteType))
      return "AFTER_MEAL" as const;
    if (noteType === "BEFORE_SLEEP") return "BEDTIME" as const;
    if (["BEFORE_EXERCISE", "AFTER_EXERCISE"].includes(noteType)) return "EXERCISE" as const;
    return ["FEELING_UNWELL", "ROUTINE_CHECK"].includes(noteType)
      ? ("MANUAL" as const)
      : ("RANDOM" as const);
  }

  private parseReportMonth(value: string | undefined, fallback: number) {
    const month = value ? Number(value) : fallback;

    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new BadRequestException("month must be an integer between 1 and 12.");
    }

    return month;
  }

  private parseReportYear(value: string | undefined, fallback: number) {
    const year = value ? Number(value) : fallback;

    if (!Number.isInteger(year) || year < 2000 || year > 2100) {
      throw new BadRequestException("year must be an integer between 2000 and 2100.");
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
        throw new BadRequestException("startDate and endDate must be provided together.");
      }

      const startDate = this.parseFilterDate(params.startDate, "startDate");
      const endDate = this.parseFilterDate(params.endDate, "endDate");

      if (startDate.getTime() > endDate.getTime()) {
        throw new BadRequestException("startDate must be before or equal to endDate.");
      }

      const startParts = this.getDatePartsInTimeZone(startDate, MEASUREMENT_TIME_ZONE);

      return {
        endDate,
        month: startParts.month,
        startDate,
        year: startParts.year,
      };
    }

    const year = this.parseReportYear(params.year, fallback.year);
    const month = this.parseReportMonth(params.month, fallback.month);
    const startDate = this.createDateInTimeZone(year, month, 1, 0, 0, 0, 0, MEASUREMENT_TIME_ZONE);
    const endDate = new Date(
      this.createDateInTimeZone(year, month + 1, 1, 0, 0, 0, 0, MEASUREMENT_TIME_ZONE).getTime() -
        1,
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
    const startParts = this.getDatePartsInTimeZone(startDate, MEASUREMENT_TIME_ZONE);
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
      const cursorParts = this.getDatePartsInTimeZone(cursor, MEASUREMENT_TIME_ZONE);
      const date = this.formatReportDate(cursorParts.year, cursorParts.month, cursorParts.day);
      const dayMeasurements = measurements.filter(
        (measurement) =>
          this.formatDateOnly(measurement.measuredAt, MEASUREMENT_TIME_ZONE) === date,
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
            dayMeasurements.length > 0 ? Math.round(glucoseTotal / dayMeasurements.length) : null,
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
    const paddedMonth = String(month).padStart(2, "0");
    const paddedDay = String(day).padStart(2, "0");

    return `${year}-${paddedMonth}-${paddedDay}`;
  }

  private toPublicMeasurement(measurement: MeasurementRecord): PublicMeasurement {
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
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
  }

  private getSupportedTimeZone(timeZone?: string): string {
    if (!timeZone) {
      return MEASUREMENT_TIME_ZONE;
    }

    try {
      new Intl.DateTimeFormat("en-US", { timeZone }).format(new Date());
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
    const localTimestamp = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const firstOffset = this.getTimeZoneOffsetInMilliseconds(new Date(localTimestamp), timeZone);
    const secondOffset = this.getTimeZoneOffsetInMilliseconds(
      new Date(localTimestamp - firstOffset),
      timeZone,
    );

    return new Date(localTimestamp - secondOffset);
  }

  private createStoredLocalDateTime(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
  ): Date {
    return new Date(Date.UTC(year, month - 1, day, hour, minute, second, millisecond));
  }

  private createStoredLocalNow(timeZone: string): Date {
    const now = new Date();
    const parts = this.getDateTimePartsInTimeZone(now, timeZone);

    return this.createStoredLocalDateTime(
      Number(parts.year),
      Number(parts.month),
      Number(parts.day),
      Number(parts.hour),
      Number(parts.minute),
      Number(parts.second),
      now.getUTCMilliseconds(),
    );
  }

  private getStoredDateParts(date: Date): { year: number; month: number; day: number } {
    return {
      year: date.getUTCFullYear(),
      month: date.getUTCMonth() + 1,
      day: date.getUTCDate(),
    };
  }

  private toInstantFromStoredLocalDate(date: Date, timeZone: string): Date {
    return this.createDateInTimeZone(
      date.getUTCFullYear(),
      date.getUTCMonth() + 1,
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
      date.getUTCMilliseconds(),
      timeZone,
    );
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

  private getTimeZoneOffsetInMilliseconds(date: Date, timeZone: string): number {
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

  private getDateTimePartsInTimeZone(date: Date, timeZone: string): Record<string, string> {
    const parts = new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
      minute: "2-digit",
      month: "2-digit",
      second: "2-digit",
      timeZone,
      year: "numeric",
    }).formatToParts(date);

    return Object.fromEntries(
      parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
    );
  }
}
