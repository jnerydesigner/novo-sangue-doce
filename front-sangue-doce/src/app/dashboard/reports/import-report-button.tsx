"use client";

import { FileSpreadsheet, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useId, useState, type FormEvent } from "react";
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
  isSubmitting: boolean;
};

function getErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object" || !("message" in payload)) {
    return "Nao foi possivel importar o relatorio.";
  }

  const message = payload.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return typeof message === "string" ? message : "Nao foi possivel importar o relatorio.";
}

export function ImportReportButton() {
  const router = useRouter();
  const dialogTitleId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [state, setState] = useState<ImportState>({
    error: null,
    importedCount: null,
    isSubmitting: false,
  });

  function closeModal() {
    if (state.isSubmitting) return;
    setIsOpen(false);
  }

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("report");

    if (!(file instanceof File) || file.size === 0) {
      setState({ error: "Selecione um arquivo de relatorio.", importedCount: null, isSubmitting: false });
      return;
    }

    setState({ error: null, importedCount: null, isSubmitting: true });

    try {
      const response = await fetch("/api/measurements/import-report", {
        body: formData,
        method: "POST",
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getErrorMessage(payload));
      }

      const importedCount = Array.isArray(payload) ? payload.length : 0;
      form.reset();
      setSelectedFileName("");
      setState({ error: null, importedCount, isSubmitting: false });
      setIsOpen(false);
      router.refresh();
    } catch (error) {
      setState({
        error: error instanceof Error ? error.message : "Nao foi possivel importar o relatorio.",
        importedCount: null,
        isSubmitting: false,
      });
    }
  }

  return (
    <>
      <Button className="h-10" onClick={() => setIsOpen(true)} size="sm" variant="secondary">
        <Upload className="size-4" strokeWidth={2.2} />
        Importar relatório
      </Button>

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
              <IconButton
                aria-label="Fechar modal"
                disabled={state.isSubmitting}
                onClick={closeModal}
              >
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
                  setSelectedFileName(event.currentTarget.files?.[0]?.name ?? "");
                  setState((current) => ({ ...current, error: null, importedCount: null }));
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

              {state.importedCount !== null ? (
                <p className="rounded-lg border border-green/25 bg-green/10 px-3 py-2 text-sm font-semibold text-greenDeep">
                  {state.importedCount} medições importadas.
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
                <Button
                  disabled={state.isSubmitting}
                  onClick={closeModal}
                  size="sm"
                  variant="ghost"
                >
                  Cancelar
                </Button>
                <Button disabled={state.isSubmitting} size="sm" type="submit" variant="primary">
                  <Upload className="size-4" strokeWidth={2.2} />
                  {state.isSubmitting ? "Importando..." : "Importar"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
