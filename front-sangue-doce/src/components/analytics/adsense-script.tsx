"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ADSENSE_SCRIPT_ID = "google-adsense";

export function AdsenseScript() {
  const pathname = usePathname();

  const isPrivateArea =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/");

  useEffect(() => {
    if (isPrivateArea) {
      return;
    }

    if (document.getElementById(ADSENSE_SCRIPT_ID)) {
      return;
    }

    const script = document.createElement("script");

    script.id = ADSENSE_SCRIPT_ID;
    script.async = true;
    script.src =
      "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1600331961556195";
    script.crossOrigin = "anonymous";

    document.head.appendChild(script);
  }, [isPrivateArea]);

  return null;
}
