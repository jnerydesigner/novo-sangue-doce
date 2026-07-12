import { PrismaService } from "@infra/database/prisma.service";
import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Prisma } from "@prisma/client";
import { type CreateRecipeDto, createRecipeSchema } from "./dto/create-recipe.dto";

const recipeInclude = {
  author: { include: { user: { select: { avatarUrl: true } } } },
  category: true,
  tags: { include: { tag: true } },
} satisfies Prisma.RecipeInclude;

type RecipeRecord = Prisma.RecipeGetPayload<{ include: typeof recipeInclude }>;

@Injectable()
export class RecipesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async importFromUrl(url: string) {
    if (!url?.trim()) throw new BadRequestException("Import URL is required.");
    const importerUrl = this.config.get<string>("RECIPE_IMPORTER_URL") ?? "http://localhost:8030";
    try {
      const response = await fetch(`${importerUrl.replace(/\/$/, "")}/recipes/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
        signal: AbortSignal.timeout(25_000),
      });
      const result = (await response.json().catch(() => null)) as { detail?: string } | null;
      if (!response.ok) throw new BadRequestException(result?.detail ?? "Recipe import failed.");
      return result;
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException("Recipe importer is unavailable.");
    }
  }

  async create(input: CreateRecipeDto) {
    const payload = this.parse(input);
    try {
      const recipe = await this.prisma.recipe.create({
        data: this.toCreateData(payload),
        include: recipeInclude,
      });
      return this.toPublic(recipe);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, input: CreateRecipeDto) {
    const payload = this.parse(input);
    try {
      const recipe = await this.prisma.$transaction(async (tx) => {
        await tx.recipeTagRelation.deleteMany({ where: { recipeId: id } });
        return tx.recipe.update({
          where: { id },
          data: this.toUpdateData(payload),
          include: recipeInclude,
        });
      });
      return this.toPublic(recipe);
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.recipe.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async updateCoverImage(id: string, coverImageUrl: string) {
    try {
      return this.toPublic(await this.prisma.recipe.update({
        where: { id }, data: { coverImageUrl }, include: recipeInclude,
      }));
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async findAll(params?: { page?: string; limit?: string }, admin = false) {
    const page = this.positiveInteger(params?.page, 1);
    const limit = this.positiveInteger(params?.limit, admin ? 25 : 12);
    if (limit > 100) throw new BadRequestException("Limit must be at most 100.");
    const where: Prisma.RecipeWhereInput = admin ? {} : { status: "PUBLISHED" };
    const [recipes, total] = await this.prisma.$transaction([
      this.prisma.recipe.findMany({ where, include: recipeInclude, orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }], skip: (page - 1) * limit, take: limit }),
      this.prisma.recipe.count({ where }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / limit));
    return { data: recipes.map((recipe) => this.toPublic(recipe)), meta: { page, limit, total, totalPages, hasNextPage: page < totalPages, hasPreviousPage: page > 1 } };
  }

  async findOne(id: string) {
    const recipe = await this.prisma.recipe.findUnique({ where: { id }, include: recipeInclude });
    if (!recipe) throw new BadRequestException("Recipe not found.");
    return this.toPublic(recipe);
  }

  async findBySlug(slug: string) {
    const recipe = await this.prisma.recipe.findFirst({ where: { slug: slug.trim().toLowerCase(), status: "PUBLISHED" }, include: recipeInclude });
    if (!recipe) throw new BadRequestException("Recipe not found.");
    return this.toPublic(recipe);
  }

  findAuthors() {
    return this.prisma.recipeAuthor.findMany({ include: { user: { select: { avatarUrl: true } } }, orderBy: { name: "asc" } });
  }

  findCategories() { return this.prisma.recipeCategory.findMany({ orderBy: { name: "asc" } }); }
  findTags() { return this.prisma.recipeTag.findMany({ orderBy: { name: "asc" } }); }

  private parse(input: CreateRecipeDto) {
    const result = createRecipeSchema.safeParse(input);
    if (!result.success) throw new BadRequestException(result.error.issues.map((issue) => issue.message));
    return result.data;
  }

  private baseData(payload: CreateRecipeDto) {
    const { tagIds: _tagIds, content, ingredients, instructions, publishedAt, ...data } = payload;
    void _tagIds;
    return { ...data, content: content as Prisma.InputJsonValue, ingredients: ingredients as Prisma.InputJsonValue, instructions: instructions as Prisma.InputJsonValue, publishedAt: publishedAt ? new Date(publishedAt) : null };
  }

  private toCreateData(payload: CreateRecipeDto): Prisma.RecipeCreateInput {
    const { authorId, categoryId, ...data } = this.baseData(payload);
    return { ...data, author: { connect: { id: authorId } }, category: { connect: { id: categoryId } }, tags: { create: payload.tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) } };
  }

  private toUpdateData(payload: CreateRecipeDto): Prisma.RecipeUpdateInput {
    const { authorId, categoryId, ...data } = this.baseData(payload);
    return { ...data, author: { connect: { id: authorId } }, category: { connect: { id: categoryId } }, tags: { create: payload.tagIds.map((tagId) => ({ tag: { connect: { id: tagId } } })) } };
  }

  private toPublic(recipe: RecipeRecord) {
    return { ...recipe, caloriesKcal: recipe.caloriesKcal === null ? null : Number(recipe.caloriesKcal), carbohydratesGrams: recipe.carbohydratesGrams === null ? null : Number(recipe.carbohydratesGrams), fiberGrams: recipe.fiberGrams === null ? null : Number(recipe.fiberGrams), proteinGrams: recipe.proteinGrams === null ? null : Number(recipe.proteinGrams), fatGrams: recipe.fatGrams === null ? null : Number(recipe.fatGrams), sodiumMg: recipe.sodiumMg === null ? null : Number(recipe.sodiumMg), author: { ...recipe.author, avatarUrl: recipe.author.user.avatarUrl, user: undefined }, tags: recipe.tags.map(({ tag }) => tag) };
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") throw new ConflictException("Recipe slug already exists.");
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2003", "P2025"].includes(error.code)) throw new BadRequestException("Recipe, author, category or tag not found.");
    throw error;
  }

  private positiveInteger(value: string | undefined, fallback: number) {
    const parsed = Number(value ?? fallback);
    if (!Number.isInteger(parsed) || parsed < 1) throw new BadRequestException("Invalid pagination.");
    return parsed;
  }
}
