"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import type {
  PaginatedResponse,
  SocialNetwork,
  SocialPublication,
  SocialPublicationGenerationMode,
  SocialPublicationStatus,
} from "@/lib/api";

type Props = { initialData: PaginatedResponse<SocialPublication> };

const terminalStatuses: SocialPublicationStatus[] = ["COMPLETED", "FAILED", "CANCELLED", "STANDBY"];
const socialNetworkOptions: { value: SocialNetwork; label: string }[] = [
  { value: "LINKEDIN", label: "LinkedIn" },
  { value: "INSTAGRAM", label: "Instagram" },
  { value: "FACEBOOK", label: "Facebook" },
];
const statusLabels: Record<SocialPublicationStatus, string> = {
  PENDING: "Preparando",
  QUEUED: "Na fila",
  PROCESSING: "Processando",
  GENERATING_TEXT: "Gerando texto",
  GENERATING_IMAGE: "Gerando imagem",
  CONVERTING_IMAGE: "Convertendo imagem",
  UPLOADING_IMAGE: "Salvando imagem",
  COMPLETED: "Concluida",
  FAILED: "Falhou",
  CANCELLED: "Cancelada",
  STANDBY: "Versao anterior",
};

const statusClasses: Record<SocialPublicationStatus, string> = {
  COMPLETED: "border-green/30 bg-green/10 text-greenDeep",
  FAILED: "border-tomato/30 bg-energy10 text-tomato",
  CANCELLED: "border-lineStrong bg-paper2 text-muted",
  STANDBY: "border-lineStrong bg-paper2 text-muted",
  PENDING: "border-azure/30 bg-azure10 text-navy",
  QUEUED: "border-azure/30 bg-azure10 text-navy",
  PROCESSING: "border-azure/30 bg-azure10 text-navy",
  GENERATING_TEXT: "border-azure/30 bg-azure10 text-navy",
  GENERATING_IMAGE: "border-azure/30 bg-azure10 text-navy",
  CONVERTING_IMAGE: "border-azure/30 bg-azure10 text-navy",
  UPLOADING_IMAGE: "border-azure/30 bg-azure10 text-navy",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function SocialNetworkIcon({ network }: { network: SocialNetwork }) {
  const label = socialNetworkOptions.find((option) => option.value === network)?.label ?? network;

  if (network === "LINKEDIN") {
    return (
      <span
        aria-label={`Publicado no ${label}`}
        className="grid size-9 place-items-center rounded-lg bg-[#0A66C2] text-white"
        title={`Publicado no ${label}`}
      >
        <svg aria-hidden="true" className="size-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.2 7.7H1.5V22h3.7V7.7ZM3.3 1A2.2 2.2 0 1 0 3.3 5.4 2.2 2.2 0 0 0 3.3 1ZM22.5 13.8c0-4.3-2.3-6.4-5.4-6.4-2.5 0-3.6 1.4-4.2 2.3v-2h-3.7V22h3.7v-7.1c0-1.9.4-3.8 2.8-3.8 2.4 0 2.4 2.2 2.4 3.9v7h3.7l.7-8.2Z" />
        </svg>
      </span>
    );
  }

  if (network === "INSTAGRAM") {
    return (
      <span
        aria-label={`Publicado no ${label}`}
        className="grid size-9 place-items-center rounded-lg bg-[#C13584] text-white"
        title={`Publicado no ${label}`}
      >
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
          <rect height="18" rx="5" stroke="currentColor" strokeWidth="2.2" width="18" x="3" y="3" />
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2.2" />
          <circle cx="17.5" cy="6.7" fill="currentColor" r="1.2" />
        </svg>
      </span>
    );
  }

  return (
    <span
      aria-label={`Publicado no ${label}`}
      className="grid size-9 place-items-center rounded-lg bg-[#1877F2] text-lg font-black text-white"
      title={`Publicado no ${label}`}
    >
      f
    </span>
  );
}

export function SocialPublicationCards({ initialData }: Props) {
  const [data, setData] = useState(initialData);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [generationId, setGenerationId] = useState<string | null>(null);
  const [generationMode, setGenerationMode] =
    useState<SocialPublicationGenerationMode>("NEW_PUBLICATION");
  const [imageEditInstruction, setImageEditInstruction] = useState("");
  const hasActive = data.data.some((item) => !terminalStatuses.includes(item.status));
  const publishedPublications = data.data.filter(
    (publication) => Object.keys(publication.publicationResults ?? {}).length > 0,
  );
  const workingPublications = data.data.filter(
    (publication) => Object.keys(publication.publicationResults ?? {}).length === 0,
  );

  useEffect(() => {
    if (!hasActive) return;

    const interval = window.setInterval(async () => {
      const response = await fetch("/api/admin/social-publications?limit=24");
      if (response.ok) setData((await response.json()) as PaginatedResponse<SocialPublication>);
    }, 4_000);

    return () => window.clearInterval(interval);
  }, [hasActive]);

  async function retry(id: string) {
    setBusyId(id);
    setFeedback(null);
    const response = await fetch(`/api/admin/social-publications/${id}/retry`, { method: "POST" });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;

    if (!response.ok) {
      setFeedback(body?.message ?? "Nao foi possivel tentar novamente.");
    } else {
      setFeedback(body?.message ?? "Publicacao reenfileirada.");
      const refreshed = await fetch("/api/admin/social-publications?limit=24");
      if (refreshed.ok) setData((await refreshed.json()) as PaginatedResponse<SocialPublication>);
    }
    setBusyId(null);
  }

  async function copyText(publication: SocialPublication) {
    const text = [publication.generatedContent, ...(publication.generatedHashtags ?? [])]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    setFeedback("Texto copiado para a area de transferencia.");
  }

  function startGeneration(id: string, mode: SocialPublicationGenerationMode) {
    setGenerationId(id);
    setGenerationMode(mode);
    setImageEditInstruction("");
    setFeedback(null);
  }

  async function generateVersion(publication: SocialPublication) {
    setBusyId(publication.id);
    setFeedback(null);
    const response = await fetch("/api/admin/social-publications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postId: publication.postId,
        generationMode,
        parentPublicationId: publication.id,
        imageEditInstruction: imageEditInstruction.trim() || undefined,
      }),
    });
    const body = (await response.json().catch(() => null)) as { message?: string } | null;
    setFeedback(
      body?.message ??
        (response.ok ? "Nova versão adicionada à fila." : "Não foi possível gerar a versão."),
    );
    if (response.ok) {
      setGenerationId(null);
      const refreshed = await fetch("/api/admin/social-publications?limit=24");
      if (refreshed.ok) setData((await refreshed.json()) as PaginatedResponse<SocialPublication>);
    }
    setBusyId(null);
  }

  function startEditing(publication: SocialPublication) {
    const publishedNetworks = Object.keys(publication.publicationResults ?? {}) as SocialNetwork[];
    const selectedNetworks = publication.socialNetworks?.length
      ? publication.socialNetworks
      : publishedNetworks;

    setEditingId(publication.id);
    setDescription(publication.generatedContent ?? "");
    setSocialNetworks(selectedNetworks);
    setFeedback(null);
  }

  function toggleNetwork(network: SocialNetwork) {
    setSocialNetworks((current) =>
      current.includes(network)
        ? current.filter((item) => item !== network)
        : [...current, network],
    );
  }

  async function saveReview(
    publication: SocialPublication,
    action: "save" | "publish" | "schedule" = "save",
  ) {
    if (!description.trim()) {
      setFeedback("A descrição não pode ficar vazia.");
      return;
    }

    setBusyId(publication.id);
    setFeedback(null);
    const response = await fetch(`/api/admin/social-publications/${publication.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description: description.trim(), socialNetworks }),
    });
    const body = (await response.json().catch(() => null)) as
      | SocialPublication
      | { message?: string }
      | null;

    if (!response.ok || !body || !("id" in body)) {
      setFeedback(
        body && "message" in body && body.message
          ? body.message
          : "Não foi possível salvar a revisão.",
      );
    } else {
      setData((current) => ({
        ...current,
        data: current.data.map((item) => (item.id === publication.id ? body : item)),
      }));

      if (action === "schedule") {
        const scheduleResponse = await fetch(
          `/api/admin/social-publications/${publication.id}/schedule`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              socialNetworks: ["LINKEDIN"],
            }),
          },
        );
        const scheduleBody = (await scheduleResponse.json().catch(() => null)) as
          | SocialPublication
          | { message?: string }
          | null;

        if (!scheduleResponse.ok || !scheduleBody || !("id" in scheduleBody)) {
          setFeedback(
            scheduleBody && "message" in scheduleBody && scheduleBody.message
              ? scheduleBody.message
              : "A revisão foi salva, mas não foi possível agendar.",
          );
          setBusyId(null);
          return;
        }

        setData((current) => ({
          ...current,
          data: current.data.map((item) => (item.id === scheduleBody.id ? scheduleBody : item)),
        }));
        setFeedback(
          `Revisão salva e adicionada à fila diária para ${formatDate(
            scheduleBody.scheduledPublishAt,
          )}.`,
        );
      } else if (action === "publish") {
        const linkedinResponse = await fetch("/api/admin/publish/linkedin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            postId: publication.postId,
            socialPublicationId: publication.id,
          }),
        });
        const linkedinBody = (await linkedinResponse.json().catch(() => null)) as
          | {
              postId: string;
              socialPublicationId: string;
              linkedinPostId: string | null;
              linkedinImageUrn: string;
              status: "PUBLISHED";
            }
          | { message?: string }
          | null;

        if (!linkedinResponse.ok || !linkedinBody || !("status" in linkedinBody)) {
          setFeedback(
            linkedinBody && "message" in linkedinBody && linkedinBody.message
              ? linkedinBody.message
              : "A revisão foi salva, mas não foi possível publicar no LinkedIn.",
          );
          setBusyId(null);
          return;
        }

        setFeedback(
          publication.publicationResults?.LINKEDIN
            ? "Revisão salva e reenviada ao LinkedIn."
            : "Revisão salva e publicada no LinkedIn.",
        );
        setData((current) => ({
          ...current,
          data: current.data.map((item) =>
            item.id === linkedinBody.socialPublicationId
              ? {
                  ...item,
                  publicationResults: {
                    ...item.publicationResults,
                    LINKEDIN: {
                      status: "PUBLISHED",
                      externalPostId: linkedinBody.linkedinPostId,
                      mediaUrn: linkedinBody.linkedinImageUrn,
                      publishedAt: new Date().toISOString(),
                    },
                  },
                }
              : item,
          ),
        }));
      } else {
        setFeedback("Revisão salva.");
      }

      setEditingId(null);
    }
    setBusyId(null);
  }

  if (data.data.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-card p-6">
        <h2 className="font-serif text-2xl font-medium text-ink">Nenhuma publicacao gerada</h2>
        <p className="mt-2 max-w-[60ch] text-inkSoft">
          Abra uma materia publicada e solicite a primeira versao para redes sociais.
        </p>
        <Link
          className="mt-4 inline-flex rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white"
          href="/admin/posts"
        >
          Ver materias
        </Link>
      </div>
    );
  }

  return (
    <div>
      {feedback ? (
        <div
          aria-live="polite"
          className="mb-4 rounded-lg bg-paper2 px-4 py-3 text-sm font-semibold text-inkSoft"
        >
          {feedback}
        </div>
      ) : null}

      {publishedPublications.length ? (
        <section className="mb-6" aria-labelledby="published-publications-title">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-ink" id="published-publications-title">
                Publicadas nas redes
              </h2>
              <p className="mt-1 text-sm text-inkSoft">
                Conteúdos com publicação confirmada pela rede social.
              </p>
            </div>
            <span className="text-sm font-semibold text-muted">
              {publishedPublications.length}{" "}
              {publishedPublications.length === 1 ? "publicação" : "publicações"}
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-line bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead className="bg-paper2 text-xs font-bold uppercase tracking-[0.06em] text-muted">
                  <tr>
                    <th className="px-4 py-3">Publicação</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Publicada em</th>
                    <th className="px-4 py-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {publishedPublications.map((publication) => (
                    <Fragment key={publication.id}>
                      <tr className="align-middle">
                        <td className="px-4 py-3">
                          <div className="flex min-w-[230px] items-center gap-3">
                            <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-paper2">
                              {publication.generatedImageUrl ? (
                                <Image
                                  alt=""
                                  className="object-cover"
                                  fill
                                  sizes="56px"
                                  src={publication.generatedImageUrl}
                                  unoptimized
                                />
                              ) : null}
                            </div>
                            <div>
                              <p className="line-clamp-2 font-semibold leading-snug text-ink">
                                {publication.generatedShortTitle ?? "Publicação social"}
                              </p>
                              <p className="mt-1 text-xs text-muted">
                                {formatDate(publication.completedAt)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="max-w-[360px] px-4 py-3">
                          <p className="line-clamp-2 text-sm leading-relaxed text-inkSoft">
                            {publication.generatedContent ?? "Sem descrição"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            {socialNetworkOptions
                              .filter((network) => publication.publicationResults?.[network.value])
                              .map((network) => (
                                <SocialNetworkIcon key={network.value} network={network.value} />
                              ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              className="inline-flex rounded-lg bg-green px-3 py-2 text-sm font-bold text-white transition hover:bg-greenDeep"
                              onClick={() => startEditing(publication)}
                              type="button"
                            >
                              Editar e reenviar
                            </button>
                            <Link
                              className="inline-flex rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                              href={`/admin/posts/novo?id=${publication.postId}`}
                            >
                              Ver matéria
                            </Link>
                          </div>
                        </td>
                      </tr>
                      {editingId === publication.id ? (
                        <tr>
                          <td className="bg-paper2 px-4 py-4" colSpan={4}>
                            <div className="grid gap-4">
                              <label
                                className="grid gap-2 text-sm font-bold text-ink"
                                htmlFor={`published-description-${publication.id}`}
                              >
                                Descrição da publicação
                                <textarea
                                  className="min-h-40 w-full resize-y rounded-lg border border-lineStrong bg-card px-3 py-2.5 text-[15px] font-normal leading-relaxed text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20"
                                  id={`published-description-${publication.id}`}
                                  maxLength={5000}
                                  onChange={(event) => setDescription(event.target.value)}
                                  value={description}
                                />
                              </label>
                              <fieldset>
                                <legend className="text-sm font-bold text-ink">
                                  Publicar em{" "}
                                  <span className="font-normal text-muted">(opcional)</span>
                                </legend>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {socialNetworkOptions.map((network) => (
                                    <label
                                      className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-lineStrong bg-card px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 has-[:checked]:border-green has-[:checked]:bg-green/10 has-[:checked]:text-greenDeep"
                                      key={network.value}
                                    >
                                      <input
                                        checked={socialNetworks.includes(network.value)}
                                        className="size-4 accent-green"
                                        onChange={() => toggleNetwork(network.value)}
                                        type="checkbox"
                                      />
                                      {network.label}
                                    </label>
                                  ))}
                                </div>
                              </fieldset>
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="rounded-lg border border-lineStrong bg-card px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={busyId === publication.id}
                                  onClick={() => saveReview(publication, "save")}
                                  type="button"
                                >
                                  {busyId === publication.id ? "Salvando..." : "Salvar revisão"}
                                </button>
                                {socialNetworks.includes("LINKEDIN") ? (
                                  <button
                                    className="rounded-lg bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-greenDeep disabled:cursor-not-allowed disabled:opacity-50"
                                    disabled={busyId === publication.id}
                                    onClick={() => saveReview(publication, "publish")}
                                    type="button"
                                  >
                                    {busyId === publication.id
                                      ? "Salvando e reenviando..."
                                      : "Salvar e reenviar"}
                                  </button>
                                ) : null}
                                <button
                                  className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
                                  disabled={busyId === publication.id}
                                  onClick={() => saveReview(publication, "schedule")}
                                  type="button"
                                >
                                  {busyId === publication.id
                                    ? "Salvando e enfileirando..."
                                    : "Salvar e colocar na fila diária"}
                                </button>
                                <button
                                  className="rounded-lg border border-lineStrong bg-card px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                                  onClick={() => setEditingId(null)}
                                  type="button"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : null}

      {workingPublications.length ? (
        <section aria-labelledby="working-publications-title">
          <h2 className="mb-3 text-lg font-bold text-ink" id="working-publications-title">
            Em preparação
          </h2>
          <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {workingPublications.map((publication, index) => (
              <article
                className="overflow-hidden rounded-lg border border-line bg-card"
                key={publication.id}
              >
                <div className="relative aspect-square bg-paper2">
                  {publication.generatedImageUrl ? (
                    <Image
                      alt={publication.generatedShortTitle ?? "Imagem da publicacao social"}
                      className="object-cover"
                      fill
                      loading={index === 0 ? "eager" : "lazy"}
                      sizes="(min-width: 1536px) 30vw, (min-width: 768px) 45vw, 100vw"
                      src={publication.generatedImageUrl}
                      unoptimized
                    />
                  ) : (
                    <div className="grid h-full place-items-center px-6 text-center text-sm font-semibold text-muted">
                      {publication.status === "FAILED"
                        ? "Imagem nao gerada"
                        : "A imagem aparecera aqui"}
                    </div>
                  )}
                  <span
                    className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[publication.status]}`}
                  >
                    {statusLabels[publication.status]}
                  </span>
                </div>

                <div className="p-5">
                  <h2 className="font-serif text-xl font-medium leading-tight text-ink">
                    {publication.generatedShortTitle ?? "Publicacao em preparacao"}
                  </h2>
                  {editingId === publication.id ? (
                    <div className="mt-4 grid gap-4">
                      <label
                        className="grid gap-2 text-sm font-bold text-ink"
                        htmlFor={`description-${publication.id}`}
                      >
                        Descrição da publicação
                        <textarea
                          className="min-h-40 w-full resize-y rounded-lg border border-lineStrong bg-card px-3 py-2.5 text-[15px] font-normal leading-relaxed text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20"
                          id={`description-${publication.id}`}
                          maxLength={5000}
                          onChange={(event) => setDescription(event.target.value)}
                          value={description}
                        />
                      </label>
                      <fieldset>
                        <legend className="text-sm font-bold text-ink">
                          Publicar em <span className="font-normal text-muted">(opcional)</span>
                        </legend>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {socialNetworkOptions.map((network) => (
                            <label
                              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 has-[:checked]:border-green has-[:checked]:bg-green/10 has-[:checked]:text-greenDeep"
                              key={network.value}
                            >
                              <input
                                checked={socialNetworks.includes(network.value)}
                                className="size-4 accent-green"
                                onChange={() => toggleNetwork(network.value)}
                                type="checkbox"
                              />
                              {network.label}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={busyId === publication.id}
                          onClick={() => saveReview(publication, "save")}
                          type="button"
                        >
                          {busyId === publication.id ? "Salvando..." : "Salvar revisão"}
                        </button>
                        {socialNetworks.includes("LINKEDIN") ? (
                          <button
                            className="rounded-lg bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-greenDeep disabled:cursor-not-allowed disabled:opacity-50"
                            disabled={busyId === publication.id}
                            onClick={() => saveReview(publication, "publish")}
                            type="button"
                          >
                            {busyId === publication.id
                              ? "Salvando e publicando..."
                              : "Salvar e publicar"}
                          </button>
                        ) : null}
                        <button
                          className="rounded-lg bg-ink px-4 py-2 text-sm font-bold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={busyId === publication.id}
                          onClick={() => saveReview(publication, "schedule")}
                          type="button"
                        >
                          {busyId === publication.id
                            ? "Salvando e enfileirando..."
                            : "Salvar e colocar na fila diária"}
                        </button>
                        <button
                          className="rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                          onClick={() => setEditingId(null)}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="mt-3 line-clamp-5 whitespace-pre-line text-[15px] leading-relaxed text-inkSoft">
                        {publication.generatedContent ??
                          publication.errorMessage ??
                          "O texto esta sendo preparado."}
                      </p>
                      {publication.generatedHashtags?.length ? (
                        <p className="mt-3 line-clamp-2 text-sm font-semibold text-greenDeep">
                          {publication.generatedHashtags.join(" ")}
                        </p>
                      ) : null}
                      {publication.socialNetworks?.length ? (
                        <p className="mt-3 text-xs font-bold text-muted">
                          {publication.socialNetworks
                            .map(
                              (value) =>
                                socialNetworkOptions.find((item) => item.value === value)?.label,
                            )
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                      ) : null}
                      {publication.scheduledPublishAt && publication.scheduledPublishJobId ? (
                        <p className="mt-3 rounded-lg border border-line bg-paper2 px-3 py-2 text-xs font-bold text-inkSoft">
                          Fila diária do LinkedIn: {formatDate(publication.scheduledPublishAt)}
                        </p>
                      ) : null}
                      {Object.keys(publication.publicationResults ?? {}).length ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {socialNetworkOptions
                            .filter((network) => publication.publicationResults?.[network.value])
                            .map((network) => (
                              <span
                                className="inline-flex items-center gap-1.5 rounded-full border border-green/30 bg-green/10 px-2.5 py-1 text-xs font-bold text-greenDeep"
                                key={network.value}
                              >
                                <span aria-hidden="true">✓</span>
                                Publicado no {network.label}
                              </span>
                            ))}
                        </div>
                      ) : null}
                    </>
                  )}

                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm">
                    <div>
                      <dt className="text-muted">Criada</dt>
                      <dd className="font-semibold text-inkSoft">
                        {formatDate(publication.createdAt)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-muted">Concluida</dt>
                      <dd className="font-semibold text-inkSoft">
                        {formatDate(publication.completedAt)}
                      </dd>
                    </div>
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {publication.status === "COMPLETED" && editingId !== publication.id ? (
                      <button
                        className="rounded-lg bg-green px-3 py-2 text-sm font-bold text-white transition hover:bg-greenDeep"
                        onClick={() => startEditing(publication)}
                        type="button"
                      >
                        Editar e escolher redes
                      </button>
                    ) : null}
                    {publication.generatedContent ? (
                      <button
                        className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft hover:bg-paper2"
                        onClick={() => copyText(publication)}
                        type="button"
                      >
                        Copiar texto
                      </button>
                    ) : null}
                    {publication.status === "FAILED" ? (
                      <button
                        className="rounded-lg bg-tomato px-3 py-2 text-sm font-bold text-white disabled:opacity-50"
                        disabled={busyId === publication.id}
                        onClick={() => retry(publication.id)}
                        type="button"
                      >
                        {busyId === publication.id ? "Reenfileirando..." : "Tentar novamente"}
                      </button>
                    ) : null}
                    <Link
                      className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft hover:bg-paper2"
                      href={`/admin/posts/novo?id=${publication.postId}`}
                    >
                      Ver materia
                    </Link>
                  </div>

                  {publication.status === "COMPLETED" && generationId === publication.id ? (
                    <div className="mt-4 border-t border-line pt-4">
                      <h3 className="text-sm font-bold text-ink">Criar nova versão</h3>
                      <p className="mt-1 text-sm leading-relaxed text-inkSoft">
                        A versão atual será preservada no histórico.
                      </p>
                      <div
                        className="mt-3 flex flex-wrap gap-2"
                        role="group"
                        aria-label="Parte a regenerar"
                      >
                        {(
                          [
                            ["REGENERATE_TEXT", "Apenas texto"],
                            ["REGENERATE_IMAGE", "Apenas imagem"],
                            ["NEW_PUBLICATION", "Texto e imagem"],
                          ] as const
                        ).map(([mode, label]) => (
                          <button
                            className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${generationMode === mode ? "border-green bg-green/10 text-greenDeep" : "border-lineStrong text-inkSoft hover:bg-paper2"}`}
                            key={mode}
                            onClick={() => setGenerationMode(mode)}
                            type="button"
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      {generationMode !== "REGENERATE_TEXT" ? (
                        <label
                          className="mt-4 grid gap-2 text-sm font-bold text-ink"
                          htmlFor={`image-instruction-${publication.id}`}
                        >
                          Ajuste desejado na imagem{" "}
                          <span className="font-normal text-muted">(opcional)</span>
                          <textarea
                            className="min-h-24 w-full resize-y rounded-lg border border-lineStrong bg-card px-3 py-2.5 font-normal leading-relaxed text-ink outline-none transition focus:border-green focus:ring-2 focus:ring-green/20"
                            id={`image-instruction-${publication.id}`}
                            maxLength={500}
                            onChange={(event) => setImageEditInstruction(event.target.value)}
                            placeholder="Ex.: incluir um aparelho glicosímetro sobre a mesa"
                            value={imageEditInstruction}
                          />
                          <span className="text-right text-xs font-normal text-muted">
                            {imageEditInstruction.length}/500
                          </span>
                        </label>
                      ) : null}
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          className="rounded-lg bg-green px-4 py-2 text-sm font-bold text-white transition hover:bg-greenDeep disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={busyId === publication.id}
                          onClick={() => generateVersion(publication)}
                          type="button"
                        >
                          {busyId === publication.id
                            ? "Adicionando à fila..."
                            : "Gerar nova versão"}
                        </button>
                        <button
                          className="rounded-lg border border-lineStrong px-4 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                          onClick={() => setGenerationId(null)}
                          type="button"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}
                  {publication.status === "COMPLETED" && generationId !== publication.id ? (
                    <button
                      className="mt-3 text-sm font-bold text-greenDeep underline-offset-4 hover:underline"
                      onClick={() => startGeneration(publication.id, "NEW_PUBLICATION")}
                      type="button"
                    >
                      Criar outra versão
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
