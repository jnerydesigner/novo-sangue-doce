import { z } from "zod";

export const requestEmailLoginCodeSchema = z.object({
  email: z.email(),
});

export type RequestEmailLoginCodeDto = z.infer<typeof requestEmailLoginCodeSchema>;
