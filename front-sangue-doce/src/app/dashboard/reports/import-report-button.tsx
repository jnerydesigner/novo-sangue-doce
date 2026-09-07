"use client";

import {
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button, IconButton } from "@/components/buttons/button";
import { InputField } from "@/components/forms/input-field";
import { SelectField } from "@/components/forms/select-field";

const sensorManufacturers = [
  "Sibionics",
  "Dexcom",
  "Freestyle",
  "Accu_Chek",
  "Medtronic",
  "Senseonics",
  "Sinocare",
  "ISens",
  "Medtrum",
  "MicroTech",
  "Infinovo",
  "Yuwell",
  "POCTech",
  "AgaMatrix",
  "WaveForm",
  "Nemaura",
  "Syai",
  "Bionime",
  "Ottai",
  "MeiQi",
  "Biolinq",
  "Other",
] as const;

type ImportState = {
  error: string | null;
  importedCount: number | null;
  progress: number;
  status: "idle" | "submitting" | "queued" | "processing" | "completed";
};

type QueuedImportResponse = {
  jobId: string;
  status: "queued";
};

type ImportStatusResponse = {
  error?: string;
  importedCount?: number;
  progress?: number;
  status: "queued" | "processing" | "completed" | "failed" | "unknown";
};

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return "Nao foi possivel importar o relatorio.";
  }

  const message = payload.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string"
    ? message
    : "Nao foi possivel importar o relatorio.";
}

export function ImportReportButton() {
  const router = useRouter();
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [state, setState] = useState<ImportState>({
    error: null,
    importedCount: null,
    progress: 0,
    status: "idle",
  });

  const isWorking =
    state.status === "submitting" ||
    state.status === "queued" ||
    state.status === "processing";

  function closeModal() {
    setIsOpen(false);
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("report");

    if (!(file instanceof File) || file.size === 0) {
      setState({
        error: "Selecione um arquivo de relatorio.",
        importedCount: null,
        progress: 0,
        status: "idle",
      });
      return;
    }

    setState({
      error: null,
      importedCount: null,
      progress: 0,
      status: "submitting",
    });

    try {
      const response = await fetch("/api/measurements/import-report", {
        body: formData,
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(payload));
      }

      const queuedImport = payload as QueuedImportResponse;
      form.reset();
      setSelectedFileName("");
      setIsOpen(false);
      setState({
        error: null,
        importedCount: null,
        progress: 0,
        status: "queued",
      });
      void waitForImportCompletion(queuedImport.jobId).catch((error) => {
        const message =
          error instanceof Error
            ? error.message
            : "Nao foi possivel importar o relatorio.";

        setState({
          error: message,
          importedCount: null,
          progress: 0,
          status: "idle",
        });
        toast.error(message);
      });
    } catch (error) {
      setState({
        error:
          error instanceof Error
            ? error.message
            : "Nao foi possivel importar o relatorio.",
        importedCount: null,
        progress: 0,
        status: "idle",
      });
    }
  }

  async function waitForImportCompletion(jobId: string) {
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 1_200));

      const response = await fetch(
        `/api/measurements/import-report/status/${jobId}`,
      );
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(payload));
      }

      const status = payload as ImportStatusResponse;

      if (status.status === "failed") {
        throw new Error(
          status.error || "Nao foi possivel importar o relatorio.",
        );
      }

      if (status.status === "completed") {
        setState({
          error: null,
          importedCount: status.importedCount ?? 0,
          progress: 100,
          status: "completed",
        });
        router.refresh();
        toast.success(
          `${status.importedCount ?? 0} medições importadas. Relatório atualizado.`,
        );
        return;
      }

      setState((current) => ({
        ...current,
        progress: status.progress ?? current.progress,
        status: status.status === "processing" ? "processing" : "queued",
      }));
    }
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        {isWorking || state.status === "completed" || state.error ? (
          <div className="flex h-10 min-w-[220px] items-center gap-3 rounded-lg border border-line bg-white px-3 text-sm font-semibold text-inkSoft">
            {isWorking ? (
              <Loader2
                className="size-4 animate-spin text-green"
                strokeWidth={2.2}
              />
            ) : state.status === "completed" ? (
              <CheckCircle2 className="size-4 text-green" strokeWidth={2.2} />
            ) : (
              <X className="size-4 text-red-600" strokeWidth={2.2} />
            )}
            <span className="min-w-0 flex-1 truncate">
              {isWorking
                ? state.status === "processing"
                  ? "Processando relatório"
                  : "Relatório na fila"
                : state.error
                  ? state.error
                  : `${state.importedCount ?? 0} medições importadas`}
            </span>
            {isWorking ? (
              <span className="tabular-nums text-ink">
                {Math.round(state.progress)}%
              </span>
            ) : null}
          </div>
        ) : null}

        <Button
          className="h-10"
          disabled={isWorking}
          onClick={() => setIsOpen(true)}
          size="sm"
          variant="secondary"
        >
          <Upload className="size-4" strokeWidth={2.2} />
          Importar relatório
        </Button>
      </div>

      {isOpen ? (
        <div
          aria-labelledby={dialogTitleId}
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6 print:hidden"
          onMouseDown={closeModal}
          role="dialog"
        >
          <div
            className="w-full max-w-[480px] rounded-xl border border-line bg-card p-5 shadow-editorial"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2
                  className="text-xl font-bold leading-tight text-ink"
                  id={dialogTitleId}
                >
                  Importar relatório
                </h2>
                <p className="mt-1 text-sm text-inkSoft">
                  Envie a planilha gerada pelo sensor.
                </p>
              </div>
              <IconButton aria-label="Fechar modal" onClick={closeModal}>
                <X className="size-4" strokeWidth={2.2} />
              </IconButton>
            </div>

            <form className="mt-5 grid gap-4" onSubmit={submitImport}>
              <SelectField
                icon={FileSpreadsheet}
                label="Fabricante"
                name="sensorManufacturer"
                required
                defaultValue="Sibionics"
              >
                {sensorManufacturers.map((manufacturer) => (
                  <option key={manufacturer} value={manufacturer}>
                    {manufacturer.replace("_", " ")}
                  </option>
                ))}
              </SelectField>

              <InputField
                accept=".xls,.xlsx,.pdf,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf"
                icon={Upload}
                label="Relatório"
                name="report"
                onChange={(event) => {
                  setSelectedFileName(
                    event.currentTarget.files?.[0]?.name ?? "",
                  );
                  setState((current) => ({
                    ...current,
                    error: null,
                    importedCount: null,
                    progress: 0,
                    status: "idle",
                  }));
                }}
                required
                type="file"
              />

              {selectedFileName ? (
                <p className="rounded-lg bg-paper2 px-3 py-2 text-sm font-semibold text-inkSoft">
                  {selectedFileName}
                </p>
              ) : null}

              {state.error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {state.error}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                <Button onClick={closeModal} size="sm" variant="ghost">
                  Cancelar
                </Button>
                <Button
                  disabled={isWorking}
                  size="sm"
                  type="submit"
                  variant="primary"
                >
                  <Upload className="size-4" strokeWidth={2.2} />
                  {state.status === "submitting" ? "Enviando..." : "Importar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
