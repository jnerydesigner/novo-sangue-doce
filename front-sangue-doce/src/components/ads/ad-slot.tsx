"use client";

import { useEffect } from "react";
import { AidexxAd } from "./aidexx-ad";
import { HostingerAd } from "./hostinger-ad";

type AdPlacement =
  | "homeTop"
  | "homeMiddle"
  | "homeBottom"
  | "articleTop"
  | "articleMiddle"
  | "articleBottom"
  | "articleList"
  | "recipeTop"
  | "recipeBottom"
  | "recipeList"
  | "guideTop"
  | "guideBottom";

type AdSlotProps = {
  className?: string;
  placement: AdPlacement;
  ownAd?: "aidexx" | "hostinger";
};

type WindowWithAds = Window & {
  adsbygoogle?: unknown[];
};

const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "ca-pub-1600331961556195";

const adSlots: Record<AdPlacement, string | undefined> = {
  homeTop: process.env.NEXT_PUBLIC_ADSENSE_HOME_TOP_SLOT,
  homeMiddle: process.env.NEXT_PUBLIC_ADSENSE_HOME_MIDDLE_SLOT,
  homeBottom: process.env.NEXT_PUBLIC_ADSENSE_HOME_BOTTOM_SLOT,
  articleTop: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_TOP_SLOT,
  articleMiddle: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_MIDDLE_SLOT,
  articleBottom: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_BOTTOM_SLOT,
  articleList: process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_LIST_SLOT,
  recipeTop: process.env.NEXT_PUBLIC_ADSENSE_RECIPE_TOP_SLOT,
  recipeBottom: process.env.NEXT_PUBLIC_ADSENSE_RECIPE_BOTTOM_SLOT,
  recipeList: process.env.NEXT_PUBLIC_ADSENSE_RECIPE_LIST_SLOT,
  guideTop: process.env.NEXT_PUBLIC_ADSENSE_GUIDE_TOP_SLOT,
  guideBottom: process.env.NEXT_PUBLIC_ADSENSE_GUIDE_BOTTOM_SLOT,
};

const adHeights: Record<AdPlacement, string> = {
  homeTop: "min-h-[118px] sm:min-h-[100px]",
  homeMiddle: "min-h-[118px] sm:min-h-[100px]",
  homeBottom: "min-h-[118px] sm:min-h-[100px]",
  articleTop: "min-h-[118px] sm:min-h-[100px]",
  articleMiddle: "min-h-[280px]",
  articleBottom: "min-h-[118px] sm:min-h-[100px]",
  articleList: "min-h-[118px] sm:min-h-[100px]",
  recipeTop: "min-h-[118px] sm:min-h-[100px]",
  recipeBottom: "min-h-[118px] sm:min-h-[100px]",
  recipeList: "min-h-[118px] sm:min-h-[100px]",
  guideTop: "min-h-[118px] sm:min-h-[100px]",
  guideBottom: "min-h-[118px] sm:min-h-[100px]",
};

export function AdSlot({ className = "", placement, ownAd }: AdSlotProps) {
  const slot = adSlots[placement];
  const showOwnAd = Boolean(ownAd && !slot);
  const showPlaceholder = process.env.NODE_ENV !== "production" && !slot;

  useEffect(() => {
    if (!slot) {
      return;
    }

    try {
      const adsWindow = window as WindowWithAds;
      adsWindow.adsbygoogle = adsWindow.adsbygoogle ?? [];
      adsWindow.adsbygoogle.push({});
    } catch {
      // Ad blockers and preview browsers may block AdSense. The slot should fail quietly.
    }
  }, [slot]);

  if (!slot && !showPlaceholder && !showOwnAd) {
    return null;
  }

  return (
    <aside
      aria-label="Publicidade"
      className={`not-prose my-10 overflow-hidden rounded-lg border border-line bg-surface ${className}`}
    >
      <div className="border-b border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
        Publicidade
      </div>
      {showOwnAd ? (
        ownAd === "hostinger" ? <HostingerAd /> : <AidexxAd />
      ) : <div className={`grid place-items-center px-3 py-4 ${adHeights[placement]}`}>
        {slot ? (
          <ins
            className="adsbygoogle block w-full"
            data-ad-client={adClient}
            data-ad-format="auto"
            data-ad-slot={slot}
            data-full-width-responsive="true"
          />
        ) : (
          <span className="text-sm font-medium text-muted">Bloco de anuncio</span>
        )}
      </div>}
    </aside>
  );
}
