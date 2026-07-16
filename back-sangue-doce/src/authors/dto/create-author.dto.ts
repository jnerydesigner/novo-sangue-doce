import { z } from "zod";

const authorSocialMediaSchema = z.object({
  name: z.string().trim().min(2, { message: "Social media name must have at least 2 characters." }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Social media slug must contain lowercase letters, numbers and hyphens.",
    }),
  url: z.url({ message: "Social media URL must be valid." }).trim(),
  position: z.number().int().min(0).optional(),
});

export const createAuthorSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must have at least 2 characters." }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain lowercase letters, numbers and hyphens.",
    }),
  role: z.string().trim().min(2, { message: "Role must have at least 2 characters." }),
  bio: z.string().trim().min(10).optional(),
  email: z.email({ message: "A valid e-mail is required." }).trim().toLowerCase().optional(),
  socialMedia: z.array(authorSocialMediaSchema).default([]),
  userId: z.uuid({ message: "User id must be a valid UUID." }),
});

export type CreateAuthorDto = z.infer<typeof createAuthorSchema>;
