import { z } from "zod";

export const socialPublicationGenerationModeSchema = z.enum([
  "NEW_PUBLICATION",
  "REGENERATE_TEXT",
  "REGENERATE_IMAGE",
]);
export type SocialPublicationGenerationMode = z.infer<typeof socialPublicationGenerationModeSchema>;

export const createSocialPublicationSchema = z.object({
  aspectRatio: z.enum(["1:1", "4:5", "16:9"]).default("1:1"),
  forceNewVersion: z.boolean().default(false),
  generationMode: socialPublicationGenerationModeSchema.default("NEW_PUBLICATION"),
  parentPublicationId: z.uuid().optional(),
  imageEditInstruction: z.string().trim().min(3).max(500).optional(),
});

export type CreateSocialPublicationDto = z.infer<typeof createSocialPublicationSchema>;

export const createSocialPublicationBodySchema = z.object({
  postId: z.uuid(),
  aspectRatio: z.enum(["1:1", "4:5", "16:9"]).default("1:1"),
  forceNewVersion: z.boolean().default(false),
  generationMode: socialPublicationGenerationModeSchema.default("NEW_PUBLICATION"),
  parentPublicationId: z.uuid().optional(),
  imageEditInstruction: z.string().trim().min(3).max(500).optional(),
});

export type CreateSocialPublicationBodyDto = z.infer<typeof createSocialPublicationBodySchema>;
