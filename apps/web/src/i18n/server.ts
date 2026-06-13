import { cookies, headers } from "next/headers";
import {
  defaultLocale,
  localeCookieName,
  localeHeaderName,
  type Locale,
} from "@/i18n/config";
import { detectPreferredLocale, isLocale } from "@/i18n/locale";

export async function getCurrentLocale(): Promise<Locale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(localeHeaderName);

  if (headerLocale && isLocale(headerLocale)) {
    return headerLocale;
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (cookieLocale && isLocale(cookieLocale)) {
    return cookieLocale;
  }

  return detectPreferredLocale(headerStore.get("accept-language")) ?? defaultLocale;
}
