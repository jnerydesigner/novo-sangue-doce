import { NextResponse } from "next/server";

const MINIO_INTERNAL_PUBLIC_URL =
  process.env.MINIO_INTERNAL_PUBLIC_URL ??
  process.env.MINIO_PUBLIC_URL ??
  process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ??
  "http://localhost:9610";
const MINIO_PUBLIC_PATH = process.env.MINIO_PUBLIC_PATH ?? "/sangue-doce/public";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;

  if (!isAllowedPublicImagePath(path)) {
    return NextResponse.json({ message: "Imagem publica invalida." }, { status: 404 });
  }

  const imageUrl = `${MINIO_INTERNAL_PUBLIC_URL.replace(/\/$/, "")}/${path
    .map((part) => encodeURIComponent(part))
    .join("/")}`;
  const response = await fetch(imageUrl, {
    cache: "no-store",
  });

  if (!response.ok || !response.body) {
    return NextResponse.json({ message: "Imagem publica nao encontrada." }, { status: 404 });
  }

  return new NextResponse(response.body, {
    headers: {
      "Cache-Control": "public, max-age=300",
      "Content-Type": response.headers.get("Content-Type") ?? "application/octet-stream",
    },
    status: 200,
  });
}

function isAllowedPublicImagePath(path: string[]) {
  if (!path.length || path.some((part) => !part || part === "." || part === "..")) {
    return false;
  }

  const publicPathParts = MINIO_PUBLIC_PATH.split("/").filter(Boolean);

  return publicPathParts.every((part, index) => path[index] === part);
}
