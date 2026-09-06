"use client";

import { useState } from "react";
import { toast } from "sonner";

export function InviteUserButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const close = () => {
    if (!sending) {
      setOpen(false);
      setEmail("");
      setMessage("");
      setError("");
    }
  };

  const sendInvite = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
        const detail = Array.isArray(data?.message) ? data.message.join(" ") : data?.message;
        throw new Error(detail ?? "Não foi possível enviar o convite.");
      }

      toast.success("Convite enviado com sucesso.");
      setOpen(false);
      setEmail("");
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Não foi possível enviar o convite.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button className="btn btn-primary" onClick={() => setOpen(true)} type="button">
        Adicionar usuário
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/45 p-4" role="presentation" onMouseDown={close}>
          <div className="w-full max-w-md rounded-xl border border-line bg-card p-6 shadow-editorial" onMouseDown={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="invite-title">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-ink" id="invite-title">Convidar usuário</h2>
                <p className="mt-1 text-sm text-inkSoft">Enviaremos um link de acesso para este e-mail.</p>
              </div>
              <button className="text-2xl leading-none text-muted" onClick={close} type="button" aria-label="Fechar">×</button>
            </div>

            <form className="mt-6 grid gap-4" onSubmit={sendInvite}>
              <label className="grid gap-2 text-sm font-semibold text-muted" htmlFor="invite-email">
                E-mail
                <input className="w-full rounded-lg border border-lineStrong bg-paper px-4 py-3 text-base text-ink outline-none focus:border-green" id="invite-email" onChange={(event) => setEmail(event.target.value)} placeholder="pessoa@exemplo.com" required type="email" value={email} />
              </label>

              {message ? <p className="rounded-lg border border-green/30 bg-green/10 px-4 py-3 text-sm font-semibold text-greenDeep">{message}</p> : null}
              {error ? <p className="rounded-lg border border-tomato/30 bg-tomato/10 px-4 py-3 text-sm font-semibold text-tomato">{error}</p> : null}

              <div className="grid gap-3">
                <button className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={sending} type="submit">{sending ? "Enviando..." : "Enviar convite"}</button>
                <button className="w-full rounded-lg border border-lineStrong px-4 py-2.5 text-sm font-semibold text-inkSoft" onClick={close} type="button">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
