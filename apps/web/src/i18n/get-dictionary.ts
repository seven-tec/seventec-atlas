import type { Locale } from "@/i18n/config";
import { en } from "@/i18n/dictionaries/en";
import { es } from "@/i18n/dictionaries/es";

export function getDictionary(locale: Locale) {
  return locale === "es" ? es : en;
}

export type AtlasDictionary = ReturnType<typeof getDictionary>;
