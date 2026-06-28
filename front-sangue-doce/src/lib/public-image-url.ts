const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ?? "http://localhost:9610";
const MINIO_PUBLIC_PATH = process.env.NEXT_PUBLIC_MINIO_PUBLIC_PATH ?? "/sangue-doce/public";

export function resolvePublicImageUrl(value?: string | null): string {
  if (!value) {
    return "";
  }

  if (/^(https?:|blob:|data:)/i.test(value)) {
    return value;
  }

  const normalizedPublicUrl = MINIO_PUBLIC_URL.replace(/\/$/, "");
  const normalizedPublicPath = normalizePath(MINIO_PUBLIC_PATH);

  if (normalizedPublicUrl && normalizedPublicPath && value.startsWith(normalizedPublicPath)) {
    return `${normalizedPublicUrl}${value}`;
  }

  if (normalizedPublicUrl && normalizedPublicPath && !value.startsWith("/")) {
    return `${normalizedPublicUrl}${normalizedPublicPath}/${value.replace(/^\/+/, "")}`;
  }

  return value;
}

export function toPublicImagePath(value?: string | null): string {
  if (!value) {
    return "";
  }

  const normalizedPublicUrl = MINIO_PUBLIC_URL.replace(/\/$/, "");
  const normalizedPublicPath = normalizePath(MINIO_PUBLIC_PATH);

  if (normalizedPublicUrl && normalizedPublicPath && value.startsWith(normalizedPublicUrl)) {
    const path = value.slice(normalizedPublicUrl.length);

    return path.startsWith(normalizedPublicPath) ? path : value;
  }

  return value;
}

function normalizePath(value: string): string {
  if (!value) {
    return "";
  }

  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}
