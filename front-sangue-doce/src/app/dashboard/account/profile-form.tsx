"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AuthProfile, DiabetesType } from "@/lib/api";

const diabetesOptions: Array<{ label: string; value: DiabetesType }> = [
  { label: "Tipo 1", value: "TYPE_1" },
  { label: "Tipo 2", value: "TYPE_2" },
  { label: "Gestacional", value: "GESTATIONAL" },
  { label: "Outro", value: "OTHER" },
  { label: "Nao sei informar", value: "UNKNOWN" },
];

const diabetesDisplayToValue = new Map<string, DiabetesType>([
  ["Diabetes tipo 1", "TYPE_1"],
  ["Diabetes tipo 2", "TYPE_2"],
  ["Diabetes gestacional", "GESTATIONAL"],
  ["Outro", "OTHER"],
  ["Nao informado", "UNKNOWN"],
]);

type FormState = {
  name: string;
  birthDate: string;
  diabetesType: DiabetesType;
};

type ProfileFormProps = {
  profile: AuthProfile;
};

function formatDateForInput(date?: string) {
  if (!date) {
    return "";
  }

  const [day, month, year] = date.split("/");

  if (!day || !month || !year) {
    return "";
  }

  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function getDiabetesTypeValue(diabetesType: string): DiabetesType {
  if (diabetesOptions.some((option) => option.value === diabetesType)) {
    return diabetesType as DiabetesType;
  }

  return diabetesDisplayToValue.get(diabetesType) ?? "UNKNOWN";
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel atualizar sua conta.";
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

export function ProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    name: profile.name,
    birthDate: formatDateForInput(profile.birthDate),
    diabetesType: getDiabetesTypeValue(profile.diabetesType),
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/profile", {
        body: JSON.stringify({
          name: formState.name,
          birthDate: formState.birthDate || null,
          diabetesType: formState.diabetesType,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Conta atualizada.");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6 grid gap-5" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="name">
        Nome
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="name"
          minLength={2}
          name="name"
          onChange={(event) => updateField("name", event.target.value)}
          required
          type="text"
          value={formState.name}
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-[13px] font-semibold text-muted" htmlFor="birthDate">
          Nascimento
          <input
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition focus:border-green"
            id="birthDate"
            name="birthDate"
            onChange={(event) => updateField("birthDate", event.target.value)}
            type="date"
            value={formState.birthDate}
          />
        </label>

        <label className="block text-[13px] font-semibold text-muted" htmlFor="diabetesType">
          Tipo de diabetes
          <select
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition focus:border-green"
            id="diabetesType"
            name="diabetesType"
            onChange={(event) => updateField("diabetesType", event.target.value as DiabetesType)}
            value={formState.diabetesType}
          >
            {diabetesOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="email">
        E-mail
        <input
          className="mt-2 block w-full cursor-not-allowed rounded-lg border border-lineStrong bg-paper2 px-4 py-3 text-base text-muted outline-none"
          disabled
          id="email"
          type="email"
          value={profile.email}
        />
      </label>

      {errorMessage ? (
        <p className="rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-[14px] font-semibold text-greenDeep">
          {successMessage}
        </p>
      ) : null}

      <button
        className="btn btn-primary w-full sm:w-fit disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Salvando..." : "Salvar alteracoes"}
      </button>
    </form>
  );
}
