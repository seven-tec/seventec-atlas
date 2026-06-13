export type DimensionScore = {
  key: "architecture" | "performance" | "scalability" | "maintainability" | "operability";
  score: number;
};

export type ScorecardSnapshot = {
  overallScore: number;
  dimensions: DimensionScore[];
};

export type RawAssessmentAnswer = {
  sectionKey: string;
  questionKey: string;
  normalizedValue: number | null;
};

export type DeterministicRisk = {
  category: string;
  title: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  likelihood: "LOW" | "MEDIUM" | "HIGH";
  impact: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
};

export type DeterministicRecommendation = {
  category: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  effort: "LOW" | "MEDIUM" | "HIGH";
  expectedImpact: "LOW" | "MEDIUM" | "HIGH" | "TRANSFORMATIVE";
};

export type DeterministicScoringResult = {
  scorecard: ScorecardSnapshot;
  risks: DeterministicRisk[];
  recommendations: DeterministicRecommendation[];
  completeness: {
    answeredQuestions: number;
    totalQuestions: number;
  };
};

export function calculateEmptyScorecard(): ScorecardSnapshot {
  return {
    overallScore: 0,
    dimensions: [
      { key: "architecture", score: 0 },
      { key: "performance", score: 0 },
      { key: "scalability", score: 0 },
      { key: "maintainability", score: 0 },
      { key: "operability", score: 0 },
    ],
  };
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 25);
}

function priorityFromScore(score: number) {
  if (score <= 30) return "URGENT" as const;
  if (score <= 50) return "HIGH" as const;
  if (score <= 70) return "MEDIUM" as const;
  return "LOW" as const;
}

function severityFromScore(score: number) {
  if (score <= 30) return "CRITICAL" as const;
  if (score <= 50) return "HIGH" as const;
  if (score <= 70) return "MEDIUM" as const;
  return "LOW" as const;
}

function impactFromScore(score: number) {
  if (score <= 30) return "CRITICAL" as const;
  if (score <= 50) return "HIGH" as const;
  if (score <= 70) return "MEDIUM" as const;
  return "LOW" as const;
}

function likelihoodFromScore(score: number) {
  if (score <= 50) return "HIGH" as const;
  if (score <= 70) return "MEDIUM" as const;
  return "LOW" as const;
}

export function calculateDeterministicScorecard(
  answers: RawAssessmentAnswer[],
  totalQuestions: number,
): DeterministicScoringResult {
  const sectionBuckets = new Map<string, number[]>();

  for (const answer of answers) {
    if (typeof answer.normalizedValue !== "number") {
      continue;
    }

    if (!sectionBuckets.has(answer.sectionKey)) {
      sectionBuckets.set(answer.sectionKey, []);
    }

    sectionBuckets.get(answer.sectionKey)!.push(answer.normalizedValue);
  }

  const architectureScore = average(sectionBuckets.get("architecture") ?? []);
  const performanceScore = average(sectionBuckets.get("performance") ?? []);
  const scalabilityScore = average(sectionBuckets.get("scalability") ?? []);
  const maintainabilityScore = average(sectionBuckets.get("maintainability") ?? []);
  const operabilityScore = Math.round((performanceScore + maintainabilityScore) / 2);

  const scorecard: ScorecardSnapshot = {
    overallScore: Math.round(
      (architectureScore +
        performanceScore +
        scalabilityScore +
        maintainabilityScore +
        operabilityScore) /
        5,
    ),
    dimensions: [
      { key: "architecture", score: architectureScore },
      { key: "performance", score: performanceScore },
      { key: "scalability", score: scalabilityScore },
      { key: "maintainability", score: maintainabilityScore },
      { key: "operability", score: operabilityScore },
    ],
  };

  const risks: DeterministicRisk[] = scorecard.dimensions
    .filter((dimension) => dimension.key !== "operability" && dimension.score < 75)
    .map((dimension) => ({
      category: dimension.key,
      title: `${dimension.key[0].toUpperCase()}${dimension.key.slice(1)} weakness detected`,
      description: `The ${dimension.key} dimension scored ${dimension.score}/100, indicating a clear improvement opportunity before broader growth.`,
      severity: severityFromScore(dimension.score),
      likelihood: likelihoodFromScore(dimension.score),
      impact: impactFromScore(dimension.score),
      priority: priorityFromScore(dimension.score),
    }));

  const recommendations: DeterministicRecommendation[] = scorecard.dimensions
    .filter((dimension) => dimension.key !== "operability")
    .map((dimension) => ({
      category: dimension.key,
      title: `Improve ${dimension.key} maturity`,
      description: `Raise ${dimension.key} practices from the current ${dimension.score}/100 baseline using explicit standards, safer delivery habits, and better operating discipline.`,
      priority: priorityFromScore(dimension.score),
      effort: dimension.score < 50 ? "HIGH" : dimension.score < 75 ? "MEDIUM" : "LOW",
      expectedImpact:
        dimension.score < 50
          ? "TRANSFORMATIVE"
          : dimension.score < 75
            ? "HIGH"
            : "MEDIUM",
    }));

  return {
    scorecard,
    risks,
    recommendations,
    completeness: {
      answeredQuestions: answers.length,
      totalQuestions,
    },
  };
}
