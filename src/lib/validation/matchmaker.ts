import { z } from "zod";
import { emailField, optionalPhone, optionalText, requiredText } from "./fields";

export const registerSchema = z.object({
  name: requiredText("שם"),
  email: emailField,
  password: z.string().min(8, "סיסמה של 8 תווים לפחות").max(200),
});

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, "נא למלא סיסמה"),
});

export const profileSchema = z.object({
  name: requiredText("שם"),
  phone: optionalPhone,
  city: optionalText(80),
  about: optionalText(1000),
  emailSignature: optionalText(500),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
