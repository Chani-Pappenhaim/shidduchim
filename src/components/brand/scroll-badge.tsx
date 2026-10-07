import { cn } from "@/lib/cn";

// Round lime sticker whose ring of text turns as the page scrolls
export function ScrollBadge({ text, className }: { text: string; className?: string }) {
  return (
    <span aria-hidden className={cn("relative inline-block size-24 shrink-0 rounded-full border-2 border-ink bg-lime", className)}>
      <svg viewBox="0 0 100 100" className="spin-on-scroll absolute inset-0 size-full">
        <defs>
          <path id="scroll-badge-ring" d="M50,50 m-36,0 a36,36 0 1,1 72,0 a36,36 0 1,1 -72,0" />
        </defs>
        {/* Laid out left to right along the path; the Hebrew still reads right to left within it */}
        <text direction="ltr" className="fill-ink text-[11px] font-medium" textLength="222" lengthAdjust="spacingAndGlyphs">
          <textPath href="#scroll-badge-ring">{text}</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 m-auto flex size-fit gap-0.5">
        <span className="size-4 rounded-full bg-ink" />
        <span className="size-4 rounded-full bg-ink" />
      </span>
    </span>
  );
}
