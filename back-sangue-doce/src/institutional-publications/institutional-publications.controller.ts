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
import { institutionalPublicationSchema } from "./dto";
import { InstitutionalPublicationsService } from "./institutional-publications.service";

@Controller("institutional-publications")
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
export class InstitutionalPublicationsController {
  constructor(private readonly service: InstitutionalPublicationsService) {}

  @Get()
  list(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.service.list(this.positiveInteger(page, 1), this.positiveInteger(limit, 20));
  }

  @Post()
  create(@Body() body: unknown, @Request() req: AuthenticatedRequest) {
    const dto = this.parse(body);
    return this.service.create(dto, req.user?.sub);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() body: unknown) {
    return this.service.update(id, this.parse(body));
  }

  @Post(":id/publish/linkedin")
  publishLinkedin(@Param("id") id: string) {
    return this.service.publishLinkedin(id);
  }

  private parse(body: unknown) {
    const result = institutionalPublicationSchema.safeParse(body ?? {});

    if (!result.success) {
      throw new BadRequestException(result.error.issues.map((issue) => issue.message).join(", "));
    }

    return result.data;
  }

  private positiveInteger(value: string | undefined, fallback: number) {
    const parsed = Number(value ?? fallback);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }
}
