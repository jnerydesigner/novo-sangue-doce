import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f8faf8",
    theme_color: "#2f5d3c",
    lang: "pt-BR",
    icons: [{ src: "/sangue-doce-logo-small.png", sizes: "1024x1024", type: "image/png" }],
  };
}

