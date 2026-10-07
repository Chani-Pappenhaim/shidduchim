import type { Side } from "@/generated/prisma/enums";
import type { ProposalRecipient } from "./proposal-email";
import { SIDE_LABELS } from "./candidates";

// Appends the non-empty params to a path, e.g. for filters and paging links
export function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") query.set(key, String(value));
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

const PLACEHOLDER_ORIGIN = "http://same.origin";

// Accepts only a path on this site; anything a browser could resolve to another host falls back
export function safeRedirectPath(value: unknown, fallback: string): string {
  if (typeof value !== "string") return fallback;
  try {
    // Checked decoded too, since an encoded "\" or tab can be decoded again on the way
    const decoded = decodeURIComponent(value);
    const looksExternal = (path: string) => !path.startsWith("/") || path.startsWith("//") || /[\\\s]/.test(path);
    if (looksExternal(value) || looksExternal(decoded)) return fallback;
    const url = new URL(value, PLACEHOLDER_ORIGIN);
    return url.origin === PLACEHOLDER_ORIGIN ? `${url.pathname}${url.search}` : fallback;
  } catch {
    return fallback;
  }
}

// Central place for app URLs that are built in more than one spot
export const routes = {
  candidates: (side: Side) => `/candidates?side=${SIDE_LABELS[side].slug}`,
  newCandidate: (side: Side) => `/candidates/new?side=${SIDE_LABELS[side].slug}`,
  candidate: (id: string) => `/candidates/${id}`,
  editCandidate: (id: string) => `/candidates/${id}/edit`,
  match: (candidateId: string) => `/candidates/${candidateId}/match`,
  introductions: "/introductions",
  introduction: (id: string) => `/introductions/${id}`,
  proposalEmail: (introductionId: string, recipient: ProposalRecipient) => `/introductions/${introductionId}/email?to=${recipient}`,
  engagements: "/engagements",
  engagement: (id: string) => `/engagements/${id}`,
  newEngagement: (candidateId: string) => `/engagements/new?candidateId=${candidateId}`,
  weddings: "/weddings",
  reminders: "/reminders",
  file: (id: string) => `/api/files/${id}`,
  portal: (token: string) => `/portal/${token}`,
};
