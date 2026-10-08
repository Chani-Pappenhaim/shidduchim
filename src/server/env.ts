import "server-only";
import { z } from "zod";

const envSchema = z.object({
  SESSION_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[0-9a-f]{64}$/i, "Must be 64 hex characters"),
  APP_URL: z.url().default("http://localhost:3000"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().default("שדכונס <no-reply@example.com>"),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

// Example values from .env.example must never sign or encrypt anything in production
const productionSchema = envSchema.refine(
  (e) => !e.SESSION_SECRET.startsWith("change-me") && !/^0+$/.test(e.ENCRYPTION_KEY) && !!e.CRON_SECRET,
  "Production needs real SESSION_SECRET, ENCRYPTION_KEY and CRON_SECRET values",
);

// Validated server environment; fails fast on misconfiguration
export const env = (process.env.NODE_ENV === "production" ? productionSchema : envSchema).parse(process.env);
