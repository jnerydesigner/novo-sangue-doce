"use client";

import { type FormEvent, useState } from "react";

export function NewsletterSection() {
  const [hint, setHint] = useState("Boletim semanal. Cancele quando quiser.");
  const [hintState, setHintState] = useState<"default" | "ok" | "err">("default");

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
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
        <div className="relative grid gap-[clamp(30px,5vw,60px)] overflow-hidden rounded-[14px] bg-greenDeep p-[clamp(38px,6vw,72px)] text-paper before:absolute before:right-[-80px] before:top-[-80px] before:h-[340px] before:w-[340px] before:rounded-full before:bg-[radial-gradient(circle_at_center,#80a56f_0%,transparent_70%)] before:opacity-35 lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10">
            <span className="eyebrow text-paper/75 before:bg-[#f5e7c8]">Boletim semanal</span>
            <h2 className="mt-3 text-balance font-serif text-[clamp(1.9rem,3.4vw,2.9rem)] font-medium leading-[1.04] tracking-normal">
              Uma dose de <em className="italic text-[#f5e7c8]">cuidado</em> na sua caixa de entrada
            </h2>
            <p className="mt-4 max-w-[44ch] text-[1.05rem] text-paper/85">
              Toda semana, uma selecao curta: uma materia que importa, um guia pratico e uma ideia
              para a rotina. Sem alarmismo, sem ruido.
            </p>
          </div>

          <form className="relative z-10" onSubmit={submitNewsletter} noValidate>
            <label
              className="mb-2.5 block text-[13px] font-semibold tracking-wide text-paper/80"
              htmlFor="email"
            >
              Seu melhor e-mail
            </label>
            <div className="flex flex-wrap gap-2.5">
              <input
                className="min-w-[200px] flex-1 rounded-lg border border-white/30 bg-white/10 px-[18px] py-[15px] text-base text-paper outline-none transition placeholder:text-paper/55 focus:border-[#f5e7c8] focus:bg-white/15"
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
                className="btn bg-[#f5e7c8] px-6 py-[15px] text-greenDeep hover:-translate-y-px hover:bg-white"
                type="submit"
              >
                Assinar
              </button>
            </div>
            <p
              className={`mt-3 min-h-[18px] text-[13px] ${
                hintState === "ok" ? "font-semibold text-[#d9f0cf]" : ""
              } ${hintState === "err" ? "font-semibold text-[#f6c9bd]" : "text-paper/70"}`}
            >
              {hint}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
