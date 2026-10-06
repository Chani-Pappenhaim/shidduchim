"use client";

import { useEffect, useState } from "react";

const TYPE_MS = 55;
const HOLD_MS = 2200;

// Types out each phrase in turn, followed by a blinking cursor
export function Typewriter({ phrases, className }: { phrases: string[]; className?: string }) {
  const [index, setIndex] = useState(0);
  const [length, setLength] = useState(0);
  const phrase = phrases[index];

  useEffect(() => {
    const done = length >= phrase.length;
    const timer = setTimeout(
      () => {
        if (!done) return setLength(length + 1);
        setIndex((index + 1) % phrases.length);
        setLength(0);
      },
      done ? HOLD_MS : TYPE_MS,
    );
    return () => clearTimeout(timer);
  }, [length, phrase, index, phrases.length]);

  return (
    <span className={className} aria-label={phrase}>
      <span aria-hidden>{phrase.slice(0, length)}</span>
      <span aria-hidden className="animate-blink">_</span>
    </span>
  );
}
