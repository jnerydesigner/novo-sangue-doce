"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useState, useTransition } from "react";
import { createMeasurementAction } from "@/app/actions/create-measurement.action";

type QuickGlucoseFormProps = {
  triggerClassName?: string;
  triggerLabel?: string;
};

function getCurrentTimeInputValue() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}

export function QuickGlucoseForm({
  triggerClassName = "mt-3 rounded-lg bg-green px-4 py-2 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep",
  triggerLabel = "+ Nova leitura",
}: QuickGlucoseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setFeedback("");
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = Number(formData.get("glucose"));

    if (!value || value < 40 || value > 450) {
      setFeedback("Informe um valor entre 40 e 450 mg/dL.");
      return;
    }

    formData.set("time", getCurrentTimeInputValue());
    formData.set("timeZone", Intl.DateTimeFormat().resolvedOptions().timeZone);

    startTransition(async () => {
      const result = await createMeasurementAction(formData);
      if (!result.ok) {
        setFeedback(result.error ?? "Erro ao salvar.");
        return;
      }
      setFeedback("Leitura salva!");
      setIsOpen(false);
      form.reset();
      router.refresh();
    });
  }

  return (
    <>
      <button
        className={triggerClassName}
        onClick={() => {
          setIsOpen(true);
          setFeedback("");
        }}
        type="button"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div
          aria-labelledby="quick-glucose-title"
          aria-modal="true"
          className="fixed inset-0 z-50 grid place-items-center bg-ink/45 px-4 py-6"
          role="dialog"
        >
          <button
            aria-label="Fechar modal"
            className="absolute inset-0 cursor-default"
            onClick={() => {
              setIsOpen(false);
              setFeedback("");
            }}
            type="button"
          />
          <div className="relative w-full max-w-[460px] rounded-lg border border-line bg-card p-5 shadow-editorial">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                  Glicemia
                </span>
                <h2
                  className="mt-1 font-serif text-3xl font-medium leading-tight tracking-normal text-ink"
                  id="quick-glucose-title"
                >
                  Inserir leitura
                </h2>
              </div>
              <button
                aria-label="Fechar modal de leitura"
                className="grid size-9 place-items-center rounded-lg border border-lineStrong bg-paper text-xl leading-none text-inkSoft transition hover:bg-paper2 hover:text-ink"
                onClick={() => {
                  setIsOpen(false);
                  setFeedback("");
                }}
                type="button"
              >
                x
              </button>
            </div>

            <form className="mt-5" onSubmit={handleSubmit} noValidate>
              <label className="block text-[13px] font-semibold text-muted" htmlFor="admin-glucose">
                Valor da glicose
              </label>
              <div className="mt-2 flex items-end gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-lineStrong bg-paper px-4 py-3 text-[1.35rem] font-semibold text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
                  id="admin-glucose"
                  name="glucose"
                  type="number"
                  inputMode="numeric"
                  min="40"
                  max="450"
                  placeholder="110"
                />
                <span className="pb-3 text-sm font-semibold text-muted">mg/dL</span>
              </div>
              {feedback ? (
                <p className="mt-3 min-h-[20px] text-sm font-medium text-inkSoft">{feedback}</p>
              ) : null}
              <p className="mt-2 text-xs text-muted">Horario atual: {getCurrentTimeInputValue()}</p>

              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  className="rounded-lg border border-lineStrong bg-paper px-4 py-3 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                  onClick={() => {
                    setIsOpen(false);
                    setFeedback("");
                  }}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-primary min-h-[48px] px-5"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Salvando..." : "Salvar leitura"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
