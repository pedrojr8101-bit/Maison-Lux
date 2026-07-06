import { ButtonHTMLAttributes } from "react";
import { clsx } from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "danger";
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  isLoading,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 text-sm tracking-luxe uppercase px-6 py-3 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "bg-gold text-offwhite hover:bg-gold-dark",
    outline: "border border-charcoal text-charcoal hover:bg-charcoal hover:text-offwhite",
    ghost: "text-charcoal hover:text-gold",
    danger: "bg-red-800 text-offwhite hover:bg-red-900",
  };

  return (
    <button
      className={clsx(base, variants[variant], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? "Aguarde..." : children}
    </button>
  );
}
