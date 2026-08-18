import { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { Body, Controller, Get, Param, Post, Request } from "@nestjs/common";
import { Public } from "src/auth/decorators/public.decorator";
import { InvitesService } from "./invites.service";

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Post()
  sendInvite(@Request() req: AuthenticatedRequest, @Body() body: { email: string }) {
    return this.invitesService.invite(req, body.email);
  }

  @Get(":token")
  @Public()
  validateInvite(@Param("token") token: string) {
    return this.invitesService.validateInvite(token);
  }

  @Post(":token/accept")
  acceptInvite(@Request() req: AuthenticatedRequest, @Param("token") token: string) {
    return this.invitesService.acceptInvite(req, token);
  }
}
