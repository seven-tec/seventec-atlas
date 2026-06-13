import type { Prisma } from "@prisma/client";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import type {
  DeterministicExecutiveReport,
  LocalizedDeterministicRecommendation,
  LocalizedDeterministicRisk,
} from "@/modules/assessments/reporting/deterministic-report";

type EnrichedRoadmapItem = {
  phase: string;
  title: string;
  rationale: string;
};

type LocalizedAiArtifact = {
  provider?: string;
  model?: string;
  enriched?: {
    executivePolish?: string;
    businessFraming?: string;
    roadmapRefinement?: EnrichedRoadmapItem[];
  } | null;
} | null;

type LocalizedRiskArtifact = LocalizedDeterministicRisk[];
type LocalizedRecommendationArtifact = LocalizedDeterministicRecommendation[];

type ExecutiveReportShape = {
  executiveSummary: string;
  technicalSummary: string;
  roadmapJson: unknown;
  artifactsJson: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isRoadmapItem(value: unknown): value is EnrichedRoadmapItem {
  return (
    isRecord(value) &&
    typeof value.phase === "string" &&
    typeof value.title === "string" &&
    typeof value.rationale === "string"
  );
}

function isDeterministicExecutiveReport(
  value: unknown,
): value is DeterministicExecutiveReport {
  return (
    isRecord(value) &&
    typeof value.executiveSummary === "string" &&
    typeof value.technicalSummary === "string" &&
    Array.isArray(value.roadmap) &&
    value.roadmap.every(isRoadmapItem)
  );
}

function getArtifactsRoot(value: unknown) {
  return isRecord(value) ? value : null;
}

function getLocaleBundles(root: Record<string, unknown> | null) {
  if (!root || !isRecord(root.locales)) {
    return null;
  }

  return root.locales as Record<string, unknown>;
}

export function buildLocalizedDeterministicArtifacts(
  artifactsByLocale: Record<
    Locale,
    {
      deterministic: DeterministicExecutiveReport;
      risks: LocalizedRiskArtifact;
      recommendations: LocalizedRecommendationArtifact;
    }
  >,
  existingArtifactsJson?: unknown,
): Prisma.InputJsonObject {
  const root = getArtifactsRoot(existingArtifactsJson);
  const localeBundles = getLocaleBundles(root);
  const nextLocales = Object.fromEntries(
    locales.map((locale) => {
      const previousBundle =
        localeBundles && isRecord(localeBundles[locale]) ? localeBundles[locale] : {};

      return [
        locale,
        {
          ...(isRecord(previousBundle) ? previousBundle : {}),
          deterministic: artifactsByLocale[locale].deterministic,
          risks: artifactsByLocale[locale].risks,
          recommendations: artifactsByLocale[locale].recommendations,
        },
      ];
    }),
  ) as Prisma.InputJsonObject;

  return {
    ...(root ?? {}),
    defaultLocale,
    locales: nextLocales,
    deterministic: artifactsByLocale[defaultLocale].deterministic,
    risks: artifactsByLocale[defaultLocale].risks,
    recommendations: artifactsByLocale[defaultLocale].recommendations,
    ai: root && "ai" in root ? root.ai : null,
  } as Prisma.InputJsonObject;
}

export function mergeLocalizedAiArtifact(
  existingArtifactsJson: unknown,
  locale: Locale,
  aiArtifact: Exclude<LocalizedAiArtifact, null>,
): Prisma.InputJsonObject {
  const root = getArtifactsRoot(existingArtifactsJson);
  const localeBundles = getLocaleBundles(root);
  const previousBundle =
    localeBundles && isRecord(localeBundles[locale]) ? localeBundles[locale] : {};

  return {
    ...(root ?? {}),
    defaultLocale:
      root && typeof root.defaultLocale === "string" ? root.defaultLocale : defaultLocale,
    locales: {
      ...(localeBundles ?? {}),
      [locale]: {
        ...(isRecord(previousBundle) ? previousBundle : {}),
        ai: aiArtifact,
      },
    },
    ai: aiArtifact,
  } as Prisma.InputJsonObject;
}

export function resolveLocalizedDeterministicArtifact(
  executiveReport: ExecutiveReportShape,
  locale: Locale,
) {
  const root = getArtifactsRoot(executiveReport.artifactsJson);
  const localeBundles = getLocaleBundles(root);

  const orderedLocales: Locale[] = [
    locale,
    root && typeof root.defaultLocale === "string" && locales.includes(root.defaultLocale as Locale)
      ? (root.defaultLocale as Locale)
      : defaultLocale,
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const key of orderedLocales) {
    const bundle = localeBundles?.[key];
    if (isRecord(bundle) && isDeterministicExecutiveReport(bundle.deterministic)) {
      return bundle.deterministic;
    }
  }

  if (root && isDeterministicExecutiveReport(root.deterministic)) {
    return root.deterministic;
  }

  return {
    executiveSummary: executiveReport.executiveSummary,
    technicalSummary: executiveReport.technicalSummary,
    roadmap: Array.isArray(executiveReport.roadmapJson)
      ? executiveReport.roadmapJson.filter(isRoadmapItem)
      : [],
  } satisfies DeterministicExecutiveReport;
}

export function resolveLocalizedAiArtifact(
  executiveReport: Pick<ExecutiveReportShape, "artifactsJson">,
  locale: Locale,
) {
  const root = getArtifactsRoot(executiveReport.artifactsJson);
  const localeBundles = getLocaleBundles(root);

  const orderedLocales: Locale[] = [
    locale,
    root && typeof root.defaultLocale === "string" && locales.includes(root.defaultLocale as Locale)
      ? (root.defaultLocale as Locale)
      : defaultLocale,
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const key of orderedLocales) {
    const bundle = localeBundles?.[key];
    if (isRecord(bundle) && isRecord(bundle.ai)) {
      return bundle.ai as LocalizedAiArtifact;
    }
  }

  return null;
}

function isLocalizedRiskItem(value: unknown): value is LocalizedDeterministicRisk {
  return (
    isRecord(value) &&
    typeof value.category === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  );
}

function isLocalizedRecommendationItem(
  value: unknown,
): value is LocalizedDeterministicRecommendation {
  return (
    isRecord(value) &&
    typeof value.category === "string" &&
    typeof value.title === "string" &&
    typeof value.description === "string"
  );
}

export function resolveLocalizedRiskItems(
  executiveReport: Pick<ExecutiveReportShape, "artifactsJson">,
  locale: Locale,
) {
  const root = getArtifactsRoot(executiveReport.artifactsJson);
  const localeBundles = getLocaleBundles(root);
  const orderedLocales: Locale[] = [
    locale,
    root && typeof root.defaultLocale === "string" && locales.includes(root.defaultLocale as Locale)
      ? (root.defaultLocale as Locale)
      : defaultLocale,
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const key of orderedLocales) {
    const bundle = localeBundles?.[key];
    if (isRecord(bundle) && Array.isArray(bundle.risks) && bundle.risks.every(isLocalizedRiskItem)) {
      return bundle.risks;
    }
  }

  if (root && Array.isArray(root.risks) && root.risks.every(isLocalizedRiskItem)) {
    return root.risks;
  }

  return null;
}

export function resolveLocalizedRecommendationItems(
  executiveReport: Pick<ExecutiveReportShape, "artifactsJson">,
  locale: Locale,
) {
  const root = getArtifactsRoot(executiveReport.artifactsJson);
  const localeBundles = getLocaleBundles(root);
  const orderedLocales: Locale[] = [
    locale,
    root && typeof root.defaultLocale === "string" && locales.includes(root.defaultLocale as Locale)
      ? (root.defaultLocale as Locale)
      : defaultLocale,
  ].filter((value, index, array) => array.indexOf(value) === index);

  for (const key of orderedLocales) {
    const bundle = localeBundles?.[key];
    if (
      isRecord(bundle) &&
      Array.isArray(bundle.recommendations) &&
      bundle.recommendations.every(isLocalizedRecommendationItem)
    ) {
      return bundle.recommendations;
    }
  }

  if (
    root &&
    Array.isArray(root.recommendations) &&
    root.recommendations.every(isLocalizedRecommendationItem)
  ) {
    return root.recommendations;
  }

  return null;
}
