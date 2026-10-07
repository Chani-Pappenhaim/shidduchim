import { describe, expect, it } from "vitest";
import { Side } from "@/generated/prisma/enums";
import { mailtoUrl, proposalDraft } from "./proposal-email";

const now = new Date(2026, 9, 7);

const rachel = {
  side: Side.FEMALE,
  firstName: "רחל",
  lastName: "לוי",
  birthDate: new Date(2003, 0, 1),
  city: "ירושלים",
  community: null,
  occupation: "גננת",
  heightCm: 165,
  parentsInfo: null,
  about: "שמחה ונעימה",
  lookingFor: "",
};

const sender = { name: "חנה כהן", phone: "050-1234567", emailSignature: null };

describe("proposalDraft", () => {
  it("describes the other side with only the filled-in public details", () => {
    const { subject, body } = proposalDraft(rachel, "יוסף", sender, now);
    expect(subject).toBe("הצעת שידוך: רחל לוי");
    expect(body).toContain("שלום יוסף,");
    expect(body).toContain("גיל: 23");
    expect(body).toContain("גובה: 165 ס״מ");
    expect(body).toContain("קצת עליה: שמחה ונעימה");
    expect(body).not.toContain("קהילה");
    expect(body).not.toContain("מה היא מחפשת");
    expect(body.endsWith("חנה כהן\n050-1234567")).toBe(true);
  });

  it("prefers the matchmaker's own signature", () => {
    const { body } = proposalDraft(rachel, "יוסף", { ...sender, emailSignature: "בברכה,\nחנה" }, now);
    expect(body.endsWith("בברכה,\nחנה")).toBe(true);
  });
});

describe("mailtoUrl", () => {
  it("encodes the address, subject and body", () => {
    expect(mailtoUrl({ to: "a@b.com", subject: "הצעה & עוד", body: "שורה\nשנייה" })).toBe(
      "mailto:a%40b.com?subject=%D7%94%D7%A6%D7%A2%D7%94%20%26%20%D7%A2%D7%95%D7%93&body=%D7%A9%D7%95%D7%A8%D7%94%0A%D7%A9%D7%A0%D7%99%D7%99%D7%94",
    );
  });
});
