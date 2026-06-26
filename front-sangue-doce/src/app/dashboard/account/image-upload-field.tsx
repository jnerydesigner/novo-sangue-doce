"use client";

import { useEffect, useId, useState } from "react";

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

export function ImageUploadField({
  initialImageUrl,
  profileName,
}: ImageUploadFieldProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState(initialImageUrl ?? "");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
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
          style={previewUrl ? { backgroundImage: `url(${previewUrl})` } : undefined}
        >
          {previewUrl ? <span className="sr-only">{profileName}</span> : getInitials(profileName)}
        </div>

        <div className="min-w-[220px] flex-1">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
            Imagem de perfil
          </span>
          <p className="mt-2 text-sm leading-6 text-inkSoft">
            Escolha uma imagem PNG para pre-visualizar aqui. O envio definitivo
            sera conectado na proxima etapa.
          </p>
          {fileName ? (
            <p className="mt-2 truncate text-sm font-semibold text-greenDeep">
              {fileName}
            </p>
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
              id={inputId}
              onChange={selectImage}
              type="file"
            />
          </label>

          {previewUrl ? (
            <button
              className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-bold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 hover:text-ink"
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
