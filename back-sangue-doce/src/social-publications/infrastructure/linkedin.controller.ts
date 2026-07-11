import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { LinkedinService } from "./linkedin.service";

const linkedinPublicationSchema = z.object({
  postId: z.uuid(),
});

@Controller("publish")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class LinkedinController {
  constructor(private readonly linkedinService: LinkedinService) {}

  @Post("linkedin")
  publish(@Body() body: unknown) {
    const result = linkedinPublicationSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message).join(", "));
    }

    return this.linkedinService.publishLatestCompleted(result.data.postId);
  }
}
