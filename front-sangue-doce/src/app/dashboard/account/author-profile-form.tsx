"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PostAuthor } from "@/lib/api";

type AuthorProfileFormProps = {
  author: PostAuthor;
};

type FormState = {
  bio: string;
  role: string;
};

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel atualizar o perfil de autor.";
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

export function AuthorProfileForm({ author }: AuthorProfileFormProps) {
  const router = useRouter();
  const [formState, setFormState] = useState<FormState>({
    bio: author.bio ?? "",
    role: author.role,
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
      const response = await fetch("/api/authors/me", {
        body: JSON.stringify({
          bio: formState.bio.trim() || null,
          role: formState.role,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Perfil de autor atualizado.");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="mt-6 grid gap-5" onSubmit={submitForm}>
      <label className="block text-[13px] font-semibold text-muted" htmlFor="authorRole">
        Tagline / cargo editorial
        <input
          className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="authorRole"
          minLength={2}
          name="authorRole"
          onChange={(event) => updateField("role", event.target.value)}
          required
          type="text"
          value={formState.role}
        />
      </label>

      <label className="block text-[13px] font-semibold text-muted" htmlFor="authorBio">
        Bio
        <textarea
          className="mt-2 min-h-36 block w-full resize-y rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="authorBio"
          minLength={10}
          name="authorBio"
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="Conte um pouco sobre sua experiencia, foco editorial e relacao com o Sangue Doce."
          value={formState.bio}
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
        {submitting ? "Salvando..." : "Salvar perfil de autor"}
      </button>
    </form>
  );
}
