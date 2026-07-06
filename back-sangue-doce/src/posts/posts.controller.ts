import { AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Public } from "@app/auth/decorators/public.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
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
} from "@nestjs/common";
import type { CreatePostDto } from "./dto/create-post.dto";
import type { CreatePostCategoryDto } from "./dto/create-post-category.dto";
import type { CreatePostTagDto } from "./dto/create-post-tag.dto";
import { PostsService } from "./posts.service";

@Controller("posts")
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() updatePostDto: CreatePostDto) {
    return this.postsService.update(id, updatePostDto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param("id") id: string) {
    await this.postsService.delete(id);

    return { ok: true };
  }

  @Get()
  @Public()
  findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.postsService.findAll({ page, limit });
  }

  @Get("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.postsService.findAllAdmin({ page, limit });
  }

  @Get("categories")
  @Public()
  findCategories() {
    return this.postsService.findCategories();
  }

  @Post("categories")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createCategory(@Body() createCategoryDto: CreatePostCategoryDto) {
    return this.postsService.createCategory(createCategoryDto);
  }

  @Patch("categories/:id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateCategory(@Param("id") id: string, @Body() updateCategoryDto: CreatePostCategoryDto) {
    return this.postsService.updateCategory(id, updateCategoryDto);
  }

  @Get("tags")
  @Public()
  findTags() {
    return this.postsService.findTags();
  }

  @Post("tags")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createTag(@Body() createTagDto: CreatePostTagDto) {
    return this.postsService.createTag(createTagDto);
  }

  @Patch("tags/:id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  updateTag(@Param("id") id: string, @Body() updateTagDto: CreatePostTagDto) {
    return this.postsService.updateTag(id, updateTagDto);
  }

  @Get("slug/:slug")
  @Public()
  findSlug(@Param("slug") slug: string) {
    return this.postsService.findSlug(slug);
  }

  @Get("authors/:authorId")
  @Public()
  findPostsByAuthor(@Param("authorId") authorId: string) {
    return this.postsService.findPostsByAuthor(authorId);
  }

  @Get(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.postsService.findOne(id);
  }
}
