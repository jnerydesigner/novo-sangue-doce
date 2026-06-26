import type {
  PostAuthor,
  PostCategory,
  PostContentBlock,
  PostStatus,
  PostTag,
} from "./api";

export const DRAFT_POST_STORAGE_KEY = "sangue-doce:draft-post-preview";

export type DraftPostPreview = {
  id?: string;
  status?: PostStatus;
  title: string;
  slug: string;
  excerpt: string;
  category: PostCategory | null;
  author: PostAuthor | null;
  tags: PostTag[];
  readingMinutes: number;
  coverImageUrl: string;
  coverImageAlt?: string;
  content: PostContentBlock[];
  savedAt: string;
};
