import { cookies } from "next/headers";
import Image from "next/image";
import { redirect } from "next/navigation";
import { api, type Measurement, type MeasurementNoteType } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { DashboardHeader } from "../components/dashboard-header";
import { DashboardSidebar } from "../components/dashboard-sidebar";
import { ExportReportButton } from "./export-report-button";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: Promise<{
    endDate?: string;
    month?: string;
    startDate?: string;
    year?: string;
  }>;
};

type ReportColumn = {
  key: string;
  label: string;
  noteTypes: MeasurementNoteType[];
};

const reportColumns: ReportColumn[] = [
  {
    key: "beforeBreakfast",
    label: "Antes do cafe",
    noteTypes: ["FASTING_WAKE_UP", "BEFORE_BREAKFAST"],
  },
  {
    key: "afterBreakfast",
    label: "Depois do cafe",
    noteTypes: ["AFTER_BREAKFAST"],
  },
  {
    key: "beforeLunch",
    label: "Antes do almoco",
    noteTypes: ["BEFORE_LUNCH"],
  },
  {
    key: "afterLunch",
    label: "Depois do almoco",
    noteTypes: ["AFTER_LUNCH"],
  },
  {
    key: "beforeDinner",
    label: "Antes da janta",
    noteTypes: ["BEFORE_DINNER"],
  },
  {
    key: "afterDinner",
    label: "Depois da janta",
    noteTypes: ["AFTER_DINNER", "BEFORE_SLEEP"],
  },
];

function formatDate(value: string | Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function getMonthLabel(year: number, month: number) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)));
}

function getQueryNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);

  return Number.isInteger(parsed) ? parsed : fallback;
}

