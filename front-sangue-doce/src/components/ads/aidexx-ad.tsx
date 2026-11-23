export function AidexxAd() {
  return (
        <a
          className="affiliate-ad group relative flex min-h-[210px] flex-col overflow-hidden bg-[#102c4f] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#ffbf7b] sm:flex-row sm:items-stretch"
          href="https://bit.ly/3UPnIof"
          target="_blank"
          rel="sponsored noopener noreferrer"
        >
          <span aria-hidden="true" className="affiliate-ad-art relative flex h-36 shrink-0 items-center justify-center overflow-hidden sm:h-auto sm:w-[220px]">
            <span className="affiliate-ad-orbit absolute h-36 w-36 rounded-full border border-[#91e2d2]/40" />
            <span className="absolute h-24 w-24 rounded-full bg-[#a0e0c7]/20 blur-2xl" />
            <svg className="affiliate-ad-product relative h-32 w-40" viewBox="0 0 180 140" fill="none">
              <ellipse cx="92" cy="124" rx="67" ry="8" fill="#061c35" opacity=".35" />
              <path d="M53 74 60 25C62 11 73 6 91 6s29 5 31 19l7 49H53Z" fill="#a6d9b4" />
              <path d="M62 25C64 14 73 9 90 9c-13 9-15 41-15 65H55l7-49Z" fill="#d1f1d6" opacity=".55" />
              <path d="M50 72h82v38c0 8-8 13-41 13s-41-5-41-13V72Z" fill="#bce5c8" />
              <path d="M50 72c0-5 18-8 41-8s41 3 41 8-18 8-41 8-41-3-41-8Z" fill="#92cba2" />
              <path d="M58 87v23m9-22v25m9-24v25m30-25v25m9-26v25m9-27v24" stroke="#83bf98" strokeWidth="3" strokeLinecap="round" />
              <circle cx="47" cy="105" r="25" fill="#f7faf7" stroke="#d2e5dc" strokeWidth="3" />
              <circle cx="47" cy="105" r="6" fill="#c3d1cb" />
              <path d="M45 102h4v6h-4z" fill="#eef5f1" />
            </svg>
          </span>
          <span className="relative flex flex-1 flex-col justify-center px-6 pb-6 sm:py-6 sm:pr-8">
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#9edbf0]">Uma dica do Sangue Doce</span>
            <span className="block font-serif text-[clamp(1.4rem,3vw,2rem)] leading-tight">Conheça o sensor de glicose AidexX</span>
            <span className="mt-2 block text-sm leading-relaxed text-white/85">Confira o produto e as informações de compatibilidade na AliExpress.</span>
            <span className="mt-4 inline-flex min-h-11 items-center self-start rounded-md bg-[#f58226] px-5 text-sm font-bold text-[#102c4f] transition-colors group-hover:bg-[#ffa85d]">
              Ver produto <span aria-hidden="true" className="ml-2">↗</span>
            </span>
            <span className="mt-3 block text-xs text-white/70">Link de afiliado: podemos receber uma comissão pela compra.</span>
          </span>
        </a>
  );
}
