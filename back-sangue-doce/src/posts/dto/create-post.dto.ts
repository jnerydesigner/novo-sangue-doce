import { z } from 'zod';

export const createPostSchema = z.object({
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain lowercase letters, numbers and hyphens.',
    }),
  title: z
    .string()
    .trim()
    .min(3, { message: 'Title must have at least 3 characters.' }),
  excerpt: z
    .string()
    .trim()
    .min(10, { message: 'Excerpt must have at least 10 characters.' }),
  standfirst: z.string().trim().min(10).optional(),
  content: z.array(z.unknown()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  featured: z.boolean().default(false),
  readingMinutes: z.number().int().min(1).default(5),
  coverImageUrl: z
    .string()
    .trim()
    .min(1, { message: 'Cover image URL is required.' }),
  coverImageAlt: z.string().trim().optional(),
  coverCaption: z.string().trim().optional(),
  verticalImageUrl: z.string().trim().optional(),
  metaTitle: z.string().trim().optional(),
  metaDescription: z.string().trim().optional(),
  publishedAt: z.iso
    .datetime({ message: 'Published at must be a valid ISO datetime.' })
    .optional(),
  authorId: z.uuid({ message: 'Author id must be a valid UUID.' }),
  categoryId: z.uuid({ message: 'Category id must be a valid UUID.' }),
  tagIds: z
    .array(z.uuid({ message: 'Tag id must be a valid UUID.' }))
    .default([]),
});

export type CreatePostDto = z.infer<typeof createPostSchema>;
