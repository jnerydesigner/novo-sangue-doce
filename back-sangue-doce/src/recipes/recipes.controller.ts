import { AuthGuard } from "@app/@infra/guard/auth.guard";
import { RolesGuard } from "@app/@infra/guard/roles.guard";
import { Public } from "@app/auth/decorators/public.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { Role } from "@app/auth/enums/role.enum";
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import type { CreateRecipeDto } from "./dto/create-recipe.dto";
import { RecipesService } from "./recipes.service";

@Controller("recipes")
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() payload: CreateRecipeDto) {
    return this.recipesService.create(payload);
  }

  @Post("import")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  importFromUrl(@Body("url") url: string) {
    return this.recipesService.importFromUrl(url);
  }

  @Get()
  @Public()
  findAll(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.recipesService.findAll({ page, limit });
  }

  @Get("admin")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin(@Query("page") page?: string, @Query("limit") limit?: string) {
    return this.recipesService.findAll({ page, limit }, true);
  }

  @Get("authors")
  @Public()
  findAuthors() { return this.recipesService.findAuthors(); }

  @Get("categories")
  @Public()
  findCategories() { return this.recipesService.findCategories(); }

  @Get("tags")
  @Public()
  findTags() { return this.recipesService.findTags(); }

  @Get("slug/:slug")
  @Public()
  findBySlug(@Param("slug") slug: string) {
    return this.recipesService.findBySlug(slug);
  }

  @Get(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findOne(@Param("id") id: string) {
    return this.recipesService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param("id") id: string, @Body() payload: CreateRecipeDto) {
    return this.recipesService.update(id, payload);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async delete(@Param("id") id: string) {
    await this.recipesService.delete(id);
    return { ok: true };
  }
}
