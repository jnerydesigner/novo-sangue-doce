import { type AuthenticatedRequest } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from "@nestjs/common";
import {
  CreateSocialPublicationBodyDto,
  type CreateSocialPublicationDto,
  createSocialPublicationSchema,
} from "../dto/create-social-publication.dto";
import { scheduleSocialPublicationSchema } from "../dto/schedule-social-publication.dto";
import type { SocialPublicationListResponseDto } from "../dto/social-publication-response.dto";
import { updateSocialPublicationSchema } from "../dto/update-social-publication.dto";
import { SocialPublicationService } from "./social-publication.service";

@Controller("social-publications")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class SocialPublicationController {
  constructor(private readonly socialPublicationService: SocialPublicationService) {}

  @Post("posts/social-transform")
  create(@Body() body: CreateSocialPublicationBodyDto, @Request() req: AuthenticatedRequest) {
    const dto = this.parseCreateDto(body);

    return this.socialPublicationService.enqueue(body.postId, dto, req);
  }

  @Get("publications/:id")
  findOne(@Param("id") id: string) {
    return this.socialPublicationService.findById(id);
  }

  @Get("publications")
  findAll(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ): Promise<SocialPublicationListResponseDto> {
    const pageNumber: number = this.parsePositiveInteger(page, 1);
    const limitNumber: number = this.parsePositiveInteger(limit, 20);

    return this.socialPublicationService.findAll(pageNumber, limitNumber);
  }

  @Get("posts/:postId/social-publications")
  findByPostId(
    @Param("postId") postId: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    const pageNum = this.parsePositiveInteger(page, 1);
    const limitNum = this.parsePositiveInteger(limit, 20);

    return this.socialPublicationService.findByPostId(postId, pageNum, limitNum);
  }

  @Post("social-publications/:id/retry")
  retry(@Param("id") id: string) {
    return this.socialPublicationService.retry(id);
  }

  @Patch("social-publications/:id")
  update(@Param("id") id: string, @Body() body: unknown) {
    const result = updateSocialPublicationSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message).join(", "));
    }

    return this.socialPublicationService.updateReview(id, result.data);
  }

  @Post("social-publications/:id/schedule")
  schedule(
    @Param("id") id: string,
    @Body() body: unknown,
    @Request() req: AuthenticatedRequest,
  ) {
    const result = scheduleSocialPublicationSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message).join(", "));
    }

    return this.socialPublicationService.schedule(id, result.data, req);
  }

  private parseCreateDto(body: Record<string, unknown>): CreateSocialPublicationDto {
    const result = createSocialPublicationSchema.safeParse(body ?? {});

    if (!result.success) {
      const issues = result.error.issues.map((i) => i.message).join(", ");
      throw new BadRequestException(`Payload invalido: ${issues}`);
    }

    return result.data;
  }

  private parsePositiveInteger(value: string | undefined, defaultValue: number): number {
    if (value === undefined || value === "") {
      return defaultValue;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      return defaultValue;
    }

    return parsed;
  }
}
