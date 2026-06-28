"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { resolvePublicImageUrl } from "@/lib/public-image-url";

type ImageUploadFieldProps = {
  initialImageUrl?: string;
  profileName: string;
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function getErrorMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return "Nao foi possivel atualizar sua imagem de perfil.";
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

export function ImageUploadField({ initialImageUrl, profileName }: ImageUploadFieldProps) {
  const inputId = useId();
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl ?? "");
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const resolvedPreviewUrl = resolvePublicImageUrl(previewUrl);

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectImage = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    const objectUrl = URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
    setFileName(file.name);

    const formData = new FormData();
    formData.append("image", file);

    setUploading(true);

    try {
      const response = await fetch("/api/uploads/users/avatar", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const payload = (await response.json()) as { avatarUrl: string };

      URL.revokeObjectURL(objectUrl);

      setPreviewUrl(payload.avatarUrl);
      setFileName("");
      setSuccessMessage("Imagem de perfil atualizada.");
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const removePreview = () => {
    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl("");
    setFileName("");
  };

  return (
    <section className="mt-6 rounded-lg border border-line bg-paper p-4">
      <div className="flex flex-wrap items-center gap-4">
        <div
          aria-label={`Previa da imagem de ${profileName}`}
          className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-lg border border-lineStrong bg-card bg-cover bg-center font-serif text-3xl font-medium text-greenDeep"
          role="img"
          style={resolvedPreviewUrl ? { backgroundImage: `url(${resolvedPreviewUrl})` } : undefined}
        >
          {resolvedPreviewUrl ? (
            <span className="sr-only">{profileName}</span>
          ) : (
            getInitials(profileName)
          )}
        </div>

        <div className="min-w-[220px] flex-1">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
            Imagem de perfil
          </span>
          <p className="mt-2 text-sm leading-6 text-inkSoft">
            Escolha uma imagem PNG. Ela sera enviada e vinculada ao seu perfil.
          </p>
          {fileName ? (
            <p className="mt-2 truncate text-sm font-semibold text-greenDeep">
              {uploading ? `Enviando ${fileName}...` : fileName}
            </p>
          ) : null}
          {errorMessage ? (
            <p className="mt-2 text-sm font-semibold text-tomato">{errorMessage}</p>
          ) : null}
          {successMessage ? (
            <p className="mt-2 text-sm font-semibold text-greenDeep">{successMessage}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            className="inline-flex cursor-pointer items-center rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-bold text-greenDeep transition hover:-translate-y-px hover:bg-paper2"
            htmlFor={inputId}
          >
            Escolher imagem
            <input
              accept="image/png"
              className="sr-only"
              disabled={uploading}
              id={inputId}
              onChange={selectImage}
              type="file"
            />
          </label>

          {previewUrl ? (
            <button
              className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-bold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 hover:text-ink"
              disabled={uploading}
              onClick={removePreview}
              type="button"
            >
              Remover
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
