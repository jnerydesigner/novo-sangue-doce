import { z } from 'zod';
import {
  MEASUREMENT_NOTE_TYPES,
  MEASUREMENT_SOURCES,
  READING_CONTEXTS,
} from '../measurement.constants';

export const createMeasurementSchema = z.object({
  userId: z
    .string()
    .trim()
    .min(1, {
      message: 'User id is required.',
    })
    .optional(),
  measuredAt: z.iso.datetime({
    local: true,
    message: 'Measurement date must be a valid ISO datetime.',
  }),
  glucoseValueMgDl: z
    .number()
    .int({ message: 'Glucose value must be an integer.' })
    .min(40, { message: 'Glucose value must be at least 40 mg/dL.' })
    .max(450, { message: 'Glucose value must be at most 450 mg/dL.' }),
  readingContext: z.enum(READING_CONTEXTS).optional(),
  source: z.enum(MEASUREMENT_SOURCES).default('MANUAL'),
  noteType: z.enum(MEASUREMENT_NOTE_TYPES).optional(),
  timeZone: z.string().trim().min(1).optional(),
});

export type CreateMeasurementDto = z.infer<typeof createMeasurementSchema>;

export const createMeasurementInputSchema = createMeasurementSchema.extend({
  userId: z.string().trim().min(1, {
    message: 'User id is required.',
  }),
});

export type CreateMeasurementInput = z.infer<
  typeof createMeasurementInputSchema
>;
