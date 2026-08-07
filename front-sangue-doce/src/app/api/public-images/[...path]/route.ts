import { NextResponse } from "next/server";

const S3_BUCKET = process.env.AWS_S3_BUCKET ?? "sangue-doce";
const S3_REGION = process.env.AWS_S3_REGION ?? process.env.AWS_REGION ?? "us-east-1";
const S3_PUBLIC_PATH = process.env.S3_PUBLIC_PATH ?? "/sangue-doce/public";
const PUBLIC_PREFIX = "public";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { path } = await context.params;
  const publicImagePath = getPublicImagePath(path);

  if (!publicImagePath) {
    return NextResponse.json({ message: "Imagem publica invalida." }, { status: 404 });
  }

  const bucketPrefix = S3_PUBLIC_PATH.split("/").filter(Boolean)[0] ?? S3_BUCKET;
  const objectPath = publicImagePath[0] === bucketPrefix
    ? publicImagePath.slice(1)
    : publicImagePath;
  const imageUrl = `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${objectPath
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

function getPublicImagePath(path: string[]) {
  if (!path.length || path.some((part) => !part || part === "." || part === "..")) {
    return null;
  }

  const publicPathParts = S3_PUBLIC_PATH.split("/").filter(Boolean);
  const startsWithPublicPath = publicPathParts.every((part, index) => path[index] === part);

  if (startsWithPublicPath) {
    return path;
  }

  const bucketName = publicPathParts[0];

  if (bucketName && path[0] === PUBLIC_PREFIX) {
    return [bucketName, ...path];
  }

  return null;
}
