import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, { message: "Name must have at least 2 characters." }),
  birthDate: z
    .union([
      z.iso.date({
        message: "Birth date must be a valid date in YYYY-MM-DD format.",
      }),
      z.literal(""),
      z.null(),
    ])
    .optional(),
  diabetesType: z.enum(["TYPE_1", "TYPE_2", "GESTATIONAL", "OTHER", "UNKNOWN"]).default("UNKNOWN"),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
