import { type AuthenticatedRequest, AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthorsService } from "./authors.service";
import type { CreateAuthorDto } from "./dto/create-author.dto";
import type { UpdateAuthorProfileDto } from "./dto/update-author-profile.dto";

@Controller("authors")
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createAuthorDto: CreateAuthorDto) {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Get("me")
  @UseGuards(AuthGuard)
  findMe(@Request() req: AuthenticatedRequest) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authorsService.findMe(req.user.sub);
  }

  @Patch("me")
  @UseGuards(AuthGuard)
  updateMe(
    @Request() req: AuthenticatedRequest,
    @Body() updateAuthorProfileDto: UpdateAuthorProfileDto,
  ) {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return this.authorsService.updateMe(req.user.sub, updateAuthorProfileDto);
  }

  @Get("search")
  findEmail(@Query("email") email: string) {
    return this.authorsService.findEmail(email);
  }

  @Get("slug/:slug")
  findSlug(@Param("slug") slug: string) {
    return this.authorsService.findSlug(slug);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.authorsService.findOne(id);
  }
}
