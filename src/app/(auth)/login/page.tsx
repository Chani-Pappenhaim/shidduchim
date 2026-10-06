import Link from "next/link";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = { title: "כניסה" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  return (
    <>
      <h1 className="mb-2 font-display text-7xl">שלום שוב</h1>
      <p className="mb-8 text-muted">נכנסים ללוח העבודה שלך.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-sm text-muted">
        עוד אין לך חשבון?{" "}
        <Link href="/register" className="font-medium text-ink underline underline-offset-4">
          פתיחת חשבון שדכן
        </Link>
      </p>
    </>
  );
}
