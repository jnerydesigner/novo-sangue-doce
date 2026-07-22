import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { BadRequestException, Body, Controller, Post, UseGuards } from "@nestjs/common";
import { z } from "zod";
import { InstagramService } from "./instagram.service";

const instagramPublicationSchema = z
  .object({
    postId: z.uuid().optional(),
    socialPublicationId: z.uuid().optional(),
  })
  .refine((value) => value.postId || value.socialPublicationId, {
    message: "Informe a materia ou a publicacao social.",
  });

@Controller("publish")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  @Post("instagram")
  publish(@Body() body: unknown) {
    const result = instagramPublicationSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message).join(", "));
    }

    if (result.data.socialPublicationId) {
      return this.instagramService.publishCompleted(result.data.socialPublicationId);
    }

    if (!result.data.postId) {
      throw new BadRequestException("Informe a materia ou a publicacao social.");
    }

    return this.instagramService.publishLatestCompleted(result.data.postId);
  }
}
