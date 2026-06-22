import Image from "next/image";
import Link from "next/link";

export function Brand({ dark = false }: { dark?: boolean }) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-[11px] font-serif text-2xl font-medium tracking-normal ${
        dark ? "text-paper" : "text-inherit"
      }`}
    >
      <Image
        src="/sangue-doce-logo.png"
        alt=""
        width={44}
        height={44}
        className="h-11 w-11 rounded-lg object-cover"
        priority={!dark}
      />
      <span>Sangue Doce</span>
    </Link>
  );
}
