import type { AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { Controller, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { PostBannerService } from "./post-banner.service";

@Controller("post-banners")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class PostBannerController {
  constructor(private readonly service: PostBannerService) {}

  @Post("posts/:postId/generate")
  enqueue(@Param("postId") postId: string, @Request() req: AuthenticatedRequest) {
    return this.service.enqueue(postId, req);
  }

  @Get("jobs/:jobId")
  status(@Param("jobId") jobId: string) {
    return this.service.status(jobId);
  }
}
