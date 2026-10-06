import type { Metadata } from "next";
// Self-hosted fonts, so builds and pages never depend on reaching Google Fonts
import "@fontsource/karantina/hebrew-400.css";
import "@fontsource/karantina/hebrew-700.css";
import "@fontsource/karantina/latin-400.css";
import "@fontsource/karantina/latin-700.css";
import "@fontsource-variable/rubik/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "שדכונס", template: "%s · שדכונס" },
  description: "לוח העבודה של השדכן: כרטיסי מועמדים, הצעות, פגישות ותזכורות במקום אחד.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
