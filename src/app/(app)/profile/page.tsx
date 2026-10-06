import type { Metadata } from "next";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { requireMatchmakerId } from "@/server/auth/session";
import { getMatchmakerProfile } from "@/server/services/matchmaker-service";

export const metadata: Metadata = { title: "הפרופיל שלי" };

export default async function ProfilePage() {
  const profile = await getMatchmakerProfile(await requireMatchmakerId());
  return (
    <>
      <PageHeader title="הפרופיל שלי" subtitle={profile.email} />
      <Section title="פרטים אישיים">
        <ProfileForm profile={profile} />
      </Section>
    </>
  );
}
