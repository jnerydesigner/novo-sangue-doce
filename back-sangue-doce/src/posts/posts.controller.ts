import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { CreatePostDto } from './dto/create-post.dto';
import { PostsService } from './posts.service';
import { AuthGuard } from '@app/@infra/guard/auth.guard';
import { RolesGuard } from '@app/@infra/guard/roles.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { Role } from '@app/auth/enums/role.enum';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.findAll({ page, limit });
  }

  @Get('slug/:slug')
  findSlug(@Param('slug') slug: string) {
    return this.postsService.findSlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
