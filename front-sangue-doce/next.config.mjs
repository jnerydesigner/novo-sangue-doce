import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const minioPublicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ?? "http://localhost:9610";
const minioPublicPath = process.env.NEXT_PUBLIC_MINIO_PUBLIC_PATH ?? "/sangue-doce/public";
const minioUrl = new URL(minioPublicUrl);
const s3PublicUrl =
  process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL ?? "https://sangue-doce.s3.us-east-1.amazonaws.com";
const s3Url = new URL(s3PublicUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      { source: "/materias", destination: "/articles", permanent: true },
      { source: "/materias/:slug", destination: "/articles/:slug", permanent: true },
      { source: "/receitas", destination: "/recipes", permanent: true },
      { source: "/receitas/:slug", destination: "/recipes/:slug", permanent: true },
      { source: "/autores/:slug", destination: "/authors/:slug", permanent: true },
      { source: "/cadastro", destination: "/signup", permanent: true },
      { source: "/contato", destination: "/contact", permanent: true },
      { source: "/convite/:token", destination: "/invite/:token", permanent: true },
      { source: "/guias/antes-da-consulta", destination: "/guides/before-appointment", permanent: true },
      { source: "/guias/depois-do-exercicio", destination: "/guides/after-exercise", permanent: true },
      { source: "/guias/no-mercado", destination: "/guides/at-the-market", permanent: true },
      { source: "/sobre", destination: "/about", permanent: true },
      { source: "/privacidade", destination: "/privacy", permanent: true },
      { source: "/termos-de-servico", destination: "/terms-of-service", permanent: true },
      { source: "/exclusao-de-dados", destination: "/data-deletion", permanent: true },
      { source: "/admin/autores", destination: "/admin/authors", permanent: true },
      { source: "/admin/convites", destination: "/admin/invites", permanent: true },
      { source: "/admin/receitas", destination: "/admin/recipes", permanent: true },
      { source: "/admin/receitas/nova", destination: "/admin/recipes/new", permanent: true },
      {
        source: "/admin/publicacoes-sociais",
        destination: "/admin/social-publications",
        permanent: true,
      },
      {
        source: "/admin/publicacoes-institucionais",
        destination: "/admin/institutional-publications",
        permanent: true,
      },
      { source: "/admin/taxonomia", destination: "/admin/taxonomy", permanent: true },
      { source: "/admin/usuarios", destination: "/admin/users", permanent: true },
      { source: "/admin/posts/novo", destination: "/admin/posts/new", permanent: true },
    ];
  },
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
    unoptimized: process.env.NEXT_IMAGE_UNOPTIMIZED === "true",
    remotePatterns: [
      {
        hostname: "github.com",
        protocol: "https",
      },
      {
        hostname: minioUrl.hostname,
        pathname: `${minioPublicPath.replace(/\/$/, "")}/**`,
        port: minioUrl.port,
        protocol: minioUrl.protocol.replace(":", ""),
      },
      {
        hostname: s3Url.hostname,
        pathname: "/public/**",
        protocol: s3Url.protocol.replace(":", ""),
      },
      {
        hostname: s3Url.hostname,
        pathname: "/cloud/public/**",
        protocol: s3Url.protocol.replace(":", ""),
      },
      {
        hostname: s3Url.hostname,
        pathname: "/local/public/**",
        protocol: s3Url.protocol.replace(":", ""),
      },
      {
        hostname: s3Url.hostname,
        pathname: "/local/social_medias/thumb/**",
        protocol: s3Url.protocol.replace(":", ""),
      },
    ],
  },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
