import type { PostEntity } from "../entities/post.entity";
import type { PublicPostCategory, PublicPostTag } from "../types/posts.type";

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

export type PostImageRecord = {
  id: string;
  postId: string;
  imageUrl: string;
  imageAlt: string | null;
  imageLegend: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type UpdatePostImageMetadata = {
  imageUrl: string;
  imageAlt: string | null;
  imageLegend: string | null;
};

export class PostAlreadyExistsError extends Error {
  constructor() {
    super("Post already exists.");
    this.name = "PostAlreadyExistsError";
  }
}

export class PostRelationNotFoundError extends Error {
  constructor() {
    super("Post relation not found.");
    this.name = "PostRelationNotFoundError";
  }
}

export class PostTaxonomyAlreadyExistsError extends Error {
  constructor() {
    super("Post taxonomy already exists.");
    this.name = "PostTaxonomyAlreadyExistsError";
  }
}

export abstract class PostRepository {
  abstract create(post: PostEntity): Promise<PostEntity>;
  abstract update(id: string, post: PostEntity): Promise<PostEntity>;
  abstract delete(id: string): Promise<void>;
  abstract findAll(params: PostPaginationParams): Promise<PaginatedPosts>;
  abstract findAllAdmin(params: PostPaginationParams): Promise<PaginatedPosts>;
  abstract createCategory(category: PublicPostCategory): Promise<PublicPostCategory>;
  abstract createTag(tag: PublicPostTag): Promise<PublicPostTag>;
  abstract updateCategory(id: string, category: PublicPostCategory): Promise<PublicPostCategory>;
  abstract updateTag(id: string, tag: PublicPostTag): Promise<PublicPostTag>;
  abstract findCategories(): Promise<PublicPostCategory[]>;
  abstract findTags(): Promise<PublicPostTag[]>;
  abstract findById(id: string): Promise<PostEntity | null>;
  abstract findBySlug(slug: string): Promise<PostEntity | null>;
  abstract findAnyBySlug(slug: string): Promise<PostEntity | null>;
  abstract findByAuthorId(authorId: string): Promise<PostEntity[]>;
  abstract updatePostCoverImage(postId: string, imageUrl: string): Promise<PostEntity>;
  abstract findPostImageByPostId(postId: string): Promise<PostImageRecord | null>;
  abstract upsertPostImage(postId: string, imageUrl: string): Promise<PostImageRecord>;
  abstract updatePostImageMetadata(
    postId: string,
    metadata: UpdatePostImageMetadata,
  ): Promise<PostImageRecord | null>;
}
