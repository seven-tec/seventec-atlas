"use client";

import { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type PendingFieldsetProps = {
  children: ReactNode;
  className?: string;
};

type FormSubmissionHintProps = {
  idleMessage: string;
  pendingMessage: string;
  idleLabel?: string;
  pendingLabel?: string;
  className?: string;
};

export function PendingFieldset({
  children,
  className,
}: PendingFieldsetProps) {
  const { pending } = useFormStatus();

  return (
    <fieldset
      disabled={pending}
      aria-busy={pending}
      className={`${pending ? "opacity-80" : ""} ${className ?? ""}`}
    >
      {children}
    </fieldset>
  );
}

export function FormSubmissionHint({
  idleMessage,
  pendingMessage,
  idleLabel = "Ready",
  pendingLabel = "Processing",
  className,
}: FormSubmissionHintProps) {
  const { pending } = useFormStatus();

  return (
    <p
      aria-live="polite"
      className={`text-xs leading-6 ${pending ? "text-foreground" : "text-muted"} ${className ?? ""}`}
    >
      <span className="font-medium">
        {pending ? pendingLabel : idleLabel}
      </span>
      {" — "}
      {pending ? pendingMessage : idleMessage}
    </p>
  );
}
