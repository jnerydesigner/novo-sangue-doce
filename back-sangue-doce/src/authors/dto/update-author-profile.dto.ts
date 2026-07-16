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

export const updateAuthorProfileSchema = z.object({
  bio: z.string().trim().min(10).nullable().optional(),
  role: z.string().trim().min(2, { message: "Role must have at least 2 characters." }),
  socialMedia: z.array(authorSocialMediaSchema).default([]),
});

export type UpdateAuthorProfileDto = z.infer<typeof updateAuthorProfileSchema>;
