import { defaultLocale, type Locale } from "../../../i18n/config.ts";
import type {
  DeterministicRecommendation,
  DeterministicRisk,
  DeterministicScoringResult,
} from "@seventec-atlas/scoring-core";

type ReportInput = {
  applicationName: string;
  overallScore: number;
  architectureScore: number;
  performanceScore: number;
  scalabilityScore: number;
  maintainabilityScore: number;
  topRiskTitles: string[];
};

type ReportDimensionKey =
  | "architecture"
  | "performance"
  | "scalability"
  | "maintainability";

type DeterministicRoadmapItem = {
  phase: string;
  title: string;
  rationale: string;
};

export type DeterministicExecutiveReport = {
  executiveSummary: string;
  technicalSummary: string;
  roadmap: DeterministicRoadmapItem[];
};

export type LocalizedDeterministicRisk = Pick<
  DeterministicRisk,
  "category" | "title" | "description" | "severity" | "likelihood" | "impact" | "priority"
>;

export type LocalizedDeterministicRecommendation = Pick<
  DeterministicRecommendation,
  | "category"
  | "title"
  | "description"
  | "priority"
  | "effort"
  | "expectedImpact"
>;

const reportCopy = {
  en: {
    maturity: {
      strong: "strong",
      solid: "solid",
      developing: "developing",
      fragile: "fragile",
    },
    joinAnd: " and ",
    noCriticalRisks: "no critical risks",
    executiveSummary:
      "{applicationName} currently shows a {maturity} architecture baseline with an overall score of {overallScore}/100. The most immediate improvement opportunity is concentrated in {weakestDimensions}, which should be addressed before larger scale or product complexity increases.",
    technicalSummary:
      "Dimension breakdown — architecture: {architectureScore}/100, performance: {performanceScore}/100, scalability: {scalabilityScore}/100, maintainability: {maintainabilityScore}/100. Top deterministic risks detected: {topRiskTitles}.",
    roadmap: {
      phase1: "Phase 1",
      phase2: "Phase 2",
      phase3: "Phase 3",
      phase1Title: "Stabilize {dimension} foundations",
      phase2Title: "Raise {dimension} execution maturity",
      phase3Title: "Standardize operating practices and score tracking",
      phase1Rationale:
        "Address the lowest-scoring dimension first to reduce delivery risk and improve platform confidence before broader optimization work.",
      phase2Rationale:
        "The second weakest area is likely to limit scale unless process, structure, and implementation discipline improve together.",
      phase3Rationale:
        "After the primary risks are reduced, formalize standards and periodic reassessment to sustain architecture quality over time.",
    },
    dimensions: {
      architecture: "architecture",
      performance: "performance",
      scalability: "scalability",
      maintainability: "maintainability",
      operability: "operability",
      coreArchitecture: "core architecture",
      operational: "operational",
    },
    riskTitle: "{dimension} weakness detected",
    riskDescription:
      "The {dimension} dimension scored {score}/100, indicating a clear improvement opportunity before broader growth.",
    recommendationTitle: "Improve {dimension} maturity",
    recommendationDescription:
      "Raise {dimension} practices from the current {score}/100 baseline using explicit standards, safer delivery habits, and better operating discipline.",
  },
  es: {
    maturity: {
      strong: "sólida",
      solid: "robusta",
      developing: "en desarrollo",
      fragile: "frágil",
    },
    joinAnd: " y ",
    noCriticalRisks: "sin riesgos críticos",
    executiveSummary:
      "{applicationName} actualmente muestra una base arquitectónica {maturity}, con un score general de {overallScore}/100. La oportunidad de mejora más inmediata se concentra en {weakestDimensions}, y debería abordarse antes de que aumenten la escala o la complejidad del producto.",
    technicalSummary:
      "Desglose por dimensión — arquitectura: {architectureScore}/100, performance: {performanceScore}/100, escalabilidad: {scalabilityScore}/100, mantenibilidad: {maintainabilityScore}/100. Riesgos deterministas principales detectados: {topRiskTitles}.",
    roadmap: {
      phase1: "Fase 1",
      phase2: "Fase 2",
      phase3: "Fase 3",
      phase1Title: "Estabilizar fundamentos de {dimension}",
      phase2Title: "Elevar la madurez de ejecución en {dimension}",
      phase3Title: "Estandarizar prácticas operativas y seguimiento del score",
      phase1Rationale:
        "Aborda primero la dimensión con menor score para reducir riesgo de delivery y mejorar la confianza en la plataforma antes de ampliar la optimización.",
      phase2Rationale:
        "La segunda área más débil probablemente limitará la escala si no mejoran en conjunto el proceso, la estructura y la disciplina de implementación.",
      phase3Rationale:
        "Una vez reducidos los riesgos principales, formaliza estándares y una reevaluación periódica para sostener la calidad arquitectónica en el tiempo.",
    },
    dimensions: {
      architecture: "arquitectura",
      performance: "performance",
      scalability: "escalabilidad",
      maintainability: "mantenibilidad",
      operability: "operabilidad",
      coreArchitecture: "arquitectura base",
      operational: "operación",
    },
    riskTitle: "Debilidad detectada en {dimension}",
    riskDescription:
      "La dimensión de {dimension} obtuvo {score}/100, lo que indica una oportunidad clara de mejora antes de un crecimiento más amplio.",
    recommendationTitle: "Mejorar la madurez de {dimension}",
    recommendationDescription:
      "Eleva las prácticas de {dimension} desde la base actual de {score}/100 mediante estándares explícitos, hábitos de delivery más seguros y mejor disciplina operativa.",
  },
} as const;

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

