import { z } from "zod";

const hashtagSchema = z
  .string()
  .trim()
  .min(1)
  .transform((value) => (value.startsWith("#") ? value : `#${value}`));

export const institutionalPublicationSchema = z.object({
  title: z.string().trim().min(3).max(180),
  content: z.string().trim().min(1).max(5_000),
  hashtags: z.array(hashtagSchema).max(10).default([]),
  imageKey: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
});

export type InstitutionalPublicationDto = z.infer<typeof institutionalPublicationSchema>;
