import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "danger" | "ghost" | "primary" | "secondary";
type ButtonSize = "icon" | "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
};

const buttonBaseClass =
  "inline-flex items-center justify-center gap-2 rounded-lg font-bold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azure disabled:cursor-not-allowed disabled:opacity-65";

const buttonVariantClasses: Record<ButtonVariant, string> = {
  danger: "border border-red-300 bg-white text-red-600 hover:border-red-400 hover:bg-red-50",
  ghost: "border border-transparent text-inkSoft hover:bg-paper2 hover:text-ink",
  primary: "border border-transparent bg-green text-white hover:-translate-y-px hover:bg-greenDeep",
  secondary: "border border-line bg-white text-inkSoft hover:-translate-y-px hover:bg-paper2",
};

const buttonSizeClasses: Record<ButtonSize, string> = {
  icon: "h-9 w-9 p-0",
  md: "min-h-12 px-5 py-3 text-sm",
  sm: "min-h-10 px-4 py-2 text-sm",
};

export function Button({
  children,
  className = "",
  size = "md",
  type = "button",
  variant = "secondary",
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      className={`${buttonBaseClass} ${buttonVariantClasses[variant]} ${buttonSizeClasses[size]} ${className}`}
      type={type}
      {...buttonProps}
    >
      {children}
    </button>
  );
}

type IconButtonProps = Omit<ButtonProps, "children" | "size"> & {
  children: ReactNode;
};

export function IconButton({
  children,
  className = "",
  variant = "ghost",
  ...buttonProps
}: IconButtonProps) {
  return (
    <Button
      className={`shrink-0 ${className}`}
      size="icon"
      variant={variant}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
