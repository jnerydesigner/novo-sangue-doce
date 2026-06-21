"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, type DiabetesType } from "@/lib/api";

const diabetesOptions: Array<{ label: string; value: DiabetesType }> = [
  { label: "Tipo 1", value: "TYPE_1" },
  { label: "Tipo 2", value: "TYPE_2" },
  { label: "Gestacional", value: "GESTATIONAL" },
  { label: "Outro", value: "OTHER" },
  { label: "Nao sei informar", value: "UNKNOWN" },
];

type FormState = {
  name: string;
  email: string;
  password: string;
  birthDate: string;
  diabetesType: DiabetesType;
};

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  birthDate: "",
  diabetesType: "UNKNOWN",
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar sua conta.";
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

export function SignupForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const user = await api.users.create({
        name: formState.name,
        email: formState.email,
        password: formState.password,
        birthDate: formState.birthDate || undefined,
        diabetesType: formState.diabetesType,
      });

      router.push(`/dashboard?email=${encodeURIComponent(user.email)}`);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-7 grid gap-4" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="name">
        Nome
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="name"
          name="name"
          onChange={(event) => updateField("name", event.target.value)}
          placeholder="Ana Ribeiro"
          required
          type="text"
          value={formState.name}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="email">
        E-mail
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="email"
          name="email"
          onChange={(event) => updateField("email", event.target.value)}
          placeholder="voce@exemplo.com"
          required
          type="email"
          value={formState.email}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="password">
        Senha
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="password"
          minLength={8}
          name="password"
          onChange={(event) => updateField("password", event.target.value)}
          placeholder="Minimo de 8 caracteres"
          required
          type="password"
          value={formState.password}
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

      {errorMessage ? (
        <p className="rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
          {errorMessage}
        </p>
      ) : null}

      <button
        className="btn btn-primary mt-2 w-full disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
