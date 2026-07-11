const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ?? "http://localhost:9610";
const MINIO_PUBLIC_PATH = process.env.NEXT_PUBLIC_MINIO_PUBLIC_PATH ?? "/sangue-doce/public";
const PUBLIC_IMAGE_PROXY_PATH = "/api/public-images";
const PUBLIC_PREFIX = "public";

export function resolvePublicImageUrl(value?: string | null): string {
  if (!value) {
    return "";
  }

  const normalizedValue = value.trim();

  if (/^(https?:|blob:|data:)/i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (!normalizedValue) {
    return "";
  }

  const normalizedPublicUrl = MINIO_PUBLIC_URL.replace(/\/$/, "");
  const normalizedPublicPath = normalizePath(MINIO_PUBLIC_PATH);
  const publicImagePath = toPublicImagePathFromValue(normalizedValue, normalizedPublicPath);

  if (publicImagePath) {
    return toPublicImageProxyPath(publicImagePath);
  }

  if (normalizedPublicUrl && normalizedPublicPath && !normalizedValue.startsWith("/")) {
    return toPublicImageProxyPath(
      `${normalizedPublicPath}/${normalizedValue.replace(/^\/+/, "")}`,
    );
  }

  return normalizedValue;
}

export function toPublicImagePath(value?: string | null): string {
  return value?.trim() ?? "";
}

function normalizePath(value: string): string {
  if (!value) {
    return "";
  }

  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

function toPublicImageProxyPath(value: string): string {
  return `${PUBLIC_IMAGE_PROXY_PATH}/${value.replace(/^\/+/, "")}`;
}

function toPublicImagePathFromValue(value: string, normalizedPublicPath: string): string {
  const normalizedValue = normalizePath(value);
  const publicPathParts = normalizedPublicPath.split("/").filter(Boolean);
  const bucketName = publicPathParts[0];

  if (!normalizedValue || !normalizedPublicPath) {
    return "";
  }

  if (normalizedValue.startsWith(normalizedPublicPath)) {
    return normalizedValue;
  }

  if (bucketName && normalizedValue.startsWith(`/${PUBLIC_PREFIX}/`)) {
    return `/${bucketName}${normalizedValue}`;
  }

  return "";
}
