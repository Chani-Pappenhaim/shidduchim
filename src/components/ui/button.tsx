import Link from "next/link";
import type { ComponentProps } from "react";
import { buttonStyles, type ButtonSize, type ButtonVariant } from "./button-styles";

type StyleProps = { variant?: ButtonVariant; size?: ButtonSize; arrow?: boolean };

function Arrow() {
  return (
    <span aria-hidden className="transition-transform duration-150 group-hover:-translate-x-1">
      ←
    </span>
  );
}

export function Button({ variant, size, arrow, className, children, ...props }: ComponentProps<"button"> & StyleProps) {
  return (
    <button className={buttonStyles(variant, size, className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </button>
  );
}

export function LinkButton({ variant, size, arrow, className, children, ...props }: ComponentProps<typeof Link> & StyleProps) {
  return (
    <Link className={buttonStyles(variant, size, className)} {...props}>
      {children}
      {arrow && <Arrow />}
    </Link>
  );
}
