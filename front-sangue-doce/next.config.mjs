import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== "production",
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
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
