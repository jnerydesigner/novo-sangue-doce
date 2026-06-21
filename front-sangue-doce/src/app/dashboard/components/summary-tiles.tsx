import type { SummaryTile } from "../dashboard.data";
import { ToneDot } from "./tone-dot";

type SummaryTilesProps = {
  tiles: SummaryTile[];
};

export function SummaryTiles({ tiles }: SummaryTilesProps) {
  return (
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <article
          className="rounded-lg border border-line bg-card p-5 shadow-editorial"
          key={tile.label}
        >
          <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted">
            <ToneDot tone={tile.tone} />
            {tile.label}
          </div>
          <strong className="mt-4 block font-serif text-[2.35rem] font-medium leading-none text-ink">
            {tile.value}{" "}
            {tile.unit ? (
              <span className="font-sans text-[0.42em] font-semibold text-muted">{tile.unit}</span>
            ) : null}
          </strong>
          <p className="mt-2 text-sm text-inkSoft">{tile.detail}</p>
        </article>
      ))}
    </div>
  );
}
