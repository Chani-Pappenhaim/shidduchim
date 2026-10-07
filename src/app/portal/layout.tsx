import type { Metadata } from "next";
import { EyesLogo } from "@/components/brand/eyes-logo";

// Invite links carry a secret token: keep them out of search engines and referrer headers
export const metadata: Metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" };

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh">
      <header className="border-b-2 border-ink">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-6 py-4">
          <EyesLogo size={26} />
          <span className="font-display text-3xl leading-none">שדכונס</span>
        </div>
      </header>
      <main className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10 animate-rise">{children}</main>
    </div>
  );
}
