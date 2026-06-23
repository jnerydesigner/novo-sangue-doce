import Image from "next/image";
import type { PostContentBlock } from "@/lib/api";

type PostContentBlocksProps = {
  blocks: PostContentBlock[];
};

export function PostContentBlocks({ blocks }: PostContentBlocksProps) {
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === "heading" && block.level === 2) {
          return (
            <h2
              key={`${block.type}-${index}`}
              className="mb-4 mt-12 font-serif text-[clamp(1.6rem,2.6vw,2.05rem)] font-medium leading-[1.15] tracking-normal text-ink"
            >
              {block.content}
            </h2>
          );
        }

        if (block.type === "heading" && block.level === 3) {
          return (
            <h3
              key={`${block.type}-${index}`}
              className="mb-3 mt-9 font-serif text-[1.32rem] font-semibold text-ink"
            >
              {block.content}
            </h3>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={`${block.type}-${index}`}
              className="my-11 border-l-[3px] border-tomato py-1 pl-7 font-serif text-[clamp(1.5rem,2.8vw,2rem)] font-medium italic leading-[1.3] text-ink"
            >
              &quot;{block.content}&quot;
            </blockquote>
          );
        }

        if (block.type === "list") {
          return (
            <ul
              key={`${block.type}-${index}`}
              className="mb-7 grid list-none gap-3 p-0"
            >
              {block.items
                .filter((item) => item.trim().length > 0)
                .map((item, itemIndex) => (
                  <li
                    key={`${item}-${itemIndex}`}
                    className="relative pl-8 before:absolute before:left-1 before:top-[0.72em] before:h-2 before:w-2 before:rounded-full before:bg-green"
                  >
                    {item}
                  </li>
                ))}
            </ul>
          );
        }

        if (block.type === "image") {
          if (!block.src) {
            return null;
          }

          return (
            <figure key={`${block.type}-${index}`} className="my-10">
              <div className="relative aspect-video overflow-hidden rounded-[10px] bg-paper2">
                <Image
                  src={block.src}
                  alt={block.alt ?? ""}
                  width={720}
                  height={405}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  sizes="720px"
                  title={block.alt ?? block.caption ?? "Imagem da materia"}
                />
              </div>
              {block.caption ? (
                <figcaption className="mt-3 text-[13px] text-muted">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        if (block.type === "callout") {
          return (
            <div
              key={`${block.type}-${index}`}
              className="my-10 rounded-[10px] border border-green/25 bg-[#eaf1e8] px-7 py-6 text-[1.02rem]"
            >
              <div className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-greenDeep">
                {block.title}
              </div>
              <p className="m-0 text-inkSoft">{block.content}</p>
            </div>
          );
        }

        if (block.type !== "paragraph" || !block.content.trim()) {
          return null;
        }

        return (
          <p
            key={`${block.type}-${index}`}
            className={`mb-7 text-pretty ${index === 0 ? "first-letter:float-left first-letter:pr-3 first-letter:pt-2 first-letter:font-serif first-letter:text-[4.6rem] first-letter:font-medium first-letter:leading-[0.82] first-letter:text-tomato" : ""}`}
          >
            {block.content}
          </p>
        );
      })}
    </>
  );
}
