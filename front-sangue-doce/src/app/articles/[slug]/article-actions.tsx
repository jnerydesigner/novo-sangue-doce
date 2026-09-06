"use client";

import { useEffect, useState } from "react";

type ArticleActionsProps = {
  title: string;
};

function ShareIcon({ type }: { type: "whatsapp" | "x" | "facebook" | "link" }) {
  if (type === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M17.5 3h3l-6.6 7.6L22 21h-6.2l-4.4-5.8L6.2 21H3.2l7-8.1L2 3h6.3l4 5.3L17.5 3zm-1 16h1.7L7.6 4.8H5.8L16.5 19z" />
      </svg>
    );
  }

  if (type === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
        <path d="M14 9h3l.5-3H14V4.5c0-.8.3-1.5 1.5-1.5H18V.2C17.6.1 16.5 0 15.3 0 12.7 0 11 1.5 11 4.3V6H8v3h3v9h3V9z" />
      </svg>
    );
  }

  if (type === "link") {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
      >
        <path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1" />
        <path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-[18px] w-[18px]" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15l-1.3 4.7 4.8-1.3A10 10 0 1 0 12 2zm0 2a8 8 0 1 1-4.2 14.8l-.3-.2-2.8.7.8-2.7-.2-.3A8 8 0 0 1 12 4zm-3 4c-.2 0-.5 0-.7.4-.3.3-.9.9-.9 2.1s.9 2.4 1 2.6c.1.2 1.7 2.7 4.2 3.7 2.1.8 2.5.7 3 .6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2 0-.1-.2-.2-.5-.3l-1.6-.8c-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1-.6-.2-1.4-.5-2.2-1.3-.6-.5-1-1.2-1.2-1.4-.1-.2 0-.3.1-.4l.4-.5.2-.4v-.4l-.7-1.7c-.2-.5-.4-.4-.5-.4z" />
    </svg>
  );
}

export function ReadingProgress() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const update = () => {
      const page = document.documentElement;
      const maxScroll = page.scrollHeight - page.clientHeight;
      setWidth(maxScroll > 0 ? Math.min(100, Math.max(0, (page.scrollTop / maxScroll) * 100)) : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="fixed left-0 top-0 z-[101] h-[3px] bg-energy" style={{ width: `${width}%` }} />
  );
}

export function ArticleActions({ title }: ArticleActionsProps) {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function openShare(target: "whatsapp" | "x" | "facebook") {
    const encodedUrl = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(title);
    const hrefs = {
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    };

    window.open(hrefs[target], "_blank", "noopener,noreferrer");
  }

  return (
    <div className="sticky top-[110px] flex flex-col items-center gap-3">
      <span className="[writing-mode:vertical-rl] mb-1 text-[11px] uppercase tracking-[0.12em] text-muted">
        Compartilhar
      </span>
      <button
        type="button"
        aria-label="Compartilhar no WhatsApp"
        onClick={() => openShare("whatsapp")}
        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-lineStrong text-inkSoft transition hover:-translate-y-0.5 hover:border-azure hover:bg-azure hover:text-white"
      >
        <ShareIcon type="whatsapp" />
      </button>
      <button
        type="button"
        aria-label="Compartilhar no X"
        onClick={() => openShare("x")}
        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-lineStrong text-inkSoft transition hover:-translate-y-0.5 hover:border-azure hover:bg-azure hover:text-white"
      >
        <ShareIcon type="x" />
      </button>
      <button
        type="button"
        aria-label="Compartilhar no Facebook"
        onClick={() => openShare("facebook")}
        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-lineStrong text-inkSoft transition hover:-translate-y-0.5 hover:border-azure hover:bg-azure hover:text-white"
      >
        <ShareIcon type="facebook" />
      </button>
      <button
        type="button"
        aria-label={copied ? "Link copiado" : "Copiar link"}
        onClick={copyLink}
        className="grid h-[42px] w-[42px] place-items-center rounded-full border border-lineStrong text-inkSoft transition hover:-translate-y-0.5 hover:border-azure hover:bg-azure hover:text-white"
      >
        <ShareIcon type="link" />
      </button>
    </div>
  );
}
