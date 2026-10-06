import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 font-medium transition-[transform,box-shadow,background-color] duration-150 disabled:pointer-events-none disabled:opacity-50 active:translate-y-px";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-ink text-paper hover:shadow-[4px_4px_0_0_var(--color-lime)] hover:-translate-y-0.5",
  secondary: "border-2 border-ink bg-paper text-ink hover:bg-mist",
  accent: "bg-lime text-ink hover:shadow-pop hover:-translate-y-0.5",
  ghost: "text-ink underline-offset-4 hover:underline",
  danger: "border-2 border-danger text-danger hover:bg-danger hover:text-paper",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-base",
  lg: "h-14 px-7 text-lg",
};

// Shared visual style for buttons and button-looking links
export function buttonStyles(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(base, variants[variant], variant !== "ghost" && sizes[size], className);
}
