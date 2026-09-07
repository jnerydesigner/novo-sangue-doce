import { describe, expect, it } from "vitest";
import { ReportSmartMapper } from "./report-smart.mapper";

describe("ReportSmartMapper", () => {
  it("keeps only measurements near scheduled report moments", () => {
    const measurements = ReportSmartMapper.mapSmartReportToMeasurements({
      ok: true,
      count: 7,
      user_id: "user-123",
      measurements: [
        { measured_at: "2026-09-03 05:31:00.000", glucose_value_mg_dl: 100 },
        { measured_at: "2026-09-03 06:02:00.000", glucose_value_mg_dl: 110 },
        { measured_at: "2026-09-03 06:20:00.000", glucose_value_mg_dl: 115 },
        { measured_at: "2026-09-03 08:03:00.000", glucose_value_mg_dl: 130 },
        { measured_at: "2026-09-03 10:00:00.000", glucose_value_mg_dl: 140 },
        { measured_at: "2026-09-03 22:15:00.000", glucose_value_mg_dl: 150 },
        { measured_at: "2026-09-03 23:02:00.000", glucose_value_mg_dl: 279 },
      ],
      warnings: [],
    });

    expect(measurements).toEqual([
      {
        measuredAt: "2026-09-03T06:02:00.000",
        glucoseValueMgDl: 110,
        readingContext: "BEFORE_MEAL",
        source: "IMPORT",
        noteType: "BEFORE_BREAKFAST",
        timeZone: "America/Manaus",
      },
      {
        measuredAt: "2026-09-03T08:03:00.000",
        glucoseValueMgDl: 130,
        readingContext: "AFTER_MEAL",
        source: "IMPORT",
        noteType: "AFTER_BREAKFAST",
        timeZone: "America/Manaus",
      },
      {
        measuredAt: "2026-09-03T22:15:00.000",
        glucoseValueMgDl: 150,
        readingContext: "AFTER_MEAL",
        source: "IMPORT",
        noteType: "AFTER_DINNER",
        timeZone: "America/Manaus",
      },
    ]);
  });
});
