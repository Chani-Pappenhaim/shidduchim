import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/page-header";

export const metadata: Metadata = { title: "היום שלי" };

export default function DashboardPage() {
  return <PageHeader title="היום שלי" />;
}
