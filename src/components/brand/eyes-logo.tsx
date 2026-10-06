"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";

const MAX_OFFSET = 0.28;

// Two circles - a pair - whose pupils follow the pointer
export function EyesLogo({ size = 40, className }: { size?: number; className?: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const pupils = Array.from(root.querySelectorAll<HTMLElement>("[data-pupil]"));

    function follow(event: PointerEvent) {
      for (const pupil of pupils) {
        const eye = pupil.parentElement!.getBoundingClientRect();
        const dx = event.clientX - (eye.left + eye.width / 2);
        const dy = event.clientY - (eye.top + eye.height / 2);
        const angle = Math.atan2(dy, dx);
        const reach = Math.min(1, Math.hypot(dx, dy) / 200) * eye.width * MAX_OFFSET;
        pupil.style.transform = `translate(${Math.cos(angle) * reach}px, ${Math.sin(angle) * reach}px)`;
      }
    }

    window.addEventListener("pointermove", follow);
    return () => window.removeEventListener("pointermove", follow);
  }, []);

  return (
    <span ref={rootRef} aria-hidden className={cn("inline-flex", className)} style={{ height: size }}>
      {[0, 1].map((i) => (
        <span
          key={i}
          className="relative flex items-center justify-center rounded-full bg-ink"
          style={{ width: size, height: size, marginInlineStart: i ? -size * 0.12 : 0 }}
        >
          <span data-pupil className="block rounded-full bg-lime transition-transform duration-75" style={{ width: size * 0.36, height: size * 0.36 }} />
        </span>
      ))}
    </span>
  );
}
