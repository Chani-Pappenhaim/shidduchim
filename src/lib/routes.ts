import type { Side } from "@/generated/prisma/enums";
import { SIDE_LABELS } from "./candidates";

// Central place for app URLs that are built in more than one spot
export const routes = {
  candidates: (side: Side) => `/candidates?side=${SIDE_LABELS[side].slug}`,
  newCandidate: (side: Side) => `/candidates/new?side=${SIDE_LABELS[side].slug}`,
  candidate: (id: string) => `/candidates/${id}`,
  editCandidate: (id: string) => `/candidates/${id}/edit`,
  file: (id: string) => `/api/files/${id}`,
};
