"use client";

import { useEffect, useState, type FormEvent } from "react";
import { Check, Copy, ExternalLink, Link2 } from "lucide-react";

type ShortLink = { id: string; code: string; url: string; title: string | null; createdAt: string; visits: number; locations?: { country: string; region: string; visits: number }[] };

export function ShortLinksManager() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    fetch("/api/admin/short-links", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Não foi possível carregar os links.");
        setLinks(await response.json());
      })
      .catch(() => setMessage("Não foi possível carregar os links. Tente atualizar a página."))
      .finally(() => { setOrigin(window.location.origin); setLoading(false); });
  }, []);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(""); setSaving(true);
    try {
      const response = await fetch("/api/admin/short-links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ url, title }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message ?? "Não foi possível criar o link.");
      setLinks((current) => [data, ...current]); setUrl(""); setTitle("");
      setMessage("Link criado com sucesso.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar o link."); }
    finally { setSaving(false); }
  }

  async function copy(code: string) {
    try { await navigator.clipboard.writeText(`${origin}/l/${code}`); setCopied(code); }
    catch { setMessage("Não foi possível copiar. Selecione o link para copiá-lo."); }
  }

  return (
    <div className="grid max-w-[1000px] gap-6">
      <section className="rounded-xl border border-line bg-card p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-paper text-navy"><Link2 aria-hidden="true" size={20} /></span>
          <div><h2 className="font-serif text-2xl text-ink">Criar link curto</h2><p className="mt-1 text-sm text-inkSoft">Transforme uma URL longa em um link fácil de compartilhar.</p></div>
        </div>
        <form onSubmit={create} className="mt-6 grid gap-4">
          <label className="grid gap-1.5 text-sm font-semibold text-inkSoft">URL de destino<input className="min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base font-normal text-ink" type="url" required maxLength={4096} placeholder="https://exemplo.com/pagina" value={url} onChange={(event) => setUrl(event.target.value)} /></label>
          <label className="grid gap-1.5 text-sm font-semibold text-inkSoft">Título <span className="font-normal text-muted">Opcional, para identificar o link</span><input className="min-h-11 w-full rounded-lg border border-line bg-paper px-3 text-base font-normal text-ink" maxLength={120} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Ex.: Sensor AidexX" /></label>
          <button className="min-h-11 justify-self-start rounded-lg bg-navy px-5 text-sm font-semibold text-white hover:bg-azure disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Criando…" : "Criar link"}</button>
          {message && <p role="status" className="text-sm text-inkSoft">{message}</p>}
        </form>
      </section>
      <section className="rounded-xl border border-line bg-card p-5 sm:p-7">
        <h2 className="font-serif text-2xl text-ink">Links criados</h2>
        <p className="mt-1 text-sm text-muted">Os 200 links mais recentes. Contagem aproximada por sessão do navegador; prévias automáticas podem ser incluídas.</p>
        {loading ? <p className="mt-6 text-sm text-muted">Carregando links…</p> : links.length === 0 ? <p className="mt-6 text-sm text-muted">Nenhum link criado ainda.</p> : (
          <ul className="mt-5 divide-y divide-line">
            {links.map((link) => <li key={link.id} className="flex flex-wrap items-center gap-4 py-4">
              <div className="min-w-0 flex-1"><p className="font-semibold text-ink">{link.title || "Sem título"}</p><a className="mt-1 block break-all text-sm text-navy underline" href={`/l/${link.code}`} target="_blank" rel="noopener noreferrer">{origin}/l/{link.code}</a><p className="mt-1 break-all text-xs text-muted">Destino: {link.url}</p></div>
              <span className="text-sm font-semibold text-inkSoft">{link.visits.toLocaleString("pt-BR")} {link.visits === 1 ? "acesso" : "acessos"}</span>
              {link.locations && link.locations.length > 0 && <details className="basis-full text-sm text-inkSoft"><summary className="cursor-pointer font-semibold">Acessos por localização</summary><ul className="mt-2 grid gap-1">{link.locations.map((location) => <li key={`${location.country}:${location.region}`}>{location.country || "Não identificado"}{location.region ? ` · ${location.region}` : ""}: {location.visits.toLocaleString("pt-BR")}</li>)}</ul></details>}
              <a aria-label={`Abrir ${link.title || "link"}`} href={`/l/${link.code}`} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-lg border border-line text-inkSoft hover:bg-paper"><ExternalLink size={17} /></a>
              <button type="button" onClick={() => void copy(link.code)} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-inkSoft hover:bg-paper">{copied === link.code ? <Check size={16} /> : <Copy size={16} />}{copied === link.code ? "Copiado" : "Copiar"}</button>
            </li>)}
          </ul>
        )}
      </section>
    </div>
  );
}
