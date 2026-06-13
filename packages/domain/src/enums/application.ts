export const systemTypes = [
  "SAAS",
  "ECOMMERCE",
  "INTERNAL_TOOL",
  "CONTENT_PLATFORM",
  "MARKETPLACE",
  "OTHER",
] as const;

export type SystemTypeValue = (typeof systemTypes)[number];

