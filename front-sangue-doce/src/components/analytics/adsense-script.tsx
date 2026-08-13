"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function AdsenseScript() {
  const pathname = usePathname();
  const isPrivateArea = pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/dashboard" || pathname.startsWith("/dashboard/");

  if (isPrivateArea) return null;

  return (
    <Script
      id="google-adsense"
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1600331961556195"
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
