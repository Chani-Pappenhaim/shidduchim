import type { Metadata } from "next";
import { MailConnectionPanel } from "@/components/profile/mail-connection-panel";
import { ProfileForm } from "@/components/profile/profile-form";
import { PageHeader } from "@/components/ui/page-header";
import { Section } from "@/components/ui/section";
import { requireMatchmakerId } from "@/server/auth/session";
import { isGoogleConfigured } from "@/server/mail/google";
import { getMatchmakerProfile } from "@/server/services/matchmaker-service";

export const metadata: Metadata = { title: "הפרופיל שלי" };

export default async function ProfilePage({ searchParams }: { searchParams: Promise<{ mail?: string }> }) {
  const { mail } = await searchParams;
  const profile = await getMatchmakerProfile(await requireMatchmakerId());
  return (
    <>
      <PageHeader title="הפרופיל שלי" subtitle={profile.email} />
      <div className="flex flex-col gap-12">
        <Section title="פרטים אישיים">
          <ProfileForm profile={profile} />
        </Section>
        <Section title="שליחת מיילים">
          <MailConnectionPanel connectedEmail={profile.mailConnection?.email ?? null} available={isGoogleConfigured()} result={mail} />
        </Section>
      </div>
    </>
  );
}
