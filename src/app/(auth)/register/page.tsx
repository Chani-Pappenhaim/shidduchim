import Link from "next/link";
import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = { title: "פתיחת חשבון" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="mb-2 font-display text-7xl">ברוכים הבאים</h1>
      <p className="mb-8 text-muted">חשבון שדכן אישי. המאגר שלך גלוי רק לך.</p>
      <RegisterForm />
      <p className="mt-6 text-sm text-muted">
        כבר יש לך חשבון?{" "}
        <Link href="/login" className="font-medium text-ink underline underline-offset-4">
          כניסה
        </Link>
      </p>
    </>
  );
}
