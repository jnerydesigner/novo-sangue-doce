import { z } from "zod";

export const updateAuthorProfileSchema = z.object({
  bio: z.string().trim().min(10).nullable().optional(),
  role: z.string().trim().min(2, { message: "Role must have at least 2 characters." }),
});

export type UpdateAuthorProfileDto = z.infer<typeof updateAuthorProfileSchema>;
