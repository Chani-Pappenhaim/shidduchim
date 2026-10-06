import { Wordmark } from "@/components/brand/wordmark";
import { Typewriter } from "@/components/brand/typewriter";

const PHRASES = ["כל המועמדים במקום אחד", "מי הוצע למי, במבט אחד", "תזכורות שלא נותנות לשכוח", "עוד זוג. ועוד אחד."];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh md:grid-cols-2">
      <main className="flex flex-col px-6 py-8 md:px-14">
        <Wordmark />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10 animate-rise">{children}</div>
      </main>
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-lime p-14 md:flex">
        <p className="text-sm font-medium">לוח העבודה של השדכן</p>
        <Typewriter phrases={PHRASES} className="font-display text-8xl leading-[0.9]" />
        <div aria-hidden className="absolute -bottom-24 -left-24 size-72 rounded-full bg-ink" />
        <div aria-hidden className="absolute -bottom-10 left-36 size-40 rounded-full border-[3px] border-ink" />
      </aside>
    </div>
  );
}
