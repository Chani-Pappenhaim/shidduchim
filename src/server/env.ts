import "server-only";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  DATABASE_POOL_SIZE: z.coerce.number().int().min(1).default(10),
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

// Validated server environment; fails fast on misconfiguration
export const env = envSchema.parse(process.env);
