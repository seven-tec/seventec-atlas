import Link from "next/link";
import { ReactNode } from "react";

type EmptyStateAction = {
  href: string;
  label: string;
  variant?: "primary" | "secondary";
};

type EmptyStatePanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  primaryAction?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  checklist?: readonly string[];
  checklistTitle?: string;
  aside?: ReactNode;
  className?: string;
};

function getActionClassName(variant: EmptyStateAction["variant"] = "primary") {
  if (variant === "secondary") {
    return "rounded-md border border-border px-4 py-2 text-sm text-foreground";
  }

  return "rounded-md border border-accent bg-accent px-4 py-2 text-sm text-background";
}

export function EmptyStatePanel({
  eyebrow,
  title,
  description,
  primaryAction,
  secondaryAction,
  checklist,
  checklistTitle = "Recommended path",
  aside,
  className,
}: EmptyStatePanelProps) {
  return (
    <section
      className={`rounded-3xl border border-dashed border-border bg-surface p-8 md:p-10 ${
        className ?? ""
      }`}
    >
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">{eyebrow}</p>
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold">{title}</h2>
            <p className="max-w-2xl text-sm leading-7 text-muted">{description}</p>
          </div>

          {(primaryAction || secondaryAction) && (
            <div className="flex flex-wrap gap-3">
              {primaryAction ? (
                <Link href={primaryAction.href} className={getActionClassName("primary")}>
                  {primaryAction.label}
                </Link>
              ) : null}
              {secondaryAction ? (
                <Link
                  href={secondaryAction.href}
                  className={getActionClassName(secondaryAction.variant ?? "secondary")}
                >
                  {secondaryAction.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {checklistTitle}
          </p>
          {checklist?.length ? (
            <ol className="space-y-3 text-sm text-muted">
              {checklist.map((item, index) => (
                <li key={item} className="flex gap-3">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs text-foreground">
                    {index + 1}
                  </span>
                  <span className="leading-6">{item}</span>
                </li>
              ))}
            </ol>
          ) : null}
          {aside ? <div className="rounded-xl border border-border p-4 text-sm text-muted">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