function maturityLabel(score: number, locale: Locale) {
  const copy = reportCopy[locale] ?? reportCopy[defaultLocale];
  if (score >= 85) return copy.maturity.strong;
  if (score >= 70) return copy.maturity.solid;
  if (score >= 50) return copy.maturity.developing;
  return copy.maturity.fragile;
}

function weakestDimensions(input: ReportInput) {
  return [
    { key: "architecture" as ReportDimensionKey, score: input.architectureScore },
    { key: "performance" as ReportDimensionKey, score: input.performanceScore },
    { key: "scalability" as ReportDimensionKey, score: input.scalabilityScore },
    { key: "maintainability" as ReportDimensionKey, score: input.maintainabilityScore },
  ]
    .sort((a, b) => a.score - b.score)
    .slice(0, 2);
}

export function buildDeterministicExecutiveReport(
  input: ReportInput,
  locale: Locale,
): DeterministicExecutiveReport {
  const copy = reportCopy[locale] ?? reportCopy[defaultLocale];
  const weakest = weakestDimensions(input);
  const weakestDimensionLabels = weakest
    .map((item) => copy.dimensions[item.key])
    .join(copy.joinAnd);
  const executiveSummary = formatTemplate(copy.executiveSummary, {
    applicationName: input.applicationName,
    maturity: maturityLabel(input.overallScore, locale),
    overallScore: input.overallScore,
    weakestDimensions: weakestDimensionLabels,
  });

  const technicalSummary = formatTemplate(copy.technicalSummary, {
    architectureScore: input.architectureScore,
    performanceScore: input.performanceScore,
    scalabilityScore: input.scalabilityScore,
    maintainabilityScore: input.maintainabilityScore,
    topRiskTitles:
      input.topRiskTitles.length > 0
        ? input.topRiskTitles.join(", ")
        : copy.noCriticalRisks,
  });

  const roadmap: DeterministicRoadmapItem[] = [
    {
      phase: copy.roadmap.phase1,
      title: formatTemplate(copy.roadmap.phase1Title, {
        dimension:
          weakest[0]?.key
            ? copy.dimensions[weakest[0].key]
            : copy.dimensions.coreArchitecture,
      }),
      rationale: copy.roadmap.phase1Rationale,
    },
    {
      phase: copy.roadmap.phase2,
      title: formatTemplate(copy.roadmap.phase2Title, {
        dimension:
          weakest[1]?.key
            ? copy.dimensions[weakest[1].key]
            : copy.dimensions.operational,
      }),
      rationale: copy.roadmap.phase2Rationale,
    },
    {
      phase: copy.roadmap.phase3,
      title: copy.roadmap.phase3Title,
      rationale: copy.roadmap.phase3Rationale,
    },
  ];

  return {
    executiveSummary,
    technicalSummary,
    roadmap,
  };
}

export function buildLocalizedRiskItems(
  risks: DeterministicScoringResult["risks"],
  scoreByCategory: Partial<Record<ReportDimensionKey, number>>,
  locale: Locale,
): LocalizedDeterministicRisk[] {
  const copy = reportCopy[locale] ?? reportCopy[defaultLocale];

  return risks.map((risk) => {
    const dimensionKey = risk.category as ReportDimensionKey;
    const dimension = copy.dimensions[dimensionKey] ?? risk.category;
    const score = scoreByCategory[dimensionKey] ?? 0;

    return {
      ...risk,
      category: dimension,
      title: formatTemplate(copy.riskTitle, { dimension }),
      description: formatTemplate(copy.riskDescription, { dimension, score }),
    };
  });
}

export function buildLocalizedRecommendationItems(
  recommendations: DeterministicScoringResult["recommendations"],
  scoreByCategory: Partial<Record<ReportDimensionKey, number>>,
  locale: Locale,
): LocalizedDeterministicRecommendation[] {
  const copy = reportCopy[locale] ?? reportCopy[defaultLocale];

  return recommendations.map((recommendation) => {
    const dimensionKey = recommendation.category as ReportDimensionKey;
    const dimension = copy.dimensions[dimensionKey] ?? recommendation.category;
    const score = scoreByCategory[dimensionKey] ?? 0;

    return {
      ...recommendation,
      category: dimension,
      title: formatTemplate(copy.recommendationTitle, { dimension }),
      description: formatTemplate(copy.recommendationDescription, {
        dimension,
        score,
      }),
    };
  });
}
