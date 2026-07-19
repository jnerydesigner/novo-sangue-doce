"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

const ignoredPrefixes = ["/admin", "/dashboard", "/login", "/cadastro"];

export function PageVisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || ignoredPrefixes.some((prefix) => pathname.startsWith(prefix))) {
      return;
    }

    const payload = JSON.stringify({
      path: pathname,
      referrer: document.referrer || undefined,
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/visits", new Blob([payload], { type: "application/json" }));
      return;
    }

    void fetch("/api/analytics/visits", {
      body: payload,
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      method: "POST",
    });
  }, [pathname]);

  return null;
}
