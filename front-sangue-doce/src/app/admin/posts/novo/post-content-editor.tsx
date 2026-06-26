"use client";

import { useMemo, useState } from "react";
import type { PostContentBlock } from "@/lib/api";

type EditableBlock = PostContentBlock & {
  key: string;
};

const makeKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const initialBlocks: EditableBlock[] = [
  {
    key: "initial-content-block",
    type: "paragraph",
    content: "",
  },
];

function toEditableBlock(block: PostContentBlock, index: number): EditableBlock {
  return {
    ...block,
    key: `initial-content-block-${index}`,
  } as EditableBlock;
}

function toPostBlock(block: EditableBlock): PostContentBlock {
  const { key: _key, ...postBlock } = block;

  return postBlock;
}

function getBlockLabel(block: EditableBlock) {
  if (block.type === "heading") {
    return `H${block.level}`;
  }

  if (block.type === "paragraph") {
    return "P";
  }

  if (block.type === "quote") {
    return "\"";
  }

  if (block.type === "list") {
    return "UL";
  }

  if (block.type === "image") {
    return "IMG";
  }

  return "BOX";
}

function createBlock(type: EditableBlock["type"]): PostContentBlock {
  if (type === "heading") {
    return { type: "heading", level: 2, content: "" };
  }

  if (type === "quote") {
    return { type: "quote", content: "" };
  }

  if (type === "list") {
    return { type: "list", items: [""] };
  }

  if (type === "image") {
    return { type: "image", src: "", alt: "", caption: "" };
  }

  if (type === "callout") {
    return { type: "callout", title: "", content: "" };
  }

  return { type: "paragraph", content: "" };
}

const blockOptions = [
  {
    label: "P",
    title: "Paragrafo",
    block: { type: "paragraph", content: "" },
  },
  {
    label: "H2",
    title: "Titulo H2",
    block: { type: "heading", level: 2, content: "" },
  },
  {
    label: "H3",
    title: "Titulo H3",
    block: { type: "heading", level: 3, content: "" },
  },
  {
    label: "\"",
    title: "Citacao",
    block: { type: "quote", content: "" },
  },
  {
    label: "UL",
    title: "Lista",
    block: { type: "list", items: [""] },
  },
  {
    label: "IMG",
    title: "Imagem",
    block: { type: "image", src: "", alt: "", caption: "" },
  },
  {
    label: "BOX",
    title: "Destaque",
    block: { type: "callout", title: "", content: "" },
  },
] satisfies Array<{
  label: string;
  title: string;
  block: PostContentBlock;
}>;

