export type PostStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type PostAccentColor = "GREEN" | "TOMATO" | "BLUE";

export type PublicPostAuthor = {
  id: string;
  name: string;
  slug: string;
  role: string;
  bio?: string;
  avatarUrl?: string;
  email?: string;
  socialMedia: {
    name: string;
    slug: string;
    url: string;
    position?: number;
  }[];
};

export type PublicPostCategory = {
  id: string;
  name: string;
  slug: string;
  color: PostAccentColor;
};

export type PublicPostTag = {
  id: string;
  name: string;
  slug: string;
};

export type CreatePostEntityProps = {
  slug: string;
  title: string;
  excerpt: string;
  authorId: string;
  categoryId: string;
  standfirst?: string | null;
  content?: unknown;
  status?: PostStatus;
  featured?: boolean;
  readingMinutes?: number;
  coverImageUrl?: string | null;
  coverImageAlt?: string | null;
  coverCaption?: string | null;
  verticalImageUrl?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  publishedAt?: string | Date | null;
  tagIds?: string[];
};

export type PostPersistence = {
  slug: string;
  title: string;
  excerpt: string;
  standfirst: string | null;
  content: unknown;
  status: PostStatus;
  featured: boolean;
  readingMinutes: number;
  coverImageUrl: string | null;
  coverImageAlt: string | null;
  coverCaption: string | null;
  verticalImageUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  publishedAt: Date | null;
  authorId: string;
  categoryId: string;
};

export type PersistedPostEntityProps = PostPersistence & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  author: PublicPostAuthor;
  category: PublicPostCategory;
  tags: PublicPostTag[];
};

export type PostEntityProps = PostPersistence & {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  author?: PublicPostAuthor;
  category?: PublicPostCategory;
  tags?: PublicPostTag[];
  tagIds?: string[];
};

export type PublicPost = PostPersistence & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  author: PublicPostAuthor;
  category: PublicPostCategory;
  tags: PublicPostTag[];
};
