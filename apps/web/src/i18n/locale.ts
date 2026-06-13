import { defaultLocale, locales, type Locale } from "@/i18n/config";

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function withLocale(locale: Locale, path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${normalizedPath === "/" ? "" : normalizedPath}`;
}

export function replaceLocaleInPathname(pathname: string, locale: Locale) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = locale;
    return `/${segments.join("/")}`;
  }

  return withLocale(locale, pathname);
}

export function stripLocaleFromPathname(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    const [, ...rest] = segments;
    return {
      locale: segments[0],
      pathname: rest.length > 0 ? `/${rest.join("/")}` : "/",
    } as const;
  }

  return {
    locale: null,
    pathname,
  } as const;
}

export function detectPreferredLocale(value: string | null | undefined) {
  if (!value) {
    return defaultLocale;
  }

  const normalized = value.toLowerCase();
  if (normalized.startsWith("es")) {
    return "es" satisfies Locale;
  }

  return defaultLocale;
}
