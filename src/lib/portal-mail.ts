import { formatDate } from "./format";
import { renderMail } from "./mail-content";
import { CODE_TTL_MINUTES } from "./portal";

type Mail = { subject: string; text: string; html: string };

// Invitation for a candidate to fill in their own details
export function inviteMail(firstName: string, matchmakerName: string, url: string, expiresAt: Date): Mail {
  const body = renderMail(
    `שלום ${firstName},`,
    [{ title: `${matchmakerName} מזמין/ה אותך לעדכן את הפרטים שלך`, lines: [{ text: "לעדכון הפרטים", href: url }] }],
    { text: `הקישור אישי ובתוקף עד ${formatDate(expiresAt)}. בכניסה יישלח אליך קוד למייל הזה.` },
  );
  return { subject: `${matchmakerName} מבקש/ת לעדכן את הפרטים שלך`, ...body };
}

export function codeMail(firstName: string, code: string): Mail {
  const body = renderMail(`שלום ${firstName},`, [{ title: "קוד הכניסה שלך", lines: [{ text: code }] }], {
    text: `הקוד בתוקף ${CODE_TTL_MINUTES} דקות. אם לא ביקשת אותו, אפשר להתעלם מההודעה.`,
  });
  return { subject: `קוד כניסה: ${code}`, ...body };
}
