import type { Metadata } from "next";
import { AidexxAd } from "@/components/ads/aidexx-ad";

export const metadata: Metadata = {
  title: "Publicidade AidexX",
  robots: { index: false, follow: false },
};

export default function AidexxAdPage() {
  return (
    <main className="mx-auto max-w-[970px] px-5 py-10">
      <aside aria-label="Publicidade" className="overflow-hidden rounded-lg border border-line bg-surface">
        <div className="border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
          Publicidade
        </div>
        <AidexxAd />
      </aside>
    </main>
  );
}
