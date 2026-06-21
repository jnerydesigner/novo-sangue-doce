"use server";

import { cookies } from "next/headers";
import { api, type Measurement } from "@/lib/api";
import { AUTH_COOKIE_NAME } from "@/lib/auth-cookie";

type CreateMeasurementState = {
  error?: string;
  measurement?: Measurement;
  ok: boolean;
};

function buildMeasuredAt(time: string) {
  const today = new Date();
  const [hour, minute] = time.split(":").map(Number);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  const formattedHour = String(hour).padStart(2, "0");
  const formattedMinute = String(minute).padStart(2, "0");

  return `${year}-${month}-${day}T${formattedHour}:${formattedMinute}:00.000`;
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel salvar a leitura.";
  }

  try {
    const parsed = JSON.parse(error.message) as {
      message?: string | string[];
    };

    if (Array.isArray(parsed.message)) {
      return parsed.message.join(" ");
    }

    return parsed.message ?? error.message;
  } catch {
    return error.message;
  }
}

export async function createMeasurementAction(formData: FormData): Promise<CreateMeasurementState> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!accessToken) {
    return {
      error: "Entre para registrar uma leitura.",
      ok: false,
    };
  }

  const glucoseValueMgDl = Number(formData.get("glucose"));
  const measuredAt = buildMeasuredAt(String(formData.get("time") || ""));
  const timeZone = String(formData.get("timeZone") || "");

  if (!Number.isInteger(glucoseValueMgDl) || glucoseValueMgDl < 40 || glucoseValueMgDl > 450) {
    return {
      error: "Informe um valor entre 40 e 450 mg/dL.",
      ok: false,
    };
  }

  if (!measuredAt) {
    return {
      error: "Escolha o horario da leitura.",
      ok: false,
    };
  }

  try {
    const measurement = await api.measurements.create(
      {
        glucoseValueMgDl,
        measuredAt,
        source: "MANUAL",
        timeZone: timeZone || undefined,
      },
      { accessToken },
    );

    return { measurement, ok: true };
  } catch (error) {
    return {
      error: getErrorMessage(error),
      ok: false,
    };
  }
}
