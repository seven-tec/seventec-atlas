type ComparableScorecard = {
  overallScore: number;
  architectureScore: number;
  performanceScore: number;
  scalabilityScore: number;
  maintainabilityScore: number;
  operabilityScore: number;
};

type DeltaDirection = "improved" | "regressed" | "unchanged";

type ScoreDeltaLabels = {
  overall: string;
  architecture: string;
  performance: string;
  scalability: string;
  maintainability: string;
  operability: string;
};

type NarrativeCopy = {
  unavailable: string;
  flat: string;
  overallImproved: string;
  overallRegressed: string;
  overallUnchanged: string;
  strongestPositive: string;
  strongestRegression: string;
  unchangedDimensions: string;
  sentence: string;
};

export type ScoreDeltaItem = {
  key:
    | "overallScore"
    | "architectureScore"
    | "performanceScore"
    | "scalabilityScore"
    | "maintainabilityScore"
    | "operabilityScore";
  label: string;
  current: number;
  previous: number;
  delta: number;
  direction: DeltaDirection;
};

function getDirection(delta: number): DeltaDirection {
  if (delta > 0) return "improved";
  if (delta < 0) return "regressed";
  return "unchanged";
}

export function buildScoreDeltas(
  current: ComparableScorecard,
  previous: ComparableScorecard,
  labels: ScoreDeltaLabels,
): ScoreDeltaItem[] {
  const items: Array<[ScoreDeltaItem["key"], string]> = [
    ["overallScore", labels.overall],
    ["architectureScore", labels.architecture],
    ["performanceScore", labels.performance],
    ["scalabilityScore", labels.scalability],
    ["maintainabilityScore", labels.maintainability],
    ["operabilityScore", labels.operability],
  ];

  return items.map(([key, label]) => {
    const delta = Number((current[key] - previous[key]).toFixed(1));
    return {
      key,
      label,
      current: current[key],
      previous: previous[key],
      delta,
      direction: getDirection(delta),
    };
  });
}

function formatTemplate(
  template: string,
  values: Record<string, string | number>,
) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );
}

export function buildImprovementNarrative(
  deltas: ScoreDeltaItem[],
  copy: NarrativeCopy,
) {
  const improved = deltas.filter(
    (item) => item.direction === "improved" && item.key !== "overallScore",
  );
  const regressed = deltas.filter(
    (item) => item.direction === "regressed" && item.key !== "overallScore",
  );
  const unchanged = deltas.filter(
    (item) => item.direction === "unchanged" && item.key !== "overallScore",
  );

  const strongestImprovement = improved.sort((a, b) => b.delta - a.delta)[0];
  const strongestRegression = regressed.sort((a, b) => a.delta - b.delta)[0];
  const overall = deltas.find((item) => item.key === "overallScore");

  if (!overall) {
    return copy.unavailable;
  }

  if (improved.length === 0 && regressed.length === 0) {
    return copy.flat;
  }

  const direction =
    overall.direction === "improved"
      ? copy.overallImproved
      : overall.direction === "regressed"
        ? copy.overallRegressed
        : copy.overallUnchanged;

  let narrative = formatTemplate(copy.sentence, {
    direction,
    delta: Math.abs(overall.delta),
  });

  if (strongestImprovement) {
    narrative += `, ${formatTemplate(copy.strongestPositive, {
      label: strongestImprovement.label.toLowerCase(),
      delta: strongestImprovement.delta,
    })}`;
  }

  if (strongestRegression) {
    narrative += `, ${formatTemplate(copy.strongestRegression, {
      label: strongestRegression.label.toLowerCase(),
      delta: strongestRegression.delta,
    })}`;
  }

  if (unchanged.length > 0) {
    narrative += `. ${formatTemplate(copy.unchangedDimensions, {
      count: unchanged.length,
    })}`;
  }

  narrative += ".";
  return narrative;
}
