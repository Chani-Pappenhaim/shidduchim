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
  S3_ENDPOINT: z.url().optional(),
  S3_REGION: z.string().optional(),
  S3_BUCKET: z.string().optional(),
  S3_ACCESS_KEY_ID: z.string().optional(),
  S3_SECRET_ACCESS_KEY: z.string().optional(),
});

// Example values from .env.example must never sign or encrypt anything in production
const productionSchema = envSchema.refine(
  (e) => !e.SESSION_SECRET.startsWith("change-me") && !/^0+$/.test(e.ENCRYPTION_KEY) && !!e.CRON_SECRET,
  "Production needs real SESSION_SECRET, ENCRYPTION_KEY and CRON_SECRET values",
);

type Env = z.infer<typeof envSchema>;
let parsed: Env | undefined;

// Validated server environment, read on first use so the build never needs the runtime secrets
export const env = new Proxy({} as Env, {
  get: (_, key) => (parsed ??= (process.env.NODE_ENV === "production" ? productionSchema : envSchema).parse(process.env))[key as keyof Env],
});
