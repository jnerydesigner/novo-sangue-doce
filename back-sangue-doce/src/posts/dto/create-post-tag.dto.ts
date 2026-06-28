import { z } from "zod";

export const createPostTagSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must have at least 2 characters." }),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain lowercase letters, numbers and hyphens.",
    }),
});

export type CreatePostTagDto = z.infer<typeof createPostTagSchema>;
