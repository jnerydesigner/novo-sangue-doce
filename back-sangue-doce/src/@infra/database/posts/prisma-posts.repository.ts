import { PostEntity } from "@app/posts/entities/post.entity";
import {
  type PaginatedPosts,
  PostAlreadyExistsError,
  type PostImageRecord,
  type PostPaginationParams,
  PostRelationNotFoundError,
  PostTaxonomyAlreadyExistsError,
  type PostRepository,
  type UpdatePostImageMetadata,
} from "@app/posts/repositories/post.repository";
import type {
  PersistedPostEntityProps,
  PublicPostCategory,
  PublicPostTag,
} from "@app/posts/types/posts.type";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../prisma.service";

const postInclude = {
  author: {
    include: {
      user: {
        select: {
          avatarUrl: true,
        },
      },
    },
  },
  category: true,
  tags: {
    include: {
      tag: true,
    },
  },
} satisfies Prisma.PostInclude;

type PostRecord = Prisma.PostGetPayload<{ include: typeof postInclude }>;

@Injectable()
export class PrismaPostsRepository implements PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(post: PostEntity): Promise<PostEntity> {
    const payload = post.toPersistence();
    const tagIds = post.getTagIds();

    try {
      const createdPost = await this.prisma.post.create({
        data: {
          ...payload,
          content: payload.content as Prisma.InputJsonValue,
        },
      });

      if (tagIds.length > 0) {
        await this.prisma.postTagRelation.createMany({
          data: tagIds.map((tagId) => ({
            postId: createdPost.id,
            tagId,
          })),
          skipDuplicates: true,
        });
      }

      const postWithRelations = await this.findById(createdPost.id);

      if (!postWithRelations) {
        throw new PostRelationNotFoundError();
      }

      return postWithRelations;
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PostAlreadyExistsError();
      }

      if (this.isForeignKeyError(error) || this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  async update(id: string, post: PostEntity): Promise<PostEntity> {
    const payload = post.toPersistence();
    const tagIds = post.getTagIds();

    try {
      const postWithRelations = await this.prisma.$transaction(async (tx) => {
        await tx.post.update({
          where: { id },
          data: {
            ...payload,
            content: payload.content as Prisma.InputJsonValue,
          },
        });

        await tx.postTagRelation.deleteMany({
          where: { postId: id },
        });

        if (tagIds.length > 0) {
          await tx.postTagRelation.createMany({
            data: tagIds.map((tagId) => ({
              postId: id,
              tagId,
            })),
            skipDuplicates: true,
          });
        }

        return tx.post.findUnique({
          where: { id },
          include: postInclude,
        });
      });

      if (!postWithRelations) {
        throw new PostRelationNotFoundError();
      }

      return this.toEntity(postWithRelations);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PostAlreadyExistsError();
      }

      if (this.isForeignKeyError(error) || this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  async findAll(params: PostPaginationParams): Promise<PaginatedPosts> {
    const skip = (params.page - 1) * params.limit;
    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        where: { status: "PUBLISHED" },
        skip,
        take: params.limit,
      }),
      this.prisma.post.count({ where: { status: "PUBLISHED" } }),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      data: posts.map((post) => this.toEntity(post)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async findAllAdmin(params: PostPaginationParams): Promise<PaginatedPosts> {
    const skip = (params.page - 1) * params.limit;
    const [posts, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        include: postInclude,
        orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
        skip,
        take: params.limit,
      }),
      this.prisma.post.count(),
    ]);
    const totalPages = Math.max(1, Math.ceil(total / params.limit));

    return {
      data: posts.map((post) => this.toEntity(post)),
      meta: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages,
        hasNextPage: params.page < totalPages,
        hasPreviousPage: params.page > 1,
      },
    };
  }

  async findCategories(): Promise<PublicPostCategory[]> {
    return this.prisma.postCategory.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createCategory(category: PublicPostCategory): Promise<PublicPostCategory> {
    try {
      return await this.prisma.postCategory.create({
        data: {
          color: category.color,
          name: category.name,
          slug: category.slug,
        },
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PostTaxonomyAlreadyExistsError();
      }

      throw error;
    }
  }

  async createTag(tag: PublicPostTag): Promise<PublicPostTag> {
    try {
      return await this.prisma.postTag.create({
        data: {
          name: tag.name,
          slug: tag.slug,
        },
      });
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new PostTaxonomyAlreadyExistsError();
      }

      throw error;
    }
  }

  async findTags(): Promise<PublicPostTag[]> {
    return this.prisma.postTag.findMany({
      orderBy: { name: "asc" },
    });
  }

  async findById(id: string): Promise<PostEntity | null> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: postInclude,
    });

    return post ? this.toEntity(post) : null;
  }

  async findBySlug(slug: string): Promise<PostEntity | null> {
    const post = await this.prisma.post.findFirst({
      where: { slug, status: "PUBLISHED" },
      include: postInclude,
    });

    return post ? this.toEntity(post) : null;
  }

  async findAnyBySlug(slug: string): Promise<PostEntity | null> {
    const post = await this.prisma.post.findUnique({
      where: { slug },
      include: postInclude,
    });

    return post ? this.toEntity(post) : null;
  }

  async findByAuthorId(authorId: string): Promise<PostEntity[]> {
    const posts = await this.prisma.post.findMany({
      where: { authorId },
      include: postInclude,
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });

    return posts.map((post) => this.toEntity(post));
  }

  async updatePostCoverImage(postId: string, imageUrl: string): Promise<PostEntity> {
    try {
      const post = await this.prisma.post.update({
        where: {
          id: postId,
        },
        data: {
          coverImageUrl: imageUrl,
        },
        include: postInclude,
      });

      return this.toEntity(post);
    } catch (error) {
      if (this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  async findPostImageByPostId(postId: string): Promise<PostImageRecord | null> {
    return this.prisma.postImages.findUnique({
      where: {
        postId,
      },
    });
  }

  async upsertPostImage(postId: string, imageUrl: string): Promise<PostImageRecord> {
    try {
      return await this.prisma.postImages.upsert({
        where: {
          postId,
        },
        create: {
          postId,
          imageUrl,
        },
        update: {
          imageUrl,
        },
      });
    } catch (error) {
      if (this.isForeignKeyError(error) || this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  async updatePostImageMetadata(
    postId: string,
    metadata: UpdatePostImageMetadata,
  ): Promise<PostImageRecord | null> {
    try {
      return await this.prisma.postImages.upsert({
        where: {
          postId,
        },
        create: {
          postId,
          imageUrl: metadata.imageUrl,
          imageAlt: metadata.imageAlt,
          imageLegend: metadata.imageLegend,
        },
        update: {
          imageUrl: metadata.imageUrl,
          imageAlt: metadata.imageAlt,
          imageLegend: metadata.imageLegend,
        },
      });
    } catch (error) {
      if (this.isForeignKeyError(error) || this.isRecordNotFoundError(error)) {
        throw new PostRelationNotFoundError();
      }

      throw error;
    }
  }

  private toEntity(post: PostRecord): PostEntity {
    const props: PersistedPostEntityProps = {
      ...post,
      author: {
        id: post.author.id,
        name: post.author.name,
        slug: post.author.slug,
        role: post.author.role,
        bio: post.author.bio ?? undefined,
        avatarUrl: post.author.user.avatarUrl ?? undefined,
        email: post.author.email ?? undefined,
      },
      category: post.category,
      tags: post.tags.map(({ tag }) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
      })),
    };

    return PostEntity.fromPersistence(props);
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
  }

  private isForeignKeyError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003";
  }

  private isRecordNotFoundError(error: unknown): boolean {
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
  }
}
