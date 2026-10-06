"use client";

import type { ComponentProps } from "react";
import { SubmitButton } from "./submit-button";

// Submit button that asks for confirmation before running a destructive form action
export function ConfirmSubmit({ message, ...props }: ComponentProps<typeof SubmitButton> & { message: string }) {
  return (
    <SubmitButton
      {...props}
      onClick={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    />
  );
}
