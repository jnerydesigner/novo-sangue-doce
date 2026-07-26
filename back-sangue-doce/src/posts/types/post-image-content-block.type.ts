import { z } from "zod";

export const postImageContentBlockSchema = z.object({
  type: z.literal("image"),
  src: z.string(),
  alt: z.string().optional(),
  caption: z.string().optional(),
});

export type PostImageContentBlock = z.infer<typeof postImageContentBlockSchema>;
