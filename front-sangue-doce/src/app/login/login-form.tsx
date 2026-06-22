"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const defaultLogin = {
  email: "jander.webmaster@gmail.com",
  password: "12345678",
};

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

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(defaultLogin.email);
  const [password, setPassword] = useState(defaultLogin.password);
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        body: JSON.stringify({ email, password }),
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
    <form className="mt-7 grid gap-4" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="email">
        E-mail
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
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
