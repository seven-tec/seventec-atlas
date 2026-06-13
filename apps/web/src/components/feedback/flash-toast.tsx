"use client";

import { useEffect, useState } from "react";
import { FLASH_COOKIE_NAME, type FlashMessage } from "@/lib/flash-shared";

type FlashToastProps = {
  message: FlashMessage;
  dismissLabel: string;
};

function getTone(type: FlashMessage["type"]) {
  switch (type) {
    case "success":
      return "border-emerald-500/40 bg-emerald-500/12 text-emerald-50";
    case "error":
      return "border-rose-500/40 bg-rose-500/12 text-rose-50";
    default:
      return "border-border bg-surface text-foreground";
  }
}

export function FlashToast({ message, dismissLabel }: FlashToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.cookie = `${FLASH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 4500);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed right-6 top-6 z-50 max-w-md">
      <div
        role="status"
        aria-live="polite"
        className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur ${getTone(
          message.type,
        )}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-sm font-semibold">{message.title}</p>
            <p className="text-sm leading-6 opacity-90">{message.description}</p>
          </div>
          <button
            type="button"
            onClick={() => setVisible(false)}
            className="rounded-md border border-white/10 px-2 py-1 text-xs opacity-80 transition hover:opacity-100"
          >
            {dismissLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
