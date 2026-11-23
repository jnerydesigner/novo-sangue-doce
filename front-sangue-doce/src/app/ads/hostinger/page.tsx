import type { Metadata } from "next";
import { HostingerAd } from "@/components/ads/hostinger-ad";

export const metadata: Metadata = {
  title: "Publicidade Hostinger",
  robots: { index: false, follow: false },
};

export default function HostingerAdPage() {
  return (
    <main className="mx-auto max-w-[970px] px-5 py-10">
      <aside aria-label="Publicidade" className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Publicidade
        </div>
        <HostingerAd />
      </aside>
    </main>
  );
}
