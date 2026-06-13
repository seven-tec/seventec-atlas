import type { AtlasDictionary } from "@/i18n/get-dictionary";

type VisualLabels = AtlasDictionary["report"]["visualLabels"];

function normalizeToken(value: string) {
  return value.trim().toUpperCase().replace(/[\s-]+/g, "_");
}

function resolveVisualLabel(value: string, labels: Record<string, string>) {
  return labels[normalizeToken(value)] ?? value;
}

export function getVisualPriorityLabel(
  value: string,
  visualLabels: VisualLabels,
) {
  return resolveVisualLabel(value, visualLabels.priorities);
}

export function getVisualSeverityLabel(
  value: string,
  visualLabels: VisualLabels,
) {
  return resolveVisualLabel(value, visualLabels.severities);
}

export function getVisualCategoryLabel(
  value: string,
  visualLabels: VisualLabels,
) {
  return resolveVisualLabel(value, visualLabels.categories);
}

export function getVisualEffortLabel(
  value: string,
  visualLabels: VisualLabels,
) {
  return resolveVisualLabel(value, visualLabels.efforts);
}
