import Link from "next/link";
import { guides } from "./data";
import { ArrowIcon } from "./icons";

export function GuidesSection() {
  return (
    <section className="border-y border-line bg-subtle py-[clamp(56px,8vw,96px)]" id="guias">
      <div className="wrap">
        <div className="mb-10">
          <span className="eyebrow">Guias rapidos</span>
          <h2 className="mt-3 max-w-[18ch] text-balance font-serif text-[clamp(1.9rem,3.4vw,2.7rem)] font-normal leading-[1.05] tracking-[-0.015em] text-ink">
            Passos simples para os momentos que importam
          </h2>
        </div>
        <div className="grid md:grid-cols-3">
          {guides.map((guide, index) => (
            <article
              key={guide.number}
              className={`border-lineStrong py-6 md:px-8 md:py-2 ${
                index === 0 ? "md:border-l-0 md:pl-0" : "border-t md:border-l md:border-t-0"
              }`}
            >
              <span className={`mb-4 block font-serif text-[3.2rem] leading-none ${guide.color}`}>
                {guide.number}
              </span>
              <h3 className="mb-2 font-serif text-[1.45rem] font-normal tracking-[-0.01em] text-ink">
                {guide.title}
              </h3>
              <p className="mb-4 text-[15.5px] text-inkSoft">{guide.copy}</p>
              <Link
                className="group inline-flex items-center gap-2 text-sm font-semibold text-ink"
                href={guide.href}
              >
                Abrir guia
                <span className="h-[15px] w-[15px] transition group-hover:translate-x-1">
                  <ArrowIcon />
                </span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
