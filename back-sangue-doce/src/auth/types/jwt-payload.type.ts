import { z } from "zod";

export const jwtPayloadSchema = z.object({
  sub: z.string(),
  name: z.string(),
  email: z.email(),
  avatarUrl: z.string().optional(),
  birthDate: z.string().optional(),
  diabetesType: z.string(),
  role: z.enum(["ADMIN", "USER"]),
  roles: z.array(z.enum(["ADMIN", "USER"])),
  passwordSetupRequired: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
