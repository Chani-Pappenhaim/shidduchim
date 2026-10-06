import { AppHeader } from "@/components/layout/app-header";
import { requireMatchmakerId } from "@/server/auth/session";
import { getMatchmakerProfile } from "@/server/services/matchmaker-service";

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const profile = await getMatchmakerProfile(await requireMatchmakerId());
  return (
    <>
      <AppHeader name={profile.name} />
      <main className="mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8">{children}</main>
    </>
  );
}
