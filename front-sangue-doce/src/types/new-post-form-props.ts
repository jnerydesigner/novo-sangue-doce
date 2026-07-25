import { Post, PostAuthor, PostCategory, PostTag } from "@/lib/api";

export type NewPostFormProps = {
  authors: PostAuthor[];
  categories: PostCategory[];
  initialPost?: Post | null;
  tags: PostTag[];
};
