export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";
export const localeCookieName = "atlas_locale";
export const localeHeaderName = "x-atlas-locale";
