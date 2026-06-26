import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
        hostname: "localhost",
        pathname: "/sangue-doce/public/**",
        port: "9610",
        protocol: "http",
      },
    ],
  },
  output: "standalone",
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
