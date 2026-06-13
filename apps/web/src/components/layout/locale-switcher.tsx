"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale } from "@/i18n/config";
import { replaceLocaleInPathname } from "@/i18n/locale";

type LocaleSwitcherProps = {
  currentLocale: Locale;
  englishLabel: string;
  spanishLabel: string;
};

export function LocaleSwitcher({
  currentLocale,
  englishLabel,
  spanishLabel,
}: LocaleSwitcherProps) {
  const pathname = usePathname();

  const buildLink = (locale: Locale) => replaceLocaleInPathname(pathname, locale);

  return (
    <div className="flex items-center gap-1 rounded-md border border-border p-1 text-xs">
      <Link
        href={buildLink("en")}
        className={`rounded px-2 py-1 ${currentLocale === "en" ? "bg-background text-foreground" : "text-muted"}`}
      >
        {englishLabel}
      </Link>
      <Link
        href={buildLink("es")}
        className={`rounded px-2 py-1 ${currentLocale === "es" ? "bg-background text-foreground" : "text-muted"}`}
      >
        {spanishLabel}
      </Link>
    </div>
  );
}
