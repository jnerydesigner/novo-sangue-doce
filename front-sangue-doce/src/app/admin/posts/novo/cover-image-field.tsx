"use client";

import { useId } from "react";
import { resolvePublicImageUrl } from "@/lib/public-image-url";

type CoverImageFieldProps = {
  altText: string;
  fileName: string;
  imageUrl: string;
  onAltTextChange: (altText: string) => void;
  onRemoveImage: () => void;
  onSelectImage: (file: File) => void;
  onGenerateImage?: () => void;
  generationStatus: "idle" | "saving" | "queued" | "processing" | "error";
  generationMessage?: string;
};

export function CoverImageField({
  altText,
  fileName,
  imageUrl,
  onAltTextChange,
  onRemoveImage,
  onSelectImage,
  onGenerateImage,
  generationStatus,
  generationMessage,
}: CoverImageFieldProps) {
  const inputId = useId();
  const resolvedImageUrl = resolvePublicImageUrl(imageUrl);

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
          style={resolvedImageUrl ? { backgroundImage: `url(${resolvedImageUrl})` } : undefined}
        >
          {resolvedImageUrl ? <span className="sr-only">Imagem de capa</span> : "Sem imagem"}
        </div>

        <div className="flex min-w-0 flex-col justify-center">
          <div className="grid items-center gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8">
            <div className="min-w-0">
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                Imagem de capa
              </span>
              <p className="mt-2 max-w-[58ch] text-sm leading-6 text-inkSoft">
                Envie uma imagem ou gere um banner com IA a partir do titulo, resumo e conteudo
                salvo no rascunho.
              </p>
              {fileName ? (
                <p className="mt-2 truncate text-sm font-semibold text-greenDeep">{fileName}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <label
                  className="inline-flex cursor-pointer items-center rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-bold text-greenDeep transition hover:-translate-y-px hover:bg-paper2"
                  htmlFor={inputId}
                >
                  Escolher imagem
                  <input
                    accept="image/jpeg,image/png,image/webp"
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
            </div>

            {onGenerateImage ? (
              <button
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep disabled:cursor-wait disabled:opacity-65 disabled:hover:translate-y-0 lg:w-auto lg:min-w-[220px]"
                disabled={generationStatus !== "idle" && generationStatus !== "error"}
                onClick={onGenerateImage}
                type="button"
              >
                <span aria-hidden="true">✦</span>
                {generationStatus === "saving"
                  ? "Salvando rascunho..."
                  : generationStatus === "queued"
                    ? "Banner na fila..."
                    : generationStatus === "processing"
                      ? "Gerando banner..."
                      : imageUrl
                        ? "Gerar novo banner com IA"
                        : "Gerar banner com IA"}
              </button>
            ) : null}
          </div>

          {generationStatus === "queued" || generationStatus === "processing" ? (
            <div className="mt-3" role="status">
              <div className="h-1.5 overflow-hidden rounded-full bg-paper2">
                <div className="h-full w-2/3 animate-pulse rounded-full bg-green" />
              </div>
              <p className="mt-2 text-sm text-inkSoft">
                {generationStatus === "queued"
                  ? "Solicitacao enviada. A geracao comeca assim que chegar a vez."
                  : "A IA esta criando e preparando o arquivo para o site."}
              </p>
            </div>
          ) : generationMessage ? (
            <p
              className={`mt-3 text-sm font-semibold ${generationStatus === "error" ? "text-tomato" : "text-greenDeep"}`}
              role={generationStatus === "error" ? "alert" : "status"}
            >
              {generationMessage}
            </p>
          ) : null}

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
