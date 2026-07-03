"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState, useTransition } from "react";
import { createMeasurementAction } from "@/app/actions/create-measurement.action";
import type { Measurement } from "@/lib/api";

type Reading = {
  id: string;
  value: number;
  moment: string;
  time: string;
  note: string;
};

type GlucoseEntrySectionProps = {
  isAuthenticated: boolean;
  recentReadings: Measurement[];
};

function getReadingState(value: number) {
  if (value < 70) {
    return {
      label: "Baixa",
      className: "bg-energy10 text-energy",
      message: "Registre sintomas e confirme a conduta com sua equipe de saude.",
    };
  }

  if (value <= 180) {
    return {
      label: "Na faixa",
      className: "bg-spark10 text-[#0A8CAA]",
      message: "Boa referencia para acompanhar padroes ao longo da rotina.",
    };
  }

  return {
    label: "Alta",
    className: "bg-azure10 text-azure",
    message: "Vale observar horario, refeicao e atividade para entender o contexto.",
  };
}

function getMomentLabel(readingContext: Measurement["readingContext"], noteLabel?: string) {
  if (noteLabel) {
    return noteLabel;
  }

  const labels: Record<Measurement["readingContext"], string> = {
    AFTER_MEAL: "Pos-refeicao",
    BEDTIME: "Antes de dormir",
    BEFORE_MEAL: "Antes da refeicao",
    EXERCISE: "Exercicio",
    FASTING: "Jejum",
    MANUAL: "Manual",
    RANDOM: "Aleatoria",
  };

  return labels[readingContext];
}

function formatReadingTime(measuredAt: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(measuredAt));
}

function getCurrentTimeInputValue() {
  const now = new Date();
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");

  return `${hour}:${minute}`;
}

function mapMeasurementToReading(measurement: Measurement): Reading {
  return {
    id: measurement.id,
    moment: getMomentLabel(measurement.readingContext, measurement.noteLabel),
    note: measurement.noteLabel ?? "Registrada no diario",
    time: formatReadingTime(measurement.measuredAt),
    value: measurement.glucoseValueMgDl,
  };
}

function LoginRequiredCard() {
  return (
    <div className="rounded-lg border border-line bg-bg p-[clamp(22px,3vw,30px)] shadow-editorial">
      <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
        Acesso protegido
      </span>
      <h3 className="mt-3 font-serif text-[1.65rem] font-normal leading-tight tracking-[-0.015em] text-ink">
        Entre para registrar suas leituras
      </h3>
      <p className="mt-3 text-[15px] text-inkSoft">
        O diario usa sua sessao para salvar cada glicemia no seu historico e gerar relatorios
        somente do seu perfil.
      </p>
      <Link className="btn btn-primary mt-5 w-full" href="/login">
        Entrar para adicionar leitura
      </Link>
    </div>
  );
}

