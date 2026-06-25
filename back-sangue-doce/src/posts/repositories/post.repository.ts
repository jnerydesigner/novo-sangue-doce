import { PostEntity } from '../entities/post.entity';
import { PublicPostCategory, PublicPostTag } from '../types/posts.type';

export type PostPaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedPosts = {
  data: PostEntity[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export class PostAlreadyExistsError extends Error {
  constructor() {
    super('Post already exists.');
    this.name = 'PostAlreadyExistsError';
  }
}

export class PostRelationNotFoundError extends Error {
  constructor() {
    super('Post relation not found.');
    this.name = 'PostRelationNotFoundError';
  }
}

export abstract class PostRepository {
  abstract create(post: PostEntity): Promise<PostEntity>;
  abstract update(id: string, post: PostEntity): Promise<PostEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(params: PostPaginationParams): Promise<PaginatedPosts>;
  abstract findAllAdmin(params: PostPaginationParams): Promise<PaginatedPosts>;
  abstract findCategories(): Promise<PublicPostCategory[]>;
  abstract findTags(): Promise<PublicPostTag[]>;
  abstract findById(id: string): Promise<PostEntity | null>;
  abstract findBySlug(slug: string): Promise<PostEntity | null>;
  abstract findAnyBySlug(slug: string): Promise<PostEntity | null>;
  abstract findByAuthorId(authorId: string): Promise<PostEntity[]>;
}
