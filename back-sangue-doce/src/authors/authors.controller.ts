import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CreateAuthorDto } from './dto/create-author.dto';
import { AuthorsService } from './authors.service';
import { AuthGuard } from '@app/@infra/guard/auth.guard';
import { RolesGuard } from '@app/@infra/guard/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/auth/enums/role.enum';

@Controller('authors')
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

  @Get('search')
  findEmail(@Query('email') email: string) {
    return this.authorsService.findEmail(email);
  }

  @Get('slug/:slug')
  findSlug(@Param('slug') slug: string) {
    return this.authorsService.findSlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }
}
