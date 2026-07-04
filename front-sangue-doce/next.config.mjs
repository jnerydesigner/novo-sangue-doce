import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const minioPublicUrl = process.env.NEXT_PUBLIC_MINIO_PUBLIC_URL ?? "http://localhost:9610";
const minioPublicPath = process.env.NEXT_PUBLIC_MINIO_PUBLIC_PATH ?? "/sangue-doce/public";
const minioUrl = new URL(minioPublicUrl);
const s3PublicUrl =
  process.env.NEXT_PUBLIC_AWS_S3_PUBLIC_URL ??
  "https://sangue-doce.s3.us-east-1.amazonaws.com";
const s3Url = new URL(s3PublicUrl);

/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
  },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
