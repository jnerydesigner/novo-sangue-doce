"use client";

import Image from "next/image";
import { useState } from "react";
import type {
  InstitutionalPublication,
  InstitutionalPublicationPayload,
  PaginatedResponse,
} from "@/lib/api";

type Props = {
  initialData: PaginatedResponse<InstitutionalPublication>;
};

type UploadedImage = {
  imageUrl: string;
  objectName: string;
};

const emptyPayload: InstitutionalPublicationPayload = {
  title: "",
  content: "",
  hashtags: [],
  imageKey: "",
  imageUrl: "",
};

function hashtagTextToArray(value: string) {
  return value
    .split(/[,\n]/g)
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => (item.startsWith("#") ? item : `#${item}`));
}

function formatDate(value: string | null) {
  if (!value) return "Nao publicado";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function InstitutionalPublicationManager({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [payload, setPayload] = useState<InstitutionalPublicationPayload>(emptyPayload);
  const [hashtagsText, setHashtagsText] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function startNew() {
    setEditingId(null);
    setPayload(emptyPayload);
    setHashtagsText("");
    setFeedback(null);
  }

  function startEdit(publication: InstitutionalPublication) {
    setEditingId(publication.id);
    setPayload({
      title: publication.title,
      content: publication.content,
      hashtags: publication.hashtags,
      imageKey: publication.imageKey,
      imageUrl: publication.imageUrl,
    });
    setHashtagsText(publication.hashtags.join(", "));
    setFeedback(null);
  }

  async function uploadImage(file: File) {
    setBusy(true);
    setFeedback(null);
    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch("/api/uploads/institutional-publications/image", {
      method: "POST",
      body: formData,
    });
    const body = (await response.json().catch(() => null)) as
      | UploadedImage
      | { message?: string }
      | null;

    if (!response.ok || !body || !("imageUrl" in body)) {
      setFeedback(
        body && "message" in body ? (body.message ?? "Falha no upload.") : "Falha no upload.",
      );
    } else {
      setPayload((current) => ({ ...current, imageKey: body.objectName, imageUrl: body.imageUrl }));
      setFeedback("Imagem enviada.");
    }
    setBusy(false);
  }

  async function save() {
    if (!payload.title.trim() || !payload.content.trim() || !payload.imageKey) {
      setFeedback("Informe titulo, texto e imagem antes de salvar.");
      return null;
    }

    setBusy(true);
    setFeedback(null);
    const bodyToSave = { ...payload, hashtags: hashtagTextToArray(hashtagsText) };
    const response = await fetch(
      editingId
        ? `/api/admin/institutional-publications/${editingId}`
        : "/api/admin/institutional-publications",
      {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyToSave),
      },
    );
    const body = (await response.json().catch(() => null)) as
      | InstitutionalPublication
      | { message?: string }
      | null;

    if (!response.ok || !body || !("id" in body)) {
      setFeedback(
        body && "message" in body
          ? (body.message ?? "Nao foi possivel salvar.")
          : "Nao foi possivel salvar.",
      );
      setBusy(false);
      return null;
    }

    setData((current) => ({
      ...current,
      data: editingId
        ? current.data.map((item) => (item.id === body.id ? body : item))
        : [body, ...current.data],
    }));
    setEditingId(body.id);
    setPayload(bodyToSave);
    setFeedback("Publicacao salva. Revise e publique quando estiver pronto.");
    setBusy(false);
    return body;
  }

  async function publish() {
    const saved = editingId ? null : await save();
    const id = editingId ?? saved?.id;
    if (!id) return;

    setBusy(true);
    setFeedback(null);
    const response = await fetch(`/api/admin/institutional-publications/${id}/publish/linkedin`, {
      method: "POST",
    });
    const body = (await response.json().catch(() => null)) as
      | InstitutionalPublication
      | { message?: string }
      | null;

    if (!response.ok || !body || !("id" in body)) {
      setFeedback(
        body && "message" in body
          ? (body.message ?? "Nao foi possivel publicar.")
          : "Nao foi possivel publicar.",
      );
    } else {
      setData((current) => ({
        ...current,
        data: current.data.map((item) => (item.id === body.id ? body : item)),
      }));
      setFeedback("Publicado no LinkedIn.");
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <section className="rounded-lg border border-line bg-card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">Criar publicação</h2>
            <p className="mt-1 text-sm text-inkSoft">
              Fluxo manual para posts profissionais fora das materias do Sangue Doce.
            </p>
          </div>
          <button
            className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft hover:bg-paper2"
            onClick={startNew}
            type="button"
          >
            Nova
          </button>
        </div>

        {feedback ? (
          <div className="mt-4 rounded-lg bg-paper2 px-4 py-3 text-sm font-semibold text-inkSoft">
            {feedback}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          <label className="grid gap-2 text-sm font-bold text-ink">
            Titulo interno
            <input
              className="rounded-lg border border-lineStrong bg-card px-3 py-2.5 font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
              maxLength={180}
              onChange={(event) =>
                setPayload((current) => ({ ...current, title: event.target.value }))
              }
              value={payload.title}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Texto do post
            <textarea
              className="min-h-52 resize-y rounded-lg border border-lineStrong bg-card px-3 py-2.5 font-normal leading-relaxed outline-none focus:border-green focus:ring-2 focus:ring-green/20"
              maxLength={5000}
              onChange={(event) =>
                setPayload((current) => ({ ...current, content: event.target.value }))
              }
              value={payload.content}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Hashtags
            <input
              className="rounded-lg border border-lineStrong bg-card px-3 py-2.5 font-normal outline-none focus:border-green focus:ring-2 focus:ring-green/20"
              onChange={(event) => setHashtagsText(event.target.value)}
              placeholder="#Tecnologia, #Carreira"
              value={hashtagsText}
            />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Imagem manual
            <input
              accept="image/png,image/jpeg,image/webp"
              className="rounded-lg border border-lineStrong bg-card px-3 py-2.5 font-normal"
              disabled={busy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadImage(file);
              }}
              type="file"
            />
          </label>
          {payload.imageUrl ? (
            <div className="relative aspect-[1.91/1] overflow-hidden rounded-lg border border-line bg-paper2">
              <Image alt="" className="object-cover" fill src={payload.imageUrl} unoptimized />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-lg bg-green px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              disabled={busy}
              onClick={save}
              type="button"
            >
              {busy ? "Salvando..." : "Salvar rascunho"}
            </button>
            <button
              className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white disabled:opacity-50"
              disabled={busy}
              onClick={publish}
              type="button"
            >
              {busy ? "Publicando..." : "Publicar no LinkedIn"}
            </button>
          </div>
        </div>
      </section>

      <aside className="rounded-lg border border-line bg-card p-5">
        <h2 className="text-lg font-bold text-ink">Publicações salvas</h2>
        <div className="mt-4 grid gap-3">
          {data.data.map((publication) => (
            <button
              className="rounded-lg border border-lineStrong p-3 text-left transition hover:bg-paper2"
              key={publication.id}
              onClick={() => startEdit(publication)}
              type="button"
            >
              <span className="block font-semibold text-ink">{publication.title}</span>
              <span className="mt-1 block text-xs font-semibold text-muted">
                LinkedIn: {formatDate(publication.publishedAt)}
              </span>
            </button>
          ))}
          {data.data.length === 0 ? (
            <p className="text-sm text-inkSoft">Nenhuma publicação institucional criada ainda.</p>
          ) : null}
        </div>
      </aside>
    </div>
  );
}
