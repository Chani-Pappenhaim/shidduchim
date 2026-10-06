import type { Metadata } from "next";
import { Karantina, Rubik } from "next/font/google";
import "./globals.css";

const karantina = Karantina({
  variable: "--font-karantina",
  subsets: ["hebrew", "latin"],
  weight: ["400", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
});

export const metadata: Metadata = {
  title: { default: "שדכונס", template: "%s · שדכונס" },
  description: "לוח העבודה של השדכן: כרטיסי מועמדים, הצעות, פגישות ותזכורות במקום אחד.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl" className={`${karantina.variable} ${rubik.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
