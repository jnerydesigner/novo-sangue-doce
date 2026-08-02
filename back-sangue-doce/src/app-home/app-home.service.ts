import { PrismaService } from "@app/@infra/database/prisma.service";
import { classifyGlucose } from "@app/@shared/pattern/classify-glucose.pattern";
import type { JwtPayload } from "@app/auth/types/jwt-payload.type";
import { Injectable } from "@nestjs/common";

export type AppHomeCard = {
  id: string;
  title: string;
  value: string;
  status: string;
  detail: string;
  tone: string;
};

export type AppHomeGraph = {
  hour: string;
  value: number;
};

export type AppHomeResponse = {
  greeting: string;
  title: string;
  cards: AppHomeCard[];
  graph?: AppHomeGraph[];
};

function getStoredDateTimeParts(value: Date | string | number) {
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date.");
  }

  return {
    day: String(date.getUTCDate()).padStart(2, "0"),
    hour: String(date.getUTCHours()).padStart(2, "0"),
    minute: String(date.getUTCMinutes()).padStart(2, "0"),
    month: String(date.getUTCMonth() + 1).padStart(2, "0"),
    year: String(date.getUTCFullYear()),
  };
}

function formatHourMinute(value: Date | string | number): string {
  const values = getStoredDateTimeParts(value);

  return `${values.hour}:${values.minute}`;
}

function formatDateHour(value: Date | string | number): string {
  const values = getStoredDateTimeParts(value);

  return `${values.day}/${values.month}/${values.year} ${values.hour}:${values.minute}`;
}

@Injectable()
export class AppHomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHome(user?: JwtPayload): Promise<AppHomeResponse> {
    const userPrisma = await this.prisma.user.findUnique({
      where: { id: user?.sub },
    });

    const measurements = await this.prisma.measurement.findMany({
      where: {
        userId: userPrisma?.id,
      },
      orderBy: {
        measuredAt: "desc",
      },
      take: 4,
    });

    const lastMeasurement = measurements[0];
    const graph = measurements
      .slice()
      .reverse()
      .map((measurement) => ({
        hour: formatHourMinute(measurement.measuredAt),
        value: measurement.glucoseValueMgDl,
      }));

    console.log("user", userPrisma);
    console.log("measurements", measurements);
    console.log("lastMeasurement?.glucoseValueMgDl", lastMeasurement?.glucoseValueMgDl);
    const glucoseResult = classifyGlucose(lastMeasurement?.glucoseValueMgDl ?? 0);
    console.log("glucoseResult", glucoseResult);

    const hourNow = formatDateHour(lastMeasurement?.measuredAt ?? new Date());

    console.log("hourNow", hourNow);

    return {
      greeting: `Bom dia, ${userPrisma?.name}!`,
      title: "Resumo de hoje",
      cards: [
        {
          id: "last-measurement",
          title: "Ultima medicao",
          value: `${lastMeasurement?.glucoseValueMgDl ?? 0} mg/dL`,
          status: glucoseResult.label,
          detail: hourNow,
          tone: glucoseResult.color,
        },
      ],
      graph,
    };
  }
}
