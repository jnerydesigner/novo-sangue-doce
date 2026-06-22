import { z } from 'zod';

export const createAuthorSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must have at least 2 characters.' }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: 'Slug must contain lowercase letters, numbers and hyphens.',
    }),
  role: z
    .string()
    .trim()
    .min(2, { message: 'Role must have at least 2 characters.' }),
  bio: z.string().trim().min(10).optional(),
  avatarUrl: z.url({ message: 'Avatar URL must be valid.' }).optional(),
  email: z
    .email({ message: 'A valid e-mail is required.' })
    .trim()
    .toLowerCase()
    .optional(),
  userId: z.uuid({ message: 'User id must be a valid UUID.' }),
});

export type CreateAuthorDto = z.infer<typeof createAuthorSchema>;
