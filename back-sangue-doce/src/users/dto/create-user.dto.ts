import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must have at least 2 characters.' }),
  email: z
    .email({ message: 'A valid e-mail is required.' })
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(8, { message: 'Password must have at least 8 characters.' }),
  birthDate: z.iso
    .date({
      message: 'Birth date must be a valid date in YYYY-MM-DD format.',
    })
    .optional(),
  diabetesType: z
    .enum(['TYPE_1', 'TYPE_2', 'GESTATIONAL', 'OTHER', 'UNKNOWN'])
    .default('UNKNOWN'),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
