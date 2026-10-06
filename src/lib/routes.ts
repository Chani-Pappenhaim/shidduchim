import type { Side } from "@/generated/prisma/enums";
import { SIDE_LABELS } from "./candidates";

// Appends the non-empty params to a path, e.g. for filters and paging links
export function withQuery(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== "") query.set(key, String(value));
  const search = query.toString();
  return search ? `${path}?${search}` : path;
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
  file: (id: string) => `/api/files/${id}`,
};
