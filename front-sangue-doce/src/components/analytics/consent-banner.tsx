"use client";

import { useEffect, useState } from "react";

const CONSENT_KEY = "sangue-doce-analytics-consent";

export function ConsentBanner() {
  // O mesmo estado inicial precisa ser renderizado no servidor e no cliente.
  // A leitura do localStorage acontece somente depois da hidratação.
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!localStorage.getItem(CONSENT_KEY));
  }, []);

  if (!visible) return null;

  function choose(value: "accepted" | "rejected") {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    window.dispatchEvent(new CustomEvent("analytics-consent", { detail: value }));
  }

  return (
    <aside role="dialog" aria-label="Preferências de privacidade" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-lg border bg-white p-4 shadow-lg">
      <p className="text-sm text-slate-700">Usamos cookies de análise para entender a navegação e melhorar o Sangue Doce. Você pode aceitar ou recusar.</p>
      <div className="mt-3 flex gap-2">
        <button type="button" onClick={() => choose("accepted")} className="rounded bg-[#2f5d3c] px-4 py-2 text-sm font-medium text-white">Aceitar</button>
        <button type="button" onClick={() => choose("rejected")} className="rounded border px-4 py-2 text-sm font-medium">Recusar</button>
      </div>
    </aside>
  );
}
