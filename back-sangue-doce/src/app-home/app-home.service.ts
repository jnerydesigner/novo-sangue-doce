import { formatDateHour, formatDateToDayMonthYear } from "@app/@helper/format-date.helper";
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

@Injectable()
export class AppHomeService {
  constructor(private readonly prisma: PrismaService) {}
  async getHome(user?: JwtPayload): Promise<AppHomeResponse> {
    const userPrisma = await this.prisma.user.findUnique({
      where: { id: user?.sub },
    });

    const measurements = await this.prisma.measurement.findFirst({
      where: {
        userId: userPrisma?.id,
      },
      orderBy: {
        measuredAt: "desc",
      },
    });

    console.log("user", userPrisma);
    console.log("measurements", measurements);
    console.log("measurements?.glucoseValueMgDl", measurements?.glucoseValueMgDl);
    const glucoseResult = classifyGlucose(measurements?.glucoseValueMgDl ?? 0);
    console.log("glucoseResult", glucoseResult);

    const dateNow = formatDateToDayMonthYear(measurements?.measuredAt ?? new Date());
    const hourNow = formatDateHour(measurements?.measuredAt ?? new Date());

    console.log("dateNow", dateNow);
    console.log("hourNow", hourNow);

    return {
      greeting: `Bom dia, ${userPrisma?.name}!`,
      title: "Resumo de hoje",
      cards: [
        {
          id: "last-measurement",
          title: "Ultima medicao",
          value: `${measurements?.glucoseValueMgDl} mg/dL`,
          status: glucoseResult.label,
          detail: hourNow,
          tone: glucoseResult.color,
        },
        {
          id: "last-sleep",
          title: "Sono",
          value: `7h10min`,
          status: "Ontem",
          detail: "meta 7h30min",
          tone: "#279CF5",
        },
        {
          id: "carbohydrates",
          title: "Carboidratos",
          value: `120g`,
          status: "Ontem",
          detail: "meta 150g",
          tone: "#FF6B6B",
        },
      ],
      graph: [
        {
          hour: "08:00",
          value: 240,
        },
        {
          hour: "12:00",
          value: 150,
        },
        {
          hour: "16:00",
          value: 180,
        },
        {
          hour: "18:00",
          value: 120,
        },
      ],
    };
  }
}
