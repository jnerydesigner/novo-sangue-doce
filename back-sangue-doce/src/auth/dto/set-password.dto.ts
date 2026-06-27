import { z } from "zod";

export const setPasswordSchema = z.object({
  password: z.string().min(8, { message: "Password must have at least 8 characters." }),
});

export type SetPasswordDto = z.infer<typeof setPasswordSchema>;
