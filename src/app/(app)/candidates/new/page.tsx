import type { Metadata } from "next";
import { CandidateForm } from "@/components/candidates/candidate-form";
import { PageHeader } from "@/components/ui/page-header";
import { SIDE_LABELS, sideFromSlug } from "@/lib/candidates";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "כרטיס חדש" };

export default async function NewCandidatePage({ searchParams }: { searchParams: Promise<{ side?: string }> }) {
  const side = sideFromSlug((await searchParams).side);
  return (
    <>
      <PageHeader title={SIDE_LABELS[side].new} subtitle="רק שם פרטי ושם משפחה הם חובה, את השאר אפשר להשלים אחר כך" />
      <CandidateForm side={side} cancelHref={routes.candidates(side)} />
    </>
  );
}
