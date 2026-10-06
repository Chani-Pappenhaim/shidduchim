import { z } from "zod";

export type FormState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  // Submitted text values, echoed back so a rejected form keeps what the user typed
  values?: Record<string, string>;
};

export const emptyFormState: FormState = {};

const SECRET_FIELDS = new Set(["password"]);

// Text entries of a submitted form; secrets are never echoed back to the page
export function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string" && !SECRET_FIELDS.has(entry[0])),
  );
}

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
      values: formValues(formData),
    },
  };
}

// Picks the value to show in a field: what was just submitted, else the saved value
export function fieldValue(state: FormState, name: string, saved?: string | number | null): string {
  return state.values?.[name] ?? (saved == null ? "" : String(saved));
}
