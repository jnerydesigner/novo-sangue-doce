"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const gaId = process.env.NEXT_PUBLIC_GA4_ID;
const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export function AnalyticsScripts() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const sync = () => setEnabled(localStorage.getItem("sangue-doce-analytics-consent") === "accepted");
    sync();
    window.addEventListener("analytics-consent", sync);
    return () => window.removeEventListener("analytics-consent", sync);
  }, []);

  if (!gaId || !enabled) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{send_page_view:false});${adsId ? `gtag('config','${adsId}');` : ""}`}
      </Script>
    </>
  );
}
