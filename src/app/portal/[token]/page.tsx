import type { Metadata } from "next";
import { portalSignOutAction } from "@/actions/portal";
import { PortalCodeForm } from "@/components/portal/portal-code-form";
import { PortalProfileForm } from "@/components/portal/portal-profile-form";
import { SubmitButton } from "@/components/ui/submit-button";
import { getPortalInviteId } from "@/server/auth/portal-session";
import { findActiveInvite, getPortalProfile } from "@/server/services/portal-service";

export const metadata: Metadata = { title: "עדכון פרטים" };

type Props = { params: Promise<{ token: string }> };

function Heading({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <header className="flex flex-col gap-3 border-b-2 border-ink pb-5">
      <h1 className="font-display text-6xl leading-none md:text-7xl">{title}</h1>
      {children && <p className="text-lg">{children}</p>}
    </header>
  );
}

export default async function PortalPage({ params }: Props) {
  const { token } = await params;
  const invite = await findActiveInvite(token);
  if (!invite) {
    return (
      <Heading title="הקישור לא בתוקף">
        אולי עבר זמנו או שנשלח קישור חדש יותר. אפשר לבקש מהשדכן/ית קישור חדש.
      </Heading>
    );
  }

  const signedIn = (await getPortalInviteId()) === invite.id;
  const profile = signedIn ? await getPortalProfile(invite.id) : null;

  if (!profile) {
    return (
      <>
        <Heading title={`שלום ${invite.firstName}`}>
          {invite.matchmakerName} מזמין/ה אותך לעדכן את הפרטים שלך. רק את/ה ו{invite.matchmakerName} רואים אותם.
        </Heading>
        <div className="bg-lime p-6">
          <PortalCodeForm token={token} emailHint={invite.emailHint} />
        </div>
      </>
    );
  }

  return (
    <>
      <Heading title={`הפרטים של ${profile.firstName}`}>אפשר לעדכן כל שדה ולשמור. הפרטים יגיעו ישירות ל{invite.matchmakerName}.</Heading>
      <PortalProfileForm profile={profile} />
      <form action={portalSignOutAction.bind(null, token)} className="border-t-2 border-ink pt-6">
        <SubmitButton variant="ghost" size="sm" pendingLabel="יוצא…">
          יציאה
        </SubmitButton>
      </form>
    </>
  );
}
