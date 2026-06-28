import Image from "next/image";
import Link from "next/link";
import { api, type MonthlyMeasurementReport, type Post } from "@/lib/api";
import { formatPostDate } from "@/lib/posts";
import { resolvePublicImageUrl } from "@/lib/public-image-url";
import { QuickGlucoseForm } from "./_lib/quick-glucose-form";
import { requireAdmin } from "./_lib/require-admin";
import { AdminShell } from "./admin-shell";

export const dynamic = "force-dynamic";

const adminActions = [
  {
    title: "Materias",
    description: "Publicar, revisar rascunhos e gerenciar a linha editorial.",
    href: "/admin/posts",
  },
  {
    title: "Usuarios",
    description: "Ver contas cadastradas e acompanhar quem usa a plataforma.",
    href: "/admin/usuarios",
  },
  {
    title: "Autores",
    description: "Gerenciar autores, perfis editoriais e vinculos com usuarios.",
    href: "/admin/autores",
  },
];

const statusLabels: Record<Post["status"], string> = {
  ARCHIVED: "Arquivada",
  DRAFT: "Rascunho",
  PUBLISHED: "Publicada",
};

const statusClasses: Record<Post["status"], string> = {
  ARCHIVED: "border-lineStrong bg-paper2 text-muted",
  DRAFT: "border-tomato/30 bg-[#f7e9e4] text-tomato",
  PUBLISHED: "border-green/30 bg-green/10 text-greenDeep",
};

function getLatestMeasurement(report: MonthlyMeasurementReport | null) {
  return (
    report?.days
      .flatMap((day) => day.measurements)
      .sort(
        (left, right) => new Date(right.measuredAt).getTime() - new Date(left.measuredAt).getTime(),
      )[0] ?? null
  );
}

function getMeasurementTime(value?: string) {
  if (!value) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default async function AdminPage() {
  const { accessToken, profile } = await requireAdmin();
  const today = new Date();
  const [author, monthlyReport] = await Promise.all([
    api.authors.me({ accessToken }).catch(() => null),
    api.measurements
      .monthlyReport({
        accessToken,
        year: today.getFullYear(),
        month: today.getMonth() + 1,
      })
      .catch(() => null),
  ]);
  const authorPosts = author ? await api.posts.listByAuthor(author.id).catch(() => []) : [];
  const authorAvatarUrl = resolvePublicImageUrl(author?.avatarUrl);
  const latestMeasurement = getLatestMeasurement(monthlyReport);
  const latestPost = authorPosts[0] ?? null;
  const routineCards = [
    {
      title: "Glicemia",
      value: latestMeasurement ? String(latestMeasurement.glucoseValueMgDl) : "--",
      unit: latestMeasurement ? "mg/dL" : "",
      detail: latestMeasurement
        ? `Ultima leitura as ${getMeasurementTime(latestMeasurement.measuredAt)}`
        : "Sem leituras registradas neste mes",
    },
    {
      title: "Sono",
      value: "7h10",
      unit: "",
      detail: "Meta pessoal em acompanhamento",
    },
    {
      title: "Refeicoes",
      value: "2",
      unit: "hoje",
      detail: "Registro alimentar em evolucao",
    },
  ];

  return (
    <AdminShell
      active="overview"
      userAvatarUrl={profile.avatarUrl}
      userName={profile.name}
      userRole={profile.role}
    >
      <section className="grid gap-6">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="max-w-[62ch] text-[1.05rem] leading-relaxed text-inkSoft">
              Ola, {profile.name}. Acompanhe as ferramentas editoriais e os dados da plataforma no
              mesmo lugar.
            </p>
          </div>
          <span className="rounded-full border border-green/30 bg-green/10 px-4 py-2 text-sm font-bold text-greenDeep">
            {profile.role}
          </span>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {routineCards.map((card) => (
            <article className="rounded-lg border border-line bg-card p-5" key={card.title}>
              <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                {card.title}
              </span>
              <div className="mt-3 flex items-end gap-2">
                <strong className="font-serif text-[2.35rem] font-medium leading-none text-ink">
                  {card.value}
                </strong>
                {card.unit ? (
                  <span className="pb-1 text-sm font-semibold text-inkSoft">{card.unit}</span>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-inkSoft">{card.detail}</p>
              {card.title === "Glicemia" ? <QuickGlucoseForm /> : null}
            </article>
          ))}
        </div>

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-lg border border-line bg-card p-5">
            <div className="flex items-start gap-4">
              {author && authorAvatarUrl ? (
                <Image
                  alt={author.name}
                  className="size-14 rounded-full border border-line object-cover"
                  height={56}
                  src={authorAvatarUrl}
                  width={56}
                />
              ) : (
                <div className="grid size-14 shrink-0 place-items-center rounded-full border border-line bg-paper2 font-bold text-greenDeep">
                  {profile.name.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="font-serif text-2xl font-medium tracking-normal">
                  {author?.name ?? profile.name}
                </h2>
                <p className="mt-1 text-sm font-semibold text-greenDeep">
                  {author?.role ?? `${profile.role} do Sangue Doce`}
                </p>
              </div>
            </div>
            <p className="mt-4 text-[15px] leading-relaxed text-inkSoft">
              {author?.bio ??
                "Complete seu perfil de autor para apresentar sua voz editorial, experiencia e vinculo com o Sangue Doce."}
            </p>
          </article>

          <article className="rounded-lg border border-line bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-muted">
                  Ultima materia
                </span>
                <h2 className="mt-3 font-serif text-2xl font-medium tracking-normal">
                  {latestPost?.title ?? "Nenhuma materia sua ainda"}
                </h2>
              </div>
              {latestPost ? (
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClasses[latestPost.status]}`}
                >
                  {statusLabels[latestPost.status]}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-[15px] leading-relaxed text-inkSoft">
              {latestPost?.excerpt ??
                "Quando uma materia estiver vinculada ao seu autor, ela aparece aqui para retomada rapida."}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              {latestPost ? (
                <>
                  <span className="text-sm font-semibold text-muted">
                    Atualizada em {formatPostDate(latestPost.updatedAt)}
                  </span>
                  <Link
                    className="rounded-lg border border-lineStrong px-3 py-2 text-sm font-semibold text-inkSoft transition hover:bg-paper2"
                    href={`/admin/posts/novo?id=${latestPost.id}`}
                  >
                    Editar materia
                  </Link>
                </>
              ) : (
                <Link
                  className="rounded-lg bg-green px-4 py-2.5 text-sm font-bold text-white transition hover:-translate-y-px hover:bg-greenDeep"
                  href="/admin/posts/novo"
                >
                  Nova materia
                </Link>
              )}
            </div>
          </article>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {adminActions.map((action) => (
            <Link
              className="rounded-lg border border-line bg-card p-5 transition hover:-translate-y-1 hover:border-lineStrong hover:shadow-editorial"
              href={action.href}
              key={action.title}
            >
              <h2 className="font-serif text-2xl font-medium tracking-normal text-ink">
                {action.title}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed text-inkSoft">{action.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
