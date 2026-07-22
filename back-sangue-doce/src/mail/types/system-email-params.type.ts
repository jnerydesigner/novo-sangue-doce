import { z } from "zod";

export const systemEmailParamsSchema = z.object({
  to: z.union([z.string(), z.array(z.string())]),
  subject: z.string(),
  title: z.string(),
  previewText: z.string().optional(),
  recipientName: z.string().optional(),
  intro: z.string(),
  body: z.string(),
  actionLabel: z.string().optional(),
  actionUrl: z.string().optional(),
  attachments: z
    .array(
      z.object({
        content: z.union([z.instanceof(Buffer), z.string()]),
        contentType: z.string().optional(),
        filename: z.string(),
      }),
    )
    .optional(),
  footerText: z.string().optional(),
});

export type SystemEmailParams = z.infer<typeof systemEmailParamsSchema>;
