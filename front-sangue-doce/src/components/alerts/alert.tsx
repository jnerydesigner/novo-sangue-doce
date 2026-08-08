import { AlertProps } from "./alert.type";
import { alertVariants } from "./alertVariants";

export function Alert({ type = "info", title, children }: AlertProps) {
  const variant = alertVariants[type];
  const Icon = variant.icon;

  return (
    <div
      className={`
        flex items-start gap-3
        rounded-lg border
        px-5 py-3
        text-sm
        ${variant.container}
      `}
    >
      <Icon
        size={17}
        strokeWidth={2}
        className={`mt-[1px] shrink-0 ${variant.iconColor}`}
      />

      <div className="min-w-0">
        <div
          className={`
            mb-0.5 font-semibold leading-5
            ${variant.titleColor}
          `}
        >
          {title ?? variant.title}
        </div>

        <div className="leading-5">{children}</div>
      </div>
    </div>
  );
}
