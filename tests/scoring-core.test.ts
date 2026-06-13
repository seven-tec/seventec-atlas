import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDeterministicScorecard,
  calculateEmptyScorecard,
  type RawAssessmentAnswer,
} from "../packages/scoring-core/src/index.ts";

test("empty scorecard starts with zeroed deterministic dimensions", () => {
  assert.deepEqual(calculateEmptyScorecard(), {
    overallScore: 0,
    dimensions: [
      { key: "architecture", score: 0 },
      { key: "performance", score: 0 },
      { key: "scalability", score: 0 },
      { key: "maintainability", score: 0 },
      { key: "operability", score: 0 },
    ],
  });
});

test("deterministic scoring ignores unanswered values and derives operability from performance and maintainability", () => {
  const answers: RawAssessmentAnswer[] = [
    { sectionKey: "architecture", questionKey: "arch_modularity", normalizedValue: 4 },
    { sectionKey: "architecture", questionKey: "arch_decisions", normalizedValue: null },
    { sectionKey: "performance", questionKey: "perf_visibility", normalizedValue: 2 },
    { sectionKey: "performance", questionKey: "perf_strategy", normalizedValue: 4 },
    { sectionKey: "scalability", questionKey: "scale_readiness", normalizedValue: 3 },
    { sectionKey: "maintainability", questionKey: "maintainability_delivery", normalizedValue: 2 },
  ];

  const result = calculateDeterministicScorecard(answers, 8);

  assert.deepEqual(result.scorecard.dimensions, [
    { key: "architecture", score: 100 },
    { key: "performance", score: 75 },
    { key: "scalability", score: 75 },
    { key: "maintainability", score: 50 },
    { key: "operability", score: 63 },
  ]);
  assert.equal(result.scorecard.overallScore, 73);
  assert.equal(result.risks.length, 1);
  assert.equal(result.risks[0]?.category, "maintainability");
  assert.equal(result.risks[0]?.severity, "HIGH");
  assert.equal(result.risks[0]?.priority, "HIGH");
});

test("deterministic scoring maps threshold boundaries into stable recommendation priorities", () => {
  const answers: RawAssessmentAnswer[] = [
    { sectionKey: "architecture", questionKey: "architecture_a", normalizedValue: 2 },
    { sectionKey: "performance", questionKey: "performance_a", normalizedValue: 3 },
    { sectionKey: "scalability", questionKey: "scalability_a", normalizedValue: 4 },
    { sectionKey: "maintainability", questionKey: "maintainability_a", normalizedValue: 1 },
  ];

  const result = calculateDeterministicScorecard(answers, 4);
  const recommendationsByCategory = new Map(
    result.recommendations.map((recommendation) => [recommendation.category, recommendation]),
  );

  assert.equal(recommendationsByCategory.get("architecture")?.priority, "HIGH");
  assert.equal(recommendationsByCategory.get("architecture")?.effort, "MEDIUM");
  assert.equal(recommendationsByCategory.get("architecture")?.expectedImpact, "HIGH");

  assert.equal(recommendationsByCategory.get("performance")?.priority, "LOW");
  assert.equal(recommendationsByCategory.get("performance")?.effort, "LOW");
  assert.equal(recommendationsByCategory.get("performance")?.expectedImpact, "MEDIUM");

  assert.equal(recommendationsByCategory.get("scalability")?.priority, "LOW");
  assert.equal(recommendationsByCategory.get("scalability")?.effort, "LOW");
  assert.equal(recommendationsByCategory.get("scalability")?.expectedImpact, "MEDIUM");

  assert.equal(recommendationsByCategory.get("maintainability")?.priority, "URGENT");
  assert.equal(recommendationsByCategory.get("maintainability")?.effort, "HIGH");
  assert.equal(recommendationsByCategory.get("maintainability")?.expectedImpact, "TRANSFORMATIVE");
});

test("deterministic scoring escalates low-score risks with stable severity, likelihood, and impact labels", () => {
  const answers: RawAssessmentAnswer[] = [
    { sectionKey: "architecture", questionKey: "architecture_a", normalizedValue: 1 },
    { sectionKey: "performance", questionKey: "performance_a", normalizedValue: 2 },
    { sectionKey: "scalability", questionKey: "scalability_a", normalizedValue: 3 },
    { sectionKey: "maintainability", questionKey: "maintainability_a", normalizedValue: 4 },
  ];

  const result = calculateDeterministicScorecard(answers, 4);
  const risksByCategory = new Map(result.risks.map((risk) => [risk.category, risk]));

  assert.deepEqual(risksByCategory.get("architecture"), {
    category: "architecture",
    title: "Architecture weakness detected",
    description:
      "The architecture dimension scored 25/100, indicating a clear improvement opportunity before broader growth.",
    severity: "CRITICAL",
    likelihood: "HIGH",
    impact: "CRITICAL",
    priority: "URGENT",
  });

  assert.equal(risksByCategory.get("performance")?.severity, "HIGH");
  assert.equal(risksByCategory.get("performance")?.likelihood, "HIGH");
  assert.equal(risksByCategory.get("performance")?.impact, "HIGH");
  assert.equal(risksByCategory.get("performance")?.priority, "HIGH");

  assert.equal(risksByCategory.has("scalability"), false);

  assert.equal(risksByCategory.has("maintainability"), false);
});
