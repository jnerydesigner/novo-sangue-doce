export function HostingerAd() {
  return (
    <a
      className="group relative flex min-h-[210px] flex-col overflow-hidden bg-[#1d1347] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-[#d8cfff] sm:flex-row sm:items-stretch"
      href="https://www.hostinger.com/br/cart?product=vps%3Avps_kvm_2&period=24&referral_type=cart_link&REFERRALCODE=JANDERNERY&referral_id=01a2084f-0ec6-7242-a8d3-1725e08b7942"
      target="_blank"
      rel="sponsored noopener noreferrer"
    >
      <span aria-hidden="true" className="hostinger-ad-art relative flex h-36 shrink-0 items-center justify-center overflow-hidden sm:h-auto sm:w-[220px]">
        <span className="affiliate-ad-orbit absolute h-36 w-36 rounded-full border border-[#b9a8ff]/40" />
        <svg className="affiliate-ad-product relative h-28 w-36" viewBox="0 0 160 120" fill="none">
          <rect x="25" y="13" width="110" height="94" rx="12" fill="#32216c" stroke="#aa9aff" strokeWidth="2" />
          <rect x="37" y="25" width="86" height="21" rx="5" fill="#6145cb" />
          <rect x="37" y="50" width="86" height="21" rx="5" fill="#6145cb" />
          <rect x="37" y="75" width="86" height="21" rx="5" fill="#6145cb" />
          <path d="M49 35h35M49 60h35M49 85h35" stroke="#ddd5ff" strokeWidth="3" strokeLinecap="round" />
          <circle cx="110" cy="35" r="3" fill="#abf4d0" />
          <circle cx="110" cy="60" r="3" fill="#abf4d0" />
          <circle cx="110" cy="85" r="3" fill="#abf4d0" />
        </svg>
      </span>
      <span className="relative flex flex-1 flex-col justify-center px-6 pb-6 sm:py-6 sm:pr-8">
        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.14em] text-[#cfc4ff]">Hostinger · VPS KVM 2</span>
        <span className="block font-serif text-[clamp(1.4rem,3vw,2rem)] leading-tight">Seu próximo projeto tem espaço para crescer</span>
        <span className="mt-2 block text-sm leading-relaxed text-white/85">Conheça o plano VPS KVM 2 e confira os recursos e as condições na Hostinger.</span>
        <span className="mt-4 inline-flex min-h-11 items-center self-start rounded-md bg-[#d9d0ff] px-5 text-sm font-bold text-[#26145c] transition-colors group-hover:bg-white">
          Ver plano <span aria-hidden="true" className="ml-2">↗</span>
        </span>
        <span className="mt-3 block text-xs text-white/70">Link de afiliado: podemos receber uma comissão pela contratação.</span>
      </span>
    </a>
  );
}
