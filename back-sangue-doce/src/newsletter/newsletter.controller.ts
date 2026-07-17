import { Body, Controller, Get, Post, Query } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { NewsletterService } from "./newsletter.service";

@Controller("newsletter")
@Public()
export class NewsletterController {
  constructor(private readonly newsletterService: NewsletterService) {}

  @Post("subscriptions")
  subscribe(@Body() body: { email?: string; source?: string }) {
    return this.newsletterService.subscribe(body.email ?? "", body.source);
  }

  @Get("subscriptions/confirm")
  confirm(@Query("token") token = "") {
    return this.newsletterService.confirm(token);
  }
}
