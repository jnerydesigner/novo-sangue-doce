import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { FormLabel } from "./form-label";

type InputFieldProps = ComponentPropsWithoutRef<"input"> & {
  icon?: LucideIcon;
  label?: string;
  labelSlot?: boolean;
  optionalLabel?: string;
  rightIcon?: ReactNode;
  wrapperClassName?: string;
};

export function InputField({
  className = "",
  icon: Icon,
  label,
  labelSlot = false,
  optionalLabel,
  rightIcon,
  wrapperClassName = "",
  ...inputProps
}: InputFieldProps) {
  const isFileInput = inputProps.type === "file";
  const inputClassName = isFileInput
    ? "h-12 w-full cursor-pointer overflow-hidden rounded-lg border border-line bg-white pr-3 text-[15px] font-semibold text-muted shadow-none outline-none transition file:mr-4 file:h-full file:cursor-pointer file:border-0 file:border-r file:border-line file:bg-paper2 file:px-4 file:text-[14px] file:font-bold file:text-inkSoft hover:file:bg-white focus:border-azure focus:ring-2 focus:ring-azure/15"
    : `h-12 w-full rounded-lg border border-line bg-white px-3 text-[15px] font-semibold text-ink shadow-none outline-none transition placeholder:font-medium placeholder:text-muted focus:border-azure focus:ring-2 focus:ring-azure/15 ${rightIcon ? "pr-10" : ""}`;

  return (
    <label className={`block ${wrapperClassName}`}>
      {label ? (
        <FormLabel icon={Icon} optionalLabel={optionalLabel} text={label} />
      ) : labelSlot ? (
        <span aria-hidden="true" className="block min-h-[20px]" />
      ) : null}

      <span className={label || labelSlot ? "relative mt-2 block" : "relative block"}>
        <input
          className={`${inputClassName} ${className}`}
          {...inputProps}
        />
        {rightIcon ? (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted">
            {rightIcon}
          </span>
        ) : null}
      </span>
    </label>
  );
}
