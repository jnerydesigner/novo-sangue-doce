import { z } from "zod";

export const googleAuthUserSchema = z.object({
  access_token: z.string(),
});

export type GoogleAuthUser = z.infer<typeof googleAuthUserSchema>;

export const googleProfileUserSchema = z.object({
  email: z.email(),
  googleId: z.string(),
  name: z.string(),
});

export type GoogleProfileUser = z.infer<typeof googleProfileUserSchema>;
