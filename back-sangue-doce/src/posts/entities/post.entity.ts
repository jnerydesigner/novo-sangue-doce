import { PostStatus } from '@prisma/client';
import {
  CreatePostEntityProps,
  PostEntityProps,
  PersistedPostEntityProps,
  PostPersistence,
  PublicPost,
  PublicPostAuthor,
  PublicPostCategory,
} from '../types/posts.type';

export class PostEntity {
  private constructor(private readonly props: PostEntityProps) {}

  static create(props: CreatePostEntityProps): PostEntity {
    return new PostEntity({
      slug: props.slug.trim().toLowerCase(),
      title: props.title.trim(),
      excerpt: props.excerpt.trim(),
      standfirst: props.standfirst?.trim() || null,
      content: props.content ?? [],
      status: props.status ?? 'DRAFT',
      featured: props.featured ?? false,
      readingMinutes: props.readingMinutes ?? 5,
      coverImageUrl: props.coverImageUrl?.trim() || null,
      coverImageAlt: props.coverImageAlt?.trim() || null,
      coverCaption: props.coverCaption?.trim() || null,
      verticalImageUrl: props.verticalImageUrl?.trim() || null,
      metaTitle: props.metaTitle?.trim() || null,
      metaDescription: props.metaDescription?.trim() || null,
      publishedAt: props.publishedAt ? new Date(props.publishedAt) : null,
      authorId: props.authorId,
      categoryId: props.categoryId,
      tagIds: props.tagIds ?? [],
    });
  }

  static fromPersistence(props: PersistedPostEntityProps): PostEntity {
    return new PostEntity(props);
  }

  toPersistence(): PostPersistence {
    return {
      slug: this.props.slug,
      title: this.props.title,
      excerpt: this.props.excerpt,
      standfirst: this.props.standfirst,
      content: this.props.content,
      status: this.props.status,
      featured: this.props.featured,
      readingMinutes: this.props.readingMinutes,
      coverImageUrl: this.props.coverImageUrl,
      coverImageAlt: this.props.coverImageAlt,
      coverCaption: this.props.coverCaption,
      verticalImageUrl: this.props.verticalImageUrl,
      metaTitle: this.props.metaTitle,
      metaDescription: this.props.metaDescription,
      publishedAt: this.props.publishedAt,
      authorId: this.props.authorId,
      categoryId: this.props.categoryId,
    };
  }

  getTagIds(): string[] {
    return this.props.tagIds ?? [];
  }

  getId(): string | undefined {
    return this.props.id;
  }

  getStatus(): PostStatus {
    return this.props.status;
  }

  toPublic(): PublicPost {
    return {
      id: this.props.id as string,
      ...this.toPersistence(),
      createdAt: this.props.createdAt as Date,
      updatedAt: this.props.updatedAt as Date,
      author: this.props.author as PublicPostAuthor,
      category: this.props.category as PublicPostCategory,
      tags: this.props.tags ?? [],
    };
  }
}
