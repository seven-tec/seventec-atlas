"use client";

type ExportPdfButtonProps = {
  label: string;
};

export function ExportPdfButton({ label }: ExportPdfButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-md border border-border px-4 py-2 text-sm text-foreground print:hidden"
    >
      {label}
    </button>
  );
}
