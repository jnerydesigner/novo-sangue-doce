import { z } from "zod";

export const publicationResultSchema = z.object({
  status: z.literal("PUBLISHED"),
  externalPostId: z.string().nullable(),
  mediaUrn: z.string().nullable(),
  publishedAt: z.string(),
});

export type PublicationResult = z.infer<typeof publicationResultSchema>;
