"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/actions/auth";
import { Wordmark } from "@/components/brand/wordmark";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/dashboard", label: "היום שלי" },
  { href: "/candidates", label: "מועמדים" },
  { href: "/introductions", label: "שידוכים" },
  { href: "/successes", label: "הצלחות" },
  { href: "/reminders", label: "תזכורות" },
];

// Top bar that condenses into a floating pill once the page scrolls
export function AppHeader({ name }: { name: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 px-3 pt-3">
      <div
        className={cn(
          "mx-auto flex items-center justify-between gap-4 bg-paper px-4 py-2 transition-all duration-300",
          scrolled ? "max-w-5xl rounded-full border-2 border-ink shadow-pop" : "max-w-7xl border-b-2 border-transparent",
        )}
      >
        <Wordmark href="/dashboard" />
        <nav className={cn("absolute inset-x-3 top-full mt-2 flex-col border-2 border-ink bg-paper p-2 md:static md:mt-0 md:flex md:flex-row md:border-0 md:p-0", open ? "flex" : "hidden")}>
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn("px-3 py-2 text-[15px] font-medium transition-colors", active ? "bg-lime" : "hover:bg-mist")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-1">
          <Link href="/profile" className={cn("hidden px-3 py-2 text-sm hover:bg-mist sm:block", pathname === "/profile" && "bg-lime")}>
            {name}
          </Link>
          <form action={logoutAction}>
            <button className="px-3 py-2 text-sm text-muted hover:text-ink">יציאה</button>
          </form>
          <button
            type="button"
            className="px-3 py-2 text-xl md:hidden"
            aria-label="תפריט"
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            ☰
          </button>
        </div>
      </div>
    </header>
  );
}