export function PostContentEditor({
  initialContent,
}: {
  initialContent?: PostContentBlock[];
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(
    Array.isArray(initialContent) && initialContent.length
      ? initialContent.map(toEditableBlock)
      : initialBlocks,
  );

  const serializedContent = useMemo(
    () => JSON.stringify(blocks.map(toPostBlock)),
    [blocks],
  );

  function addBlock(block: PostContentBlock) {
    setBlocks((current) => [...current, { ...block, key: makeKey() }]);
  }

  function insertBlockAfter(index: number, block: PostContentBlock) {
    setBlocks((current) => {
      const next = [...current];
      next.splice(index + 1, 0, { ...block, key: makeKey() } as EditableBlock);

      return next;
    });
  }

  function updateBlock(key: string, nextBlock: Partial<EditableBlock>) {
    setBlocks((current) =>
      current.map((block) =>
        block.key === key ? ({ ...block, ...nextBlock } as EditableBlock) : block,
      ),
    );
  }

  function removeBlock(key: string) {
    setBlocks((current) =>
      current.length === 1 ? current : current.filter((block) => block.key !== key),
    );
  }

  function moveBlock(key: string, direction: -1 | 1) {
    setBlocks((current) => {
      const index = current.findIndex((block) => block.key === key);
      const targetIndex = index + direction;

      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [block] = next.splice(index, 1);
      next.splice(targetIndex, 0, block);

      return next;
    });
  }

  return (
    <div className="md:col-span-2">
      <input name="conteudo" type="hidden" value={serializedContent} />

      <div className="rounded-lg border border-line bg-paper">
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-card px-3 py-2">
          {blockOptions.map((option) => (
            <button
              className="h-9 min-w-9 rounded-md border border-lineStrong px-2 font-serif text-sm font-bold text-ink transition hover:bg-paper2"
              key={option.title}
              onClick={() => addBlock(option.block)}
              title={`${option.title} no final`}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="grid gap-3 p-3">
          {blocks.map((block, index) => (
            <div className="grid gap-3" key={block.key}>
              <article className="grid gap-3 rounded-lg border border-line bg-card p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="grid h-8 min-w-8 place-items-center rounded-md bg-paper2 px-2 font-serif text-sm font-bold text-greenDeep">
                    {getBlockLabel(block)}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      className="grid h-8 w-8 place-items-center rounded-md border border-lineStrong text-sm font-bold text-inkSoft transition hover:bg-paper2 disabled:opacity-35"
                      disabled={index === 0}
                      onClick={() => moveBlock(block.key, -1)}
                      title="Subir"
                      type="button"
                    >
                      ^
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-md border border-lineStrong text-sm font-bold text-inkSoft transition hover:bg-paper2 disabled:opacity-35"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(block.key, 1)}
                      title="Descer"
                      type="button"
                    >
                      v
                    </button>
                    <button
                      className="grid h-8 w-8 place-items-center rounded-md border border-lineStrong text-sm font-bold text-tomato transition hover:bg-paper2 disabled:opacity-35"
                      disabled={blocks.length === 1}
                      onClick={() => removeBlock(block.key)}
                      title="Remover"
                      type="button"
                    >
                      x
                    </button>
                  </div>
                </div>

                <BlockFields block={block} updateBlock={updateBlock} />
              </article>

              <BlockConnector
                insertBlock={(nextBlock) => insertBlockAfter(index, nextBlock)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockConnector({
  insertBlock,
}: {
  insertBlock: (block: PostContentBlock) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative flex justify-center">
      <div className="absolute left-0 right-0 top-1/2 h-px bg-line" />
      <button
        aria-expanded={open}
        aria-haspopup="menu"
        className="relative z-10 grid h-8 w-8 place-items-center rounded-full border border-lineStrong bg-card text-lg font-bold leading-none text-greenDeep shadow-sm transition hover:-translate-y-px hover:bg-paper2"
        onClick={() => setOpen((current) => !current)}
        title="Inserir bloco abaixo"
        type="button"
      >
        +
      </button>

      {open ? (
        <div
          className="absolute top-10 z-20 flex flex-wrap justify-center gap-1 rounded-lg border border-line bg-card p-2 shadow-editorial"
          role="menu"
        >
          {blockOptions.map((option) => (
            <button
              className="h-9 min-w-9 rounded-md border border-lineStrong px-2 font-serif text-sm font-bold text-ink transition hover:bg-paper2"
              key={option.title}
              onClick={() => {
                insertBlock(option.block);
                setOpen(false);
              }}
              title={option.title}
              type="button"
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function BlockFields({
  block,
  updateBlock,
}: {
  block: EditableBlock;
  updateBlock: (key: string, nextBlock: Partial<EditableBlock>) => void;
}) {
  const fieldClassName =
    "w-full rounded-lg border border-line bg-paper px-4 py-3 text-base font-medium text-ink outline-none transition focus:border-green";

  if (block.type === "image") {
    return (
      <div className="grid gap-2">
        <input
          className={fieldClassName}
          onChange={(event) => updateBlock(block.key, { src: event.target.value })}
          placeholder="URL"
          type="url"
          value={block.src}
        />
        <input
          className={fieldClassName}
          onChange={(event) => updateBlock(block.key, { alt: event.target.value })}
          placeholder="Alt"
          type="text"
          value={block.alt ?? ""}
        />
        <input
          className={fieldClassName}
          onChange={(event) => updateBlock(block.key, { caption: event.target.value })}
          placeholder="Legenda"
          type="text"
          value={block.caption ?? ""}
        />
      </div>
    );
  }

  if (block.type === "list") {
    return (
      <textarea
        className={`${fieldClassName} min-h-28 resize-y`}
        onChange={(event) =>
          updateBlock(block.key, {
            items: event.target.value.split("\n"),
          })
        }
        placeholder="Um item por linha"
        value={block.items.join("\n")}
      />
    );
  }

  if (block.type === "callout") {
    return (
      <div className="grid gap-2">
        <input
          className={fieldClassName}
          onChange={(event) => updateBlock(block.key, { title: event.target.value })}
          placeholder="Titulo"
          type="text"
          value={block.title}
        />
        <textarea
          className={`${fieldClassName} min-h-28 resize-y`}
          onChange={(event) => updateBlock(block.key, { content: event.target.value })}
          placeholder="Conteudo"
          value={block.content}
        />
      </div>
    );
  }

  return (
    <textarea
      className={`${fieldClassName} min-h-28 resize-y ${
        block.type === "quote" ? "font-serif italic" : ""
      }`}
      onChange={(event) => updateBlock(block.key, { content: event.target.value })}
      placeholder="Conteudo"
      value={block.content}
    />
  );
}
