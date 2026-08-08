import { ChevronDown, type LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef } from "react";
import { FormLabel } from "./form-label";

type SelectFieldProps = ComponentPropsWithoutRef<"select"> & {
  icon?: LucideIcon;
  label?: string;
  labelSlot?: boolean;
  optionalLabel?: string;
  wrapperClassName?: string;
};

export function SelectField({
  children,
  className = "",
  icon: Icon,
  label,
  labelSlot = false,
  optionalLabel,
  wrapperClassName = "",
  ...selectProps
}: SelectFieldProps) {
  return (
    <label className={`block ${wrapperClassName}`}>
      {label ? (
        <FormLabel icon={Icon} optionalLabel={optionalLabel} text={label} />
      ) : labelSlot ? (
        <span aria-hidden="true" className="block min-h-[20px]" />
      ) : null}

      <span className={label || labelSlot ? "relative mt-2 block" : "relative block"}>
        <select
          className={`h-12 w-full appearance-none rounded-lg border border-line bg-white px-3 pr-10 text-[15px] font-semibold text-ink shadow-none outline-none transition focus:border-azure focus:ring-2 focus:ring-azure/15 ${className}`}
          {...selectProps}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          strokeWidth={2.2}
        />
      </span>
    </label>
  );
}
