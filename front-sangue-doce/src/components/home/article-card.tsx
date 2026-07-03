import Image from "next/image";
import Link from "next/link";
import type { ArticleSummary } from "@/lib/posts";

export function ArticleCard({
  article,
  seq,
  compact = false,
}: {
  article: ArticleSummary;
  seq: number;
  compact?: boolean;
}) {
  const tagClass =
    article.color === "green"
      ? "bg-azure10 text-navy"
      : article.color === "tomato"
        ? "bg-energy10 text-energy"
        : "bg-spark10 text-[#0A8CAA]";

  return (
    <Link
      href={`/materias/${article.slug}`}
      className={`group overflow-hidden rounded-lg border border-line bg-surface transition hover:-translate-y-1 hover:border-azure hover:shadow-editorial ${
        compact ? "grid md:grid-cols-[42%_1fr] lg:min-h-[216px]" : ""
      }`}
    >
      <div
        className={`relative bg-subtle ${compact ? "min-h-[180px] md:h-full" : "aspect-[16/10]"}`}
      >
        <Image
          src={seq === 1 ? article.image : article.imageVertical}
          alt={article.title}
          width={780}
          height={488}
          className="h-full w-full object-cover"
          loading="lazy"
          sizes={compact ? "420px" : "780px"}
          title={article.title}
        />
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-6" : "p-8"}`}>
        <span
          className={`self-start rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.07em] ${tagClass}`}
        >
          {article.tag}
        </span>
        <h3
          className={`text-balance font-serif font-normal leading-[1.12] tracking-[-0.015em] text-ink transition group-hover:text-navy ${
            compact ? "text-[1.28rem]" : "text-[clamp(1.6rem,2.6vw,2.15rem)]"
          }`}
        >
          {article.title}
        </h3>
        <p className="text-[15.5px] leading-[1.55] text-inkSoft">{article.excerpt}</p>
        <div className="mt-auto text-[13px] text-muted">{article.meta}</div>
      </div>
    </Link>
  );
}
