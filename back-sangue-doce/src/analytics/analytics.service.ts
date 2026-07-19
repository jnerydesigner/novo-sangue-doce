import { BadRequestException, Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { createHash } from "node:crypto";
import { PrismaService } from "@infra/database/prisma.service";
import { pageVisitsTotal } from "@infra/observability/registry";

type TrackVisitInput = {
  ip?: string;
  path: string;
  referrer?: string;
  userAgent?: string;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async trackVisit(input: TrackVisitInput) {
    const pagePath = this.normalizePath(input.path);
    const visitedOn = this.startOfTodayUtc();
    const ipHash = this.hashValue(input.ip ?? "unknown");
    const userAgentHash = input.userAgent ? this.hashValue(input.userAgent) : null;

    const uniqueVisitor = await this.registerUniqueVisitor({
      ipHash,
      pagePath,
      userAgentHash,
      visitedOn,
    });

    await this.prisma.pageVisitDaily.upsert({
      where: {
        pagePath_visitedOn: {
          pagePath,
          visitedOn,
        },
      },
      create: {
        pagePath,
        visitedOn,
        totalVisits: 1,
        uniqueVisitors: uniqueVisitor ? 1 : 0,
      },
      update: {
        totalVisits: {
          increment: 1,
        },
        uniqueVisitors: uniqueVisitor
          ? {
              increment: 1,
            }
          : undefined,
      },
    });

    pageVisitsTotal.inc({ page_group: this.pageGroup(pagePath) });

    return { ok: true };
  }

  private async registerUniqueVisitor(input: {
    ipHash: string;
    pagePath: string;
    userAgentHash: string | null;
    visitedOn: Date;
  }) {
    try {
      await this.prisma.pageVisitorDaily.create({
        data: input,
      });

      return true;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return false;
      }

      throw error;
    }
  }

  private normalizePath(path: string) {
    const cleanPath = path.split("?")[0]?.split("#")[0]?.trim() || "/";

    if (!cleanPath.startsWith("/")) {
      throw new BadRequestException("Invalid analytics path.");
    }

    return cleanPath.slice(0, 300);
  }

  private startOfTodayUtc() {
    const now = new Date();

    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private hashValue(value: string) {
    const salt = process.env.ANALYTICS_IP_SALT ?? process.env.JWT_SECRET ?? "sangue-doce-local";

    return createHash("sha256").update(`${salt}:${value}`).digest("hex");
  }

  private pageGroup(path: string) {
    const [, firstSegment] = path.split("/");

    return firstSegment || "home";
  }
}
