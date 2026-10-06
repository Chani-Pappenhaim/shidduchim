import Link from "next/link";
import { EyesLogo } from "./eyes-logo";

export function Wordmark({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label="שדכונס - לדף הבית">
      <EyesLogo size={30} />
      <span className="font-display text-4xl leading-none">שדכונס</span>
    </Link>
  );
}
