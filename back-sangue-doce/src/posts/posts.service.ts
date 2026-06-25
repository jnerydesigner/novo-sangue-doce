import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreatePostDto, createPostSchema } from './dto/create-post.dto';
import { PostEntity } from './entities/post.entity';
import {
  PostAlreadyExistsError,
  type PaginatedPosts,
  PostRelationNotFoundError,
  PostRepository,
} from './repositories/post.repository';
import {
  PublicPost,
  PublicPostCategory,
  PublicPostTag,
} from './types/posts.type';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PostsService {
  constructor(private readonly postRepository: PostRepository) {}

  async create(createPostDto: CreatePostDto): Promise<PublicPost> {
    const payload = this.parseCreatePost(createPostDto);
    const postEntity = PostEntity.create(payload);

    try {
      const post = await this.postRepository.create(postEntity);

      return post.toPublic();
    } catch (error) {
      if (error instanceof PostAlreadyExistsError) {
        const existingPost = await this.postRepository.findAnyBySlug(
          payload.slug,
        );

        const existingPostId = existingPost?.getId();

        if (
          existingPost &&
          existingPostId &&
          existingPost.getStatus() === 'DRAFT'
        ) {
          const updatedPost = await this.postRepository.update(
            existingPostId,
            postEntity,
          );

          return updatedPost.toPublic();
        }

        throw new ConflictException('Post slug already exists.');
      }

      if (error instanceof PostRelationNotFoundError) {
        throw new BadRequestException(
          'Post author, category or one of the tags was not found.',
        );
      }

      throw error;
    }
  }

  async update(id: string, updatePostDto: CreatePostDto): Promise<PublicPost> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid post id.');
    }

    const payload = this.parseCreatePost(updatePostDto);
    const postEntity = PostEntity.create(payload);

    try {
      const post = await this.postRepository.update(id, postEntity);

      return post.toPublic();
    } catch (error) {
      if (error instanceof PostAlreadyExistsError) {
        throw new ConflictException('Post slug already exists.');
      }

      if (error instanceof PostRelationNotFoundError) {
        throw new BadRequestException(
          'Post not found, author, category or one of the tags was not found.',
        );
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid post id.');
    }

    try {
      await this.postRepository.delete(id);
    } catch (error) {
      if (error instanceof PostRelationNotFoundError) {
        throw new BadRequestException('Post not found.');
      }

      throw error;
    }
  }

  async findAll(params?: { page?: string; limit?: string }): Promise<{
    data: PublicPost[];
    meta: PaginatedPosts['meta'];
  }> {
    const page = this.parsePositiveInteger(params?.page, 'page', 1);
    const limit = this.parsePositiveInteger(params?.limit, 'limit', 10);

    if (limit > 50) {
      throw new BadRequestException('Limit must be less than or equal to 50.');
    }

    const posts = await this.postRepository.findAll({ page, limit });

    return {
      data: posts.data.map((post) => post.toPublic()),
      meta: posts.meta,
    };
  }

  async findAllAdmin(params?: { page?: string; limit?: string }): Promise<{
    data: PublicPost[];
    meta: PaginatedPosts['meta'];
  }> {
    const page = this.parsePositiveInteger(params?.page, 'page', 1);
    const limit = this.parsePositiveInteger(params?.limit, 'limit', 25);

    if (limit > 100) {
      throw new BadRequestException('Limit must be less than or equal to 100.');
    }

    const posts = await this.postRepository.findAllAdmin({ page, limit });

    return {
      data: posts.data.map((post) => post.toPublic()),
      meta: posts.meta,
    };
  }

  async findCategories(): Promise<PublicPostCategory[]> {
    return this.postRepository.findCategories();
  }

  async findTags(): Promise<PublicPostTag[]> {
    return this.postRepository.findTags();
  }

  async findOne(id: string): Promise<PublicPost> {
    if (!this.isValidUuid(id)) {
      throw new BadRequestException('Invalid post id.');
    }

    const post = await this.postRepository.findById(id);

    if (!post) {
      throw new BadRequestException('Post not found.');
    }

    return post.toPublic();
  }

  async findSlug(slug: string): Promise<PublicPost> {
    const post = await this.postRepository.findBySlug(
      slug.trim().toLowerCase(),
    );

    if (!post) {
      throw new BadRequestException('Post not found.');
    }

    return post.toPublic();
  }

  private parseCreatePost(createPostDto: CreatePostDto): CreatePostDto {
    const result = createPostSchema.safeParse(createPostDto);

    if (!result.success) {
      throw new BadRequestException(
        result.error.issues.map((issue) => issue.message),
      );
    }

    return result.data;
  }

  private isValidUuid(id: string): boolean {
    return UUID_REGEX.test(id);
  }

  private parsePositiveInteger(
    value: string | undefined,
    fieldName: string,
    defaultValue: number,
  ): number {
    if (value === undefined || value === '') {
      return defaultValue;
    }

    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1) {
      throw new BadRequestException(`${fieldName} must be a positive integer.`);
    }

    return parsed;
  }

  async findPostsByAuthor(authorId: string): Promise<PublicPost[]> {
    if (!this.isValidUuid(authorId)) {
      throw new BadRequestException('Invalid author id.');
    }

    const posts = await this.postRepository.findByAuthorId(authorId);

    return posts.map((post) => post.toPublic());
  }
}
