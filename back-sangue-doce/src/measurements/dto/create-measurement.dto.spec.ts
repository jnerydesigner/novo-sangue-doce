import { describe, expect, it } from "vitest";
import { createMeasurementSchema } from "./create-measurement.dto";

describe("createMeasurementSchema", () => {
  it("accepts ISO datetime with timezone offset from smart service", () => {
    const result = createMeasurementSchema.safeParse({
      measuredAt: "2026-08-16T13:50:00-04:00",
      glucoseValueMgDl: 121,
      source: "SENSOR",
      timeZone: "America/Manaus",
    });

    expect(result.success).toBe(true);
  });
});
