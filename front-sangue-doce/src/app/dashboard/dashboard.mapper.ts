import type { Measurement, MonthlyMeasurementReport } from "@/lib/api";

type DashboardMapperInput = {
  monthlyReport: MonthlyMeasurementReport;
};

export type DashboardViewModel = {
  lastMedition: Measurement | null;
};

export function mapDashboardData({ monthlyReport }: DashboardMapperInput): DashboardViewModel {
  const measurements = monthlyReport.days
    .flatMap((day) => day.measurements)
    .filter((measurement) => Number.isFinite(new Date(measurement.measuredAt).getTime()));

  const lastMedition =
    measurements.length > 0
      ? measurements.reduce((latest, measurement) =>
          new Date(measurement.measuredAt).getTime() > new Date(latest.measuredAt).getTime()
            ? measurement
            : latest,
        )
      : null;

  return {
    lastMedition,
  };
}
