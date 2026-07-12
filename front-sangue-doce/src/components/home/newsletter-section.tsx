"use client";

import { type SubmitEvent, useState } from "react";

export function NewsletterSection() {
  const [hint, setHint] = useState("Boletim semanal. Cancele quando quiser.");
  const [hintState, setHintState] = useState<"default" | "ok" | "err">(
    "default",
  );

  function submitNewsletter(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!valid) {
      setHint("Digite um e-mail valido para continuar.");
      setHintState("err");
      return;
    }

    setHint("Pronto! Voce vai receber o proximo boletim.");
    setHintState("ok");
    form.reset();
  }

  return (
    <section className="py-[clamp(70px,9vw,120px)]" id="news">
      <div className="wrap" id="rotina">
        <div className="relative grid gap-[clamp(30px,5vw,60px)] overflow-hidden rounded-[12px] bg-navy p-[clamp(38px,6vw,72px)] text-white before:absolute before:right-[-80px] before:top-[-80px] before:h-[340px] before:w-[340px] before:rounded-full before:bg-[radial-gradient(circle_at_center,#18C0E4_0%,transparent_70%)] before:opacity-30 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10">
            <span className="eyebrow text-white/75 before:bg-spark">
              Boletim semanal
            </span>
            <h2 className="mt-3 text-balance font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] font-normal leading-[1.04] tracking-[-0.015em]">
              Uma dose de <em className="italic text-energy">cuidado</em> na sua
              caixa de entrada
            </h2>
            <p className="mt-4 max-w-[44ch] text-[1.05rem] text-white/85">
              Toda semana, uma selecao curta: uma materia que importa, um guia
              pratico e uma ideia para a rotina. Sem alarmismo, sem ruido.
            </p>
          </div>

          <form
            className="relative z-10"
            onSubmit={submitNewsletter}
            noValidate
          >
            <label
              className="mb-2.5 block text-[13px] font-semibold tracking-wide text-white/80"
              htmlFor="email"
            >
              Seu melhor e-mail
            </label>
            <div className="flex flex-wrap gap-2.5">
              <input
                className="min-w-[200px] flex-1 rounded-lg border border-white/30 bg-white/10 px-[18px] py-[15px] text-base text-white outline-none transition placeholder:text-white/65 focus:border-spark focus:bg-white/15"
                id="email"
                name="email"
                type="email"
                placeholder="voce@exemplo.com"
                autoComplete="email"
                onChange={() => {
                  if (hintState === "err") {
                    setHint("Boletim semanal. Cancele quando quiser.");
                    setHintState("default");
                  }
                }}
              />
              <button
                className="btn bg-energy px-6 py-[15px] text-white hover:-translate-y-px hover:bg-azure"
                type="submit"
              >
                Assinar
              </button>
            </div>
            <p
              className={`mt-3 min-h-[18px] text-[13px] ${
                hintState === "ok" ? "font-semibold text-spark" : ""
              } ${hintState === "err" ? "font-semibold text-[#ffcfab]" : "text-white/70"}`}
            >
              {hint}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
