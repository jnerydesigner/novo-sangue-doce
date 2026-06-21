import { z } from 'zod';

export const LoginDtoSchema = z.object({
  email: z.email(),
  password: z.string().min(6).max(100),
});

export type LoginDto = z.infer<typeof LoginDtoSchema>;
