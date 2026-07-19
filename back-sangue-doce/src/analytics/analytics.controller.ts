import { Body, Controller, Post, Req } from "@nestjs/common";
import type { Request } from "express";
import { Public } from "../auth/decorators/public.decorator";
import { AnalyticsService } from "./analytics.service";

type TrackVisitBody = {
  path?: unknown;
  referrer?: unknown;
};

@Controller("analytics")
@Public()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post("visits")
  trackVisit(@Body() body: TrackVisitBody, @Req() request: Request) {
    return this.analyticsService.trackVisit({
      ip: this.getClientIp(request),
      path: typeof body.path === "string" ? body.path : "/",
      referrer: typeof body.referrer === "string" ? body.referrer : undefined,
      userAgent: request.header("user-agent"),
    });
  }

  private getClientIp(request: Request) {
    const forwardedFor = request.header("x-forwarded-for");

    if (forwardedFor) {
      return forwardedFor.split(",")[0]?.trim();
    }

    return request.header("x-real-ip") ?? request.ip;
  }
}