function getMeasurementForColumn(
  measurements: Measurement[],
  column: ReportColumn,
) {
  return (
    measurements.find((measurement) =>
      column.noteTypes.includes(measurement.noteType as MeasurementNoteType),
    ) ?? null
  );
}

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const query = (await searchParams) ?? {};
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    redirect("/login");
  }

  const userData = await api.auth.profile(accessToken).catch(() => null);

  if (!userData) {
    redirect("/login");
  }

  if (userData.passwordSetupRequired) {
    redirect("/dashboard/account/password");
  }

  const today = new Date();
  const queryStartDate = query.startDate;
  const queryEndDate = query.endDate;
  const selectedYear = getQueryNumber(query.year, today.getFullYear());
  const selectedMonth = getQueryNumber(query.month, today.getMonth() + 1);
  const reportQuery =
    queryStartDate && queryEndDate
      ? {
          accessToken,
          endDate: queryEndDate,
          startDate: queryStartDate,
        }
      : {
          accessToken,
          month: selectedMonth,
          year: selectedYear,
        };
  const monthlyReport = await api.measurements.monthlyReport({
    ...reportQuery,
  });
  const diabetesType = userData.diabetesType.replace("Diabetes tipo ", "");
  const showAdminItems = userData.role === "ADMIN";
  const reportUrlSearchParams = new URLSearchParams();

  if (queryStartDate && queryEndDate) {
    reportUrlSearchParams.set("startDate", queryStartDate);
    reportUrlSearchParams.set("endDate", queryEndDate);
  } else {
    reportUrlSearchParams.set("year", String(monthlyReport.year));
    reportUrlSearchParams.set("month", String(monthlyReport.month));
  }

  const reportUrl = `/dashboard/reports?${reportUrlSearchParams.toString()}`;
  const reportAvatarUrl = resolvePublicImageUrl(
    monthlyReport.userAvatarUrl ?? userData.avatarUrl,
  );
  const periodLabel =
    queryStartDate && queryEndDate
      ? `${formatDate(queryStartDate)} a ${formatDate(queryEndDate)}`
      : getMonthLabel(monthlyReport.year, monthlyReport.month);

  return (
    <main className="min-h-screen bg-paper text-ink">
      <div className="grid min-h-screen lg:grid-cols-[248px_1fr] print:block">
        <div className="print:hidden">
          <DashboardSidebar showAdminItems={showAdminItems} />
        </div>

        <section className="min-w-0 px-[clamp(18px,4vw,42px)] py-6 print:p-0">
          <div className="print:hidden">
            <DashboardHeader
              avatarUrl={userData.avatarUrl}
              subtitle="Essa e uma area de atualizacao de dados."
              title="Relatorios de glicemia"
              userName={userData.name}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-4 print:hidden">
            <div>
              <span className="eyebrow">Relatorios</span>
              <h1 className="mt-3 font-serif text-[clamp(1.9rem,3vw,2.6rem)] font-medium leading-tight">
                Relatorio mensal de glicemia
              </h1>
              <p className="mt-2 text-[15px] text-inkSoft">
                Visualizacao pronta para baixar em PDF pelo backend.
              </p>
              <form
                action="/dashboard/reports"
                className="mt-4 flex flex-wrap items-end gap-3"
                method="get"
              >
                <label className="grid gap-1 text-[13px] font-semibold text-muted">
                  Inicio
                  <input
                    className="rounded-lg border border-lineStrong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-green"
                    defaultValue={queryStartDate}
                    name="startDate"
                    type="date"
                  />
                </label>
                <label className="grid gap-1 text-[13px] font-semibold text-muted">
                  Fim
                  <input
                    className="rounded-lg border border-lineStrong bg-paper px-3 py-2 text-sm text-ink outline-none focus:border-green"
                    defaultValue={queryEndDate}
                    name="endDate"
                    type="date"
                  />
                </label>
                <button
                  className="rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                  type="submit"
                >
                  Aplicar range
                </button>
              </form>
            </div>
            <ExportReportButton
              birthDate={userData.birthDate}
              diabetesType={userData.diabetesType}
              endDate={queryEndDate}
              month={monthlyReport.month}
              reportUrl={reportUrl}
              startDate={queryStartDate}
              year={monthlyReport.year}
            />
          </div>

          <article className="mt-6 overflow-hidden rounded-lg border border-line bg-card p-5 shadow-editorial print:m-0 print:min-h-screen print:rounded-none print:border-0 print:p-8 print:shadow-none">
            <div className="grid gap-6 md:grid-cols-[130px_1fr_auto] print:grid-cols-[96px_1fr_112px]">
              <div
                aria-label={`Foto de ${monthlyReport.userName}`}
                className="grid h-[120px] place-items-center overflow-hidden rounded-lg border border-line bg-paper2 bg-cover bg-center text-sm font-bold uppercase tracking-[0.12em] text-muted print:h-[90px] print:text-[11px]"
                role="img"
                style={
                  reportAvatarUrl
                    ? { backgroundImage: `url(${reportAvatarUrl})` }
                    : undefined
                }
              >
                {reportAvatarUrl ? (
                  <span className="sr-only">{monthlyReport.userName}</span>
                ) : (
                  "Foto"
                )}
              </div>

              <div className="grid gap-2 text-[14px] print:text-[11px]">
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">Nome:</span>
                  <strong className="uppercase text-ink">
                    {userData.name}
                  </strong>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">
                    Data nasc:
                  </span>
                  <span>{userData.birthDate ?? "Nao informado"}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">
                    Inicio amostragem:
                  </span>
                  <span>{formatDate(monthlyReport.period.startDate)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">
                    Fim amostragem:
                  </span>
                  <span>{formatDate(monthlyReport.period.endDate)}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">
                    Tipo diabetes:
                  </span>
                  <span>{diabetesType}</span>
                </div>
                <div className="grid grid-cols-[150px_1fr] gap-4 print:grid-cols-[120px_1fr]">
                  <span className="font-bold uppercase text-muted">
                    Periodo:
                  </span>
                  <span className="capitalize">{periodLabel}</span>
                </div>
              </div>

              <div className="flex items-start justify-start md:justify-end print:justify-end">
                <div className="flex items-center gap-3 rounded-lg border border-line bg-paper px-4 py-3 print:border-0 print:bg-transparent print:px-0 print:py-0">
                  <Image
                    alt="Sangue Doce"
                    className="size-12 rounded-lg object-cover print:size-10"
                    height={48}
                    src="/sangue-doce-logo-small.png"
                    width={48}
                  />
                  <div className="min-w-0">
                    <strong className="block font-serif text-xl font-medium leading-none text-greenDeep print:text-[14px]">
                      Sangue Doce
                    </strong>
                    <span className="mt-1 block text-[12px] font-bold uppercase tracking-[0.12em] text-muted print:text-[8px]">
                      Relatorio de glicemia
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto print:overflow-visible">
              <table className="w-full min-w-[880px] border-collapse text-center text-[13px] print:min-w-0 print:text-[8.6px]">
                <thead>
                  <tr className="border-y border-line bg-paper2">
                    <th className="px-2 py-2 text-left font-bold uppercase">
                      Dia
                    </th>
                    {reportColumns.map((column) => (
                      <th
                        className="px-2 py-2 font-bold uppercase"
                        key={column.key}
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyReport.days.map((day) => (
                    <tr className="border-b border-line/70" key={day.date}>
                      <td className="px-2 py-2 text-left font-semibold">
                        {formatDate(day.date)}
                      </td>
                      {reportColumns.map((column) => {
                        const measurement = getMeasurementForColumn(
                          day.measurements,
                          column,
                        );

                        return (
                          <td className="px-2 py-2" key={column.key}>
                            {measurement?.glucoseValueMgDl ?? ""}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="mt-7 text-center text-muted print:mt-5">
              <p className="text-[12px] font-bold uppercase tracking-[0.08em] print:text-[9px]">
                Este relatorio foi gerado pelo site Sangue Doce
              </p>
              <p className="mt-1 break-all text-[11px] print:text-[7.5px]">
                {reportUrl}
              </p>
            </footer>
          </article>
        </section>
      </div>
    </main>
  );
}
