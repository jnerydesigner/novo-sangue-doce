"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
const googleAuthUrl = `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3011"}/auth/google`;

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel entrar.";
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

type RememberMeCheckboxProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
};

function RememberMeCheckbox({ checked, disabled, onChange }: RememberMeCheckboxProps) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line bg-paper2 px-4 py-3 text-[14px] font-semibold text-inkSoft transition hover:border-lineStrong hover:bg-paper">
      <input
        checked={checked}
        className="mt-0.5 size-4 rounded border-lineStrong text-navy accent-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:cursor-not-allowed"
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      <span className="leading-snug">
        Continuar conectado
        <span className="mt-1 block text-[12.5px] font-medium text-muted">
          Mantem sua sessao ativa por mais tempo neste navegador.
        </span>
      </span>
    </label>
  );
}

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submitPasswordLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password, rememberMe }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as {
        redirectTo?: string;
      };

      router.push(payload.redirectTo ?? "/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-7 grid gap-4" onSubmit={submitPasswordLogin}>
      {googleAuthEnabled ? (
        <>
          <button
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-lineStrong bg-paper px-4 py-3 text-sm font-semibold text-ink transition hover:-translate-y-px hover:bg-paper2"
            onClick={() => {
              window.location.assign(googleAuthUrl);
            }}
            type="button"
          >
            <span
              aria-hidden="true"
              className="grid size-5 place-items-center rounded-full bg-white text-[13px] font-bold text-ink shadow-sm"
            >
              G
            </span>
            Entrar com Google
          </button>

          <div
            className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-normal text-muted"
            aria-hidden="true"
          >
            <span className="h-px flex-1 bg-line" />
            ou
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      ) : null}

      <label className="block text-[13px] font-semibold text-muted" htmlFor="email">
        E-mail
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          disabled={submitting}
          id="email"
          name="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@exemplo.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="password">
        Senha
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          disabled={submitting}
          id="password"
          minLength={8}
          name="password"
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Sua senha"
          required
          type="password"
          value={password}
        />
      </label>

      <RememberMeCheckbox checked={rememberMe} disabled={submitting} onChange={setRememberMe} />

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
        {submitting ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
