"use client";

import { useId } from "react";

type CoverImageFieldProps = {
  altText: string;
  fileName: string;
  imageUrl: string;
  onAltTextChange: (altText: string) => void;
  onRemoveImage: () => void;
  onSelectImage: (file: File) => void;
};

export function CoverImageField({
  altText,
  fileName,
  imageUrl,
  onAltTextChange,
  onRemoveImage,
  onSelectImage,
}: CoverImageFieldProps) {
  const inputId = useId();

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      return;
    }

    onSelectImage(file);
  }

  return (
    <section className="rounded-lg border border-line bg-paper p-4">
      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <div
          aria-label={imageUrl ? "Previa da imagem de capa" : "Sem imagem"}
          className="grid min-h-[150px] place-items-center overflow-hidden rounded-lg border border-lineStrong bg-card bg-cover bg-center text-sm font-bold uppercase tracking-[0.12em] text-muted"
          role="img"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        >
          {imageUrl ? <span className="sr-only">Imagem de capa</span> : "Sem imagem"}
        </div>

        <div className="flex flex-col justify-center">
          <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
            Imagem de capa
          </span>
          <p className="mt-2 max-w-[58ch] text-sm leading-6 text-inkSoft">
            Escolha uma imagem PNG para pre-visualizar aqui. Ao salvar o
            rascunho ou publicar, a imagem sera enviada e vinculada a materia.
          </p>
          {fileName ? (
            <p className="mt-2 truncate text-sm font-semibold text-greenDeep">
              {fileName}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
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

            {imageUrl ? (
              <button
                className="rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-bold text-inkSoft transition hover:-translate-y-px hover:bg-paper2 hover:text-ink"
                onClick={onRemoveImage}
                type="button"
              >
                Remover
              </button>
            ) : null}
          </div>

          <label
            className="mt-4 grid gap-2 text-sm font-bold text-inkSoft"
            htmlFor={`${inputId}-alt`}
          >
            Texto alternativo
            <input
              className="h-12 rounded-lg border border-line bg-card px-4 text-base font-medium text-ink outline-none transition placeholder:text-muted/60 focus:border-green"
              id={`${inputId}-alt`}
              onChange={(event) => onAltTextChange(event.target.value)}
              placeholder="Descreva a imagem para acessibilidade e SEO"
              type="text"
              value={altText}
            />
          </label>
        </div>
      </div>
    </section>
  );
}
