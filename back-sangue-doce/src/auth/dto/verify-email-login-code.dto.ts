import { z } from "zod";

export const verifyEmailLoginCodeSchema = z.object({
  email: z.email(),
  code: z.string().regex(/^\d{6}$/, "O codigo deve ter 6 digitos."),
});

export type VerifyEmailLoginCodeDto = z.infer<typeof verifyEmailLoginCodeSchema>;
