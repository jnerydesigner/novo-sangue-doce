import { z } from "zod";
import { MEASUREMENT_NOTE_TYPES } from "../measurement.constants";

export const updateMeasurementSchema = z
  .object({
    glucoseValueMgDl: z.number().int().min(40).max(450).optional(),
    noteType: z.enum(MEASUREMENT_NOTE_TYPES).optional(),
    timeZone: z.string().trim().min(1).optional(),
  })
  .refine((value) => value.glucoseValueMgDl !== undefined || value.noteType !== undefined, {
    message: "At least one measurement field is required.",
  });

export type UpdateMeasurementDto = z.infer<typeof updateMeasurementSchema>;
