import { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { Body, Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
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

  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  listPending() {
    return this.invitesService.listPending();
  }

  @Post(":id/resend")
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN)
  resend(@Param("id") id: string) {
    return this.invitesService.resend(id);
  }

  @Post(":token/accept")
  acceptInvite(@Request() req: AuthenticatedRequest, @Param("token") token: string) {
    return this.invitesService.acceptInvite(req, token);
  }
}
