import { z } from "zod";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const emptyFormState: FormState = {};

type ParseResult<T> = { ok: true; data: T } | { ok: false; state: FormState };

// Validates submitted form data against a schema, returning field errors on failure
export function parseForm<T extends z.ZodType>(schema: T, formData: FormData): ParseResult<z.infer<T>> {
  const values = Object.fromEntries([...formData.entries()].filter(([, v]) => typeof v === "string"));
  const result = schema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  return {
    ok: false,
    state: {
      error: "יש לתקן את השדות המסומנים",
      fieldErrors: z.flattenError(result.error).fieldErrors as FormState["fieldErrors"],
    },
  };
}
