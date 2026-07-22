type ExportReportButtonProps = {
  birthDate?: string;
  diabetesType?: string;
  endDate?: string;
  month: number;
  reportUrl: string;
  startDate?: string;
  year: number;
  format?: "pdf" | "png";
};

export function ExportReportButton({
  birthDate,
  diabetesType,
  endDate,
  month,
  reportUrl,
  startDate,
  year,
  format = "pdf",
}: ExportReportButtonProps) {
  const searchParams = new URLSearchParams({
    reportUrl,
  });

  if (startDate && endDate) {
    searchParams.set("startDate", startDate);
    searchParams.set("endDate", endDate);
  } else {
    searchParams.set("month", String(month));
    searchParams.set("year", String(year));
  }

  if (birthDate) {
    searchParams.set("birthDate", birthDate);
  }

  if (diabetesType) {
    searchParams.set("diabetesType", diabetesType);
  }

  return (
    <a
      className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep print:hidden"
      href={`/api/measurements/reports/monthly-${format === "png" ? "image" : "pdf"}?${searchParams}`}
    >
      {format === "png" ? "Exportar imagem" : "Exportar PDF"}
    </a>
  );
}
