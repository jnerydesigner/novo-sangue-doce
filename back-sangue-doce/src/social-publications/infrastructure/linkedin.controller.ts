import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { Controller, Post, UseGuards } from "@nestjs/common";
import { LinkedinService } from "./linkedin.service";

@Controller("publish")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post("linkedin")
  publish() {
    return this.linkedinService.publishLatestCompleted();
  }
}
