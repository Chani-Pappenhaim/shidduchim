import { z } from "zod";
import { CODE_LENGTH } from "@/lib/portal";
import { candidateSchema } from "./candidate";

// The details a candidate may fill in about themselves; name, side and status stay with the matchmaker
export const portalProfileSchema = candidateSchema.pick({
  birthDate: true,
  city: true,
  community: true,
  occupation: true,
  heightCm: true,
  phone: true,
  parentsInfo: true,
  about: true,
  lookingFor: true,
});

export const portalCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(new RegExp(`^\\d{${CODE_LENGTH}}$`), `הקוד הוא ${CODE_LENGTH} ספרות`),
});

export type PortalProfileInput = z.infer<typeof portalProfileSchema>;
