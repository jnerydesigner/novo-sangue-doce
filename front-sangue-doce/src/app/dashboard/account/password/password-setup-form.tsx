"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type FormState = {
  password: string;
  passwordConfirmation: string;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar sua senha.";
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

export function PasswordSetupForm() {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    password: "",
    passwordConfirmation: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (formState.password !== formState.passwordConfirmation) {
      setErrorMessage("As senhas precisam ser iguais.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/password", {
        body: JSON.stringify({ password: formState.password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6 grid gap-5" onSubmit={submitForm}>
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

      <label className="block text-[13px] font-semibold text-muted" htmlFor="passwordConfirmation">
        Confirmar senha
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="passwordConfirmation"
          minLength={8}
          name="passwordConfirmation"
          onChange={(event) => updateField("passwordConfirmation", event.target.value)}
          placeholder="Repita a senha"
          required
          type="password"
          value={formState.passwordConfirmation}
        />
      </label>

      {errorMessage ? (
        <p className="rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
          {errorMessage}
        </p>
      ) : null}

      <button
        className="btn btn-primary w-full sm:w-fit disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Criando senha..." : "Criar senha"}
      </button>
    </form>
  );
}
