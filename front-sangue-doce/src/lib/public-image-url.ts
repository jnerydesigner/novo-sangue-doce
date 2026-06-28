const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ?? "http://localhost:9610";
const MINIO_PUBLIC_PATH = process.env.NEXT_PUBLIC_MINIO_PUBLIC_PATH ?? "/sangue-doce/public";
const PUBLIC_IMAGE_PROXY_PATH = "/api/public-images";

export function resolvePublicImageUrl(value?: string | null): string {
  if (!value) {
    return "";
  }

  if (/^(blob:|data:)/i.test(value)) {
    return value;
  }

  const normalizedPublicUrl = MINIO_PUBLIC_URL.replace(/\/$/, "");
  const normalizedPublicPath = normalizePath(MINIO_PUBLIC_PATH);

  if (/^https?:/i.test(value)) {
    try {
      const url = new URL(value);

      if (normalizedPublicPath && url.pathname.startsWith(normalizedPublicPath)) {
        return toPublicImageProxyPath(url.pathname);
      }
    } catch {
      return value;
    }

    return value;
  }

  if (normalizedPublicUrl && normalizedPublicPath && value.startsWith(normalizedPublicPath)) {
    return toPublicImageProxyPath(value);
  }

  if (normalizedPublicUrl && normalizedPublicPath && !value.startsWith("/")) {
    return toPublicImageProxyPath(`${normalizedPublicPath}/${value.replace(/^\/+/, "")}`);
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

function toPublicImageProxyPath(value: string): string {
  return `${PUBLIC_IMAGE_PROXY_PATH}/${value.replace(/^\/+/, "")}`;
}
