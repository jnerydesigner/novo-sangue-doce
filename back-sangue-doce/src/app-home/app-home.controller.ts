import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { AppHomeService, type AppHomeResponse } from "./app-home.service";

@Controller("app/home")
export class AppHomeController {
  constructor(private readonly appHomeService: AppHomeService) {}

  @Get()
  @UseGuards(AuthGuard)
  async getHome(@Request() req: AuthenticatedRequest): Promise<AppHomeResponse> {
    console.log("req.user", req.user);
    return this.appHomeService.getHome(req.user);
  }
}
