import Image from "next/image";
import type { Article } from "./data";

export function ArticleCard({
  article,
  seq,
  compact = false,
}: {
  article: Article;
  seq: number;
  compact?: boolean;
}) {
  const tagClass =
    article.color === "green"
      ? "bg-[#eaf1e8] text-greenDeep"
      : article.color === "tomato"
        ? "bg-[#f7e9e4] text-tomato"
        : "bg-[#e7eef5] text-blue";

  return (
    <article
      className={`group overflow-hidden rounded-lg border border-line bg-card transition hover:-translate-y-1 hover:border-lineStrong hover:shadow-editorial ${
        compact ? "grid md:grid-cols-[42%_1fr] lg:min-h-[216px]" : ""
      }`}
    >
      <div
        className={`relative bg-paper2 ${compact ? "min-h-[180px] md:h-full" : "aspect-[16/10]"}`}
      >
        <Image
          src={seq === 1 ? article.image : article.imageVertical}
          alt=""
          fill
          className="object-cover"
          sizes={compact ? "420px" : "780px"}
        />
      </div>
      <div className={`flex flex-1 flex-col gap-3 ${compact ? "p-6" : "p-8"}`}>
        <span
          className={`self-start rounded-full px-3 py-1 text-[11.5px] font-bold uppercase tracking-[0.07em] ${tagClass}`}
        >
          {article.tag}
        </span>
        <h3
          className={`text-balance font-serif font-medium leading-[1.12] tracking-normal text-ink transition group-hover:text-greenDeep ${
            compact ? "text-[1.28rem]" : "text-[clamp(1.6rem,2.6vw,2.15rem)]"
          }`}
        >
          {article.title}
        </h3>
        <p className="text-[15.5px] leading-[1.55] text-inkSoft">{article.excerpt}</p>
        <div className="mt-auto text-[13px] text-muted">{article.meta}</div>
      </div>
    </article>
  );
}