export function GlucoseEntrySection({ isAuthenticated, recentReadings }: GlucoseEntrySectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const initialVisibleReadings = useMemo(
    () => (isAuthenticated ? recentReadings.map(mapMeasurementToReading) : []),
    [isAuthenticated, recentReadings],
  );
  const [readings, setReadings] = useState<Reading[]>(initialVisibleReadings);
  const [feedback, setFeedback] = useState("Informe a glicose para registrar agora.");
  const latestReading = readings[0] ?? null;
  const latestState = latestReading
    ? getReadingState(latestReading.value)
    : {
        className: "bg-spark10 text-[#0A8CAA]",
        label: "Na faixa",
        message: "Entre para acompanhar padroes reais ao longo da rotina.",
      };

  const average = useMemo(() => {
    if (readings.length === 0) {
      return null;
    }

    const total = readings.reduce((sum, reading) => sum + reading.value, 0);
    return Math.round(total / readings.length);
  }, [readings]);

  function submitReading(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const value = Number(formData.get("glucose"));
    const time = getCurrentTimeInputValue();
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    formData.set("time", time);
    formData.set("timeZone", timeZone);

    if (!value || value < 40 || value > 450) {
      setFeedback("Informe um valor entre 40 e 450 mg/dL.");
      return;
    }

    startTransition(async () => {
      const result = await createMeasurementAction(formData);

      if (!result.ok) {
        setFeedback(result.error ?? "Nao foi possivel salvar a leitura.");
        return;
      }

      if (!result.measurement) {
        setFeedback("Leitura salva, mas nao foi possivel atualizar a lista agora.");
        router.refresh();
        return;
      }

      const createdReading = mapMeasurementToReading(result.measurement);

      setReadings(
        [createdReading, ...readings.filter((reading) => reading.id !== createdReading.id)].slice(
          0,
          4,
        ),
      );
      setFeedback(`Leitura adicionada como ${createdReading.moment.toLowerCase()}.`);
      form.reset();
      router.refresh();
    });
  }

  return (
    <section className="border-y border-line bg-surface py-[clamp(58px,8vw,100px)]" id="glicose">
      <div className="wrap">
        <div className="grid gap-[clamp(30px,5vw,56px)] lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <span className="eyebrow">Diario de glicose</span>
            <h2 className="mt-3 max-w-[15ch] text-balance font-serif text-[clamp(1.9rem,3.4vw,2.7rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
              Registre leituras e prepare a evolucao basal
            </h2>
            <p className="mt-4 max-w-[48ch] text-[1.03rem] text-inkSoft">
              Um primeiro espaco para anotar glicemia capilar ou leitura do sensor, com momento,
              horario e contexto. A mesma base pode receber dose basal e ajustes medicos depois.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <div className="border-l border-lineStrong pl-4">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Ultima
                </span>
                <strong className="mt-1 block font-serif text-[2.35rem] font-medium leading-none text-ink">
                  {latestReading ? latestReading.value : "--"}
                </strong>
                <span className="text-sm text-muted">mg/dL</span>
              </div>
              <div className="border-l border-lineStrong pl-4">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Media
                </span>
                <strong className="mt-1 block font-serif text-[2.35rem] font-medium leading-none text-ink">
                  {average ?? "--"}
                </strong>
                <span className="text-sm text-muted">leituras de hoje</span>
              </div>
              <div className="border-l border-lineStrong pl-4">
                <span className="block text-[12px] font-semibold uppercase tracking-[0.14em] text-muted">
                  Status
                </span>
                <span
                  className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${latestState.className}`}
                >
                  {latestState.label}
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-5">
            <div className="rounded-lg border border-line bg-bg p-[clamp(22px,3vw,30px)]">
              {isAuthenticated ? (
                <form
                  className="mb-5 rounded-lg border border-line bg-surface p-4"
                  onSubmit={submitReading}
                  noValidate
                >
                  <label className="block text-[13px] font-semibold text-muted" htmlFor="glucose">
                    Nova leitura
                  </label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="flex items-end gap-2">
                      <input
                        className="min-w-0 flex-1 rounded-lg border border-lineStrong bg-bg px-4 py-3 text-[1.35rem] font-semibold text-ink outline-none transition placeholder:text-muted/80 focus:border-azure"
                        id="glucose"
                        name="glucose"
                        type="number"
                        inputMode="numeric"
                        min="40"
                        max="450"
                        placeholder="110"
                      />
                      <span className="pb-3 text-sm font-semibold text-muted">mg/dL</span>
                    </div>
                    <button
                      className="btn btn-primary min-h-[52px] px-5"
                      disabled={isPending}
                      type="submit"
                    >
                      {isPending ? "Salvando..." : "Adicionar leitura"}
                    </button>
                  </div>
                  <p className="mt-3 min-h-[20px] text-sm font-medium text-inkSoft">{feedback}</p>
                </form>
              ) : (
                <div className="mb-5">
                  <LoginRequiredCard />
                </div>
              )}

              <div className="mb-4 flex items-center justify-between gap-4">
                <h3 className="font-serif text-[1.5rem] font-normal leading-tight tracking-[-0.01em] text-ink">
                  Ultimas leituras
                </h3>
                <span className="rounded-full bg-azure10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-navy">
                  Basal em breve
                </span>
              </div>

              <div className="grid gap-3">
                {readings.length > 0 ? (
                  readings.map((reading) => {
                    const state = getReadingState(reading.value);
                    return (
                      <article
                        className="grid grid-cols-[auto_1fr] gap-3 border-t border-line pt-3 first:border-t-0 first:pt-0"
                        key={reading.id}
                      >
                        <div className="grid h-12 w-12 place-items-center rounded-lg bg-surface font-serif text-[1.35rem] text-navy">
                          {reading.value}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <strong className="text-[15px] text-ink">{reading.moment}</strong>
                            <span className="text-sm text-muted">{reading.time}</span>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${state.className}`}
                            >
                              {state.label}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-inkSoft">{reading.note}</p>
                        </div>
                      </article>
                    );
                  })
                ) : (
                  <p className="rounded-lg border border-line bg-surface px-4 py-5 text-sm text-inkSoft">
                    Entre para ver suas leituras recentes por aqui.
                  </p>
                )}
              </div>

              <p className="mt-5 border-t border-line pt-4 text-sm text-muted">
                {latestState.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
