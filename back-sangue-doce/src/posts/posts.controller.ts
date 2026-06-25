import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

  @Patch(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() updatePostDto: CreatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param('id') id: string) {
    await this.postsService.delete(id);

    return { ok: true };
  }

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.findAll({ page, limit });
  }

  @Get('admin')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.postsService.findAllAdmin({ page, limit });
  }

  @Get('categories')
  findCategories() {
    return this.postsService.findCategories();
  }

  @Get('tags')
  findTags() {
    return this.postsService.findTags();
  }

  @Get('slug/:slug')
  findSlug(@Param('slug') slug: string) {
    return this.postsService.findSlug(slug);
  }

  @Get('authors/:authorId')
  findPostsByAuthor(@Param('authorId') authorId: string) {
    return this.postsService.findPostsByAuthor(authorId);
  }

  @Get(':id')
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }
}
