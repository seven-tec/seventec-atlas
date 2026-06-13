"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";
import { useFormStatus } from "react-dom";

type PendingSubmitButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  pendingLabel: string;
  variant?: "primary" | "secondary";
};

export function PendingSubmitButton({
  children,
  pendingLabel,
  className,
  disabled = false,
  variant = "primary",
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  const variantClassName =
    variant === "primary"
      ? "border border-accent bg-accent text-background shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      : "border border-border bg-background text-foreground";

  return (
    <button
      type="submit"
      {...props}
      disabled={disabled || pending}
      aria-busy={pending}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClassName} ${
        className ?? ""
      }`}
    >
      {pending ? (
        <>
          <span className="size-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
