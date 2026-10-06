import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "lime" | "teal" | "coral" | "sky" | "sand" | "mist" | "ink";

const tones: Record<Tone, string> = {
  lime: "bg-lime text-ink",
  teal: "bg-teal text-ink",
  coral: "bg-coral text-ink",
  sky: "bg-sky text-ink",
  sand: "bg-sand text-ink",
  mist: "bg-mist text-ink-soft",
  ink: "bg-ink text-paper",
};

export function Badge({ tone = "mist", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium", tones[tone], className)}>{children}</span>;
}
