"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { User } from "@/lib/api";

type AuthorCreateFormProps = {
  users: User[];
};

type FormState = {
  bio: string;
  name: string;
  role: string;
  slug: string;
  userId: string;
};

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel criar o autor.";
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

export function AuthorCreateForm({ users }: AuthorCreateFormProps) {
  const router = useRouter();
  const firstUser = users[0];
  const [formState, setFormState] = useState<FormState>({
    bio: "",
    name: firstUser?.name ?? "",
    role: "Colunista",
    slug: firstUser ? slugify(firstUser.name) : "",
    userId: firstUser?.id ?? "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === formState.userId) ?? null,
    [formState.userId, users],
  );

  const updateField = <Field extends keyof FormState>(field: Field, value: FormState[Field]) => {
    setFormState((current) => ({ ...current, [field]: value }));
  };

  const selectUser = (userId: string) => {
    const user = users.find((item) => item.id === userId);

    setFormState((current) => ({
      ...current,
      name: user?.name ?? "",
      slug: user ? slugify(user.name) : "",
      userId,
    }));
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/authors", {
        body: JSON.stringify({
          bio: formState.bio.trim() || null,
          email: selectedUser?.email,
          name: formState.name.trim(),
          role: formState.role.trim(),
          slug: formState.slug.trim(),
          userId: formState.userId,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      setSuccessMessage("Autor criado.");
      setFormState({
        bio: "",
        name: "",
        role: "Colunista",
        slug: "",
        userId: "",
      });
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  if (!users.length) {
    return (
      <section className="rounded-lg border border-line bg-card p-5">
        <p className="text-sm font-semibold text-inkSoft">
          Todas as contas cadastradas ja possuem perfil de autor.
        </p>
      </section>
    );
  }

  return (
    <form className="rounded-lg border border-line bg-card p-5" onSubmit={submitForm}>
      <div className="max-w-3xl">
        <span className="section-label">Novo autor</span>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-normal text-ink">
          Criar perfil editorial
        </h2>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="block text-[13px] font-semibold text-muted" htmlFor="authorUserId">
          Usuario vinculado
          <select
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition focus:border-green"
            id="authorUserId"
            name="authorUserId"
            onChange={(event) => selectUser(event.target.value)}
            required
            value={formState.userId}
          >
            <option value="">Selecione uma conta</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} - {user.email}
              </option>
            ))}
          </select>
        </label>

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

        <label className="block text-[13px] font-semibold text-muted" htmlFor="authorName">
          Nome publico
          <input
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
            id="authorName"
            minLength={2}
            name="authorName"
            onChange={(event) => {
              const value = event.target.value;

              setFormState((current) => ({
                ...current,
                name: value,
                slug: slugify(value),
              }));
            }}
            required
            type="text"
            value={formState.name}
          />
        </label>

        <label className="block text-[13px] font-semibold text-muted" htmlFor="authorSlug">
          Slug
          <input
            className="mt-2 block w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
            id="authorSlug"
            name="authorSlug"
            onChange={(event) => updateField("slug", slugify(event.target.value))}
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            required
            type="text"
            value={formState.slug}
          />
        </label>
      </div>

      <label className="mt-4 block text-[13px] font-semibold text-muted" htmlFor="authorBio">
        Bio
        <textarea
          className="mt-2 min-h-32 block w-full resize-y rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base leading-7 text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
          id="authorBio"
          minLength={10}
          name="authorBio"
          onChange={(event) => updateField("bio", event.target.value)}
          placeholder="Conte o foco editorial, experiencia e como esse autor aparece nas materias."
          value={formState.bio}
        />
      </label>

      {errorMessage ? (
        <p className="mt-4 rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-[14px] font-semibold text-tomato">
          {errorMessage}
        </p>
      ) : null}

      {successMessage ? (
        <p className="mt-4 rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-[14px] font-semibold text-greenDeep">
          {successMessage}
        </p>
      ) : null}

      <button
        className="btn btn-primary mt-5 w-full sm:w-fit disabled:cursor-not-allowed disabled:opacity-65"
        disabled={submitting}
        type="submit"
      >
        {submitting ? "Criando..." : "Criar autor"}
      </button>
    </form>
  );
}
