export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <a
      href="#top"
      className={`inline-flex items-center gap-[11px] font-serif text-2xl font-medium tracking-normal ${
        dark ? "text-paper" : "text-inherit"
      }`}
    >
      <span className="h-[11px] w-[11px] rounded-full bg-tomato shadow-[0_0_0_4px_rgba(197,86,63,0.22)]" />
      Sangue Doce
    </a>
  );
}
