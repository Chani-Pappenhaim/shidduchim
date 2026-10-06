import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full border-2 border-ink bg-paper px-3 py-2.5 text-base text-ink placeholder:text-muted focus:outline-none focus:shadow-[4px_4px_0_0_var(--color-lime)] aria-[invalid=true]:border-danger";

type FieldProps = { label: string; error?: string[] | string; hint?: string; className?: string };

function FieldShell({ label, error, hint, className, htmlFor, children }: FieldProps & { htmlFor: string; children: ReactNode }) {
  const message = Array.isArray(error) ? error[0] : error;
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {message ? <p className="text-sm text-danger">{message}</p> : hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

export function TextField({ label, error, hint, className, id, name, ...props }: FieldProps & ComponentProps<"input">) {
  const fieldId = id ?? name!;
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} htmlFor={fieldId}>
      <input id={fieldId} name={name} aria-invalid={!!error || undefined} className={control} {...props} />
    </FieldShell>
  );
}

export function TextAreaField({ label, error, hint, className, id, name, ...props }: FieldProps & ComponentProps<"textarea">) {
  const fieldId = id ?? name!;
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} htmlFor={fieldId}>
      <textarea id={fieldId} name={name} rows={4} aria-invalid={!!error || undefined} className={cn(control, "resize-y")} {...props} />
    </FieldShell>
  );
}

export function SelectField({ label, error, hint, className, id, name, children, ...props }: FieldProps & ComponentProps<"select">) {
  const fieldId = id ?? name!;
  return (
    <FieldShell label={label} error={error} hint={hint} className={className} htmlFor={fieldId}>
      <select id={fieldId} name={name} aria-invalid={!!error || undefined} className={control} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
