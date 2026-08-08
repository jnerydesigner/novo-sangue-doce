import type { LucideIcon } from "lucide-react";

type FormLabelProps = {
  icon?: LucideIcon;
  optionalLabel?: string;
  text: string;
};

export function FormLabel({ icon: Icon, optionalLabel, text }: FormLabelProps) {
  return (
    <span className="flex min-h-5 items-center gap-2 text-[13px] font-bold text-inkSoft">
      {Icon ? (
        <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-azure" strokeWidth={2.2} />
      ) : null}
      <span>{text}</span>
      {optionalLabel ? <span className="font-semibold text-muted">{optionalLabel}</span> : null}
    </span>
  );
}
