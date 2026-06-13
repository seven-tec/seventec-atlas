import assert from "node:assert/strict";
import test from "node:test";

import {
  calculateDeterministicScorecard,
  type RawAssessmentAnswer,
} from "../packages/scoring-core/src/index.ts";
import { slugify } from "../apps/web/src/lib/slugify.ts";
import {
  assessmentQuestionMap,
  assessmentQuestionnaireV1,
} from "../apps/web/src/modules/assessments/questionnaire.ts";
import { createAssessmentDraftSchema } from "../apps/web/src/modules/assessments/schemas/create-assessment-draft.schema.ts";
import { createApplicationSchema } from "../apps/web/src/modules/applications/schemas/create-application.schema.ts";
import { createWorkspaceSchema } from "../apps/web/src/modules/workspaces/schemas/create-workspace.schema.ts";

const validCuid = "clx7e0d2w000008l48n2r7b1x";

test("workspace creation schema accepts a serious flagship workspace name", () => {
  const parsed = createWorkspaceSchema.parse({
    name: "SevenTec Advisory",
  });

  assert.equal(parsed.name, "SevenTec Advisory");
});

test("application creation schema guards the vertical slice boundary", () => {
  const parsed = createApplicationSchema.parse({
    workspaceId: validCuid,
    name: "Atlas Customer Portal",
    description: "Main SaaS application under architecture review.",
    systemType: "SAAS",
    primaryGoal: "Support customer operations with premium reliability.",
  });

  assert.equal(parsed.systemType, "SAAS");
  assert.equal(parsed.workspaceId, validCuid);

  assert.throws(() => {
    createApplicationSchema.parse({
      workspaceId: "invalid-id",
      name: "A",
      description: "",
      systemType: "NOT_A_SYSTEM",
      primaryGoal: "",
    });
  });
});

test("assessment draft schema requires a valid application id", () => {
  const parsed = createAssessmentDraftSchema.parse({
    applicationId: validCuid,
  });

  assert.equal(parsed.applicationId, validCuid);

  assert.throws(() => {
    createAssessmentDraftSchema.parse({
      applicationId: "draft-without-cuid",
    });
  });
});

test("questionnaire v1 stays structurally aligned with deterministic scoring", () => {
  const sectionKeys = assessmentQuestionnaireV1.map((section) => section.key);
  const totalQuestions = assessmentQuestionnaireV1.reduce(
    (count, section) => count + section.questions.length,
    0,
  );

  assert.deepEqual(sectionKeys, [
    "architecture",
    "performance",
    "scalability",
    "maintainability",
  ]);
  assert.equal(assessmentQuestionMap.size, totalQuestions);

  for (const section of assessmentQuestionnaireV1) {
    for (const question of section.questions) {
      assert.equal(question.options.length, 4);
      assert.deepEqual(
        question.options.map((option) => option.normalizedValue),
        [1, 2, 3, 4],
      );
    }
  }
});

test("deterministic scoring produces a stable flagship baseline report shape", () => {
  const answers: RawAssessmentAnswer[] = [
    { sectionKey: "architecture", questionKey: "architecture_modularity", normalizedValue: 4 },
    { sectionKey: "architecture", questionKey: "architecture_decisions", normalizedValue: 4 },
    { sectionKey: "performance", questionKey: "performance_visibility", normalizedValue: 3 },
    { sectionKey: "performance", questionKey: "performance_strategy", normalizedValue: 2 },
    { sectionKey: "scalability", questionKey: "scalability_readiness", normalizedValue: 2 },
    { sectionKey: "scalability", questionKey: "scalability_operating_model", normalizedValue: 3 },
    { sectionKey: "maintainability", questionKey: "maintainability_codebase", normalizedValue: 2 },
    { sectionKey: "maintainability", questionKey: "maintainability_delivery", normalizedValue: 3 },
  ];

  const result = calculateDeterministicScorecard(answers, 8);

  assert.equal(result.scorecard.overallScore, 70);
  assert.deepEqual(result.scorecard.dimensions, [
    { key: "architecture", score: 100 },
    { key: "performance", score: 63 },
    { key: "scalability", score: 63 },
    { key: "maintainability", score: 63 },
    { key: "operability", score: 63 },
  ]);
  assert.equal(result.risks.length, 3);
  assert.deepEqual(
    result.risks.map((risk) => risk.category),
    ["performance", "scalability", "maintainability"],
  );
  assert.equal(result.recommendations.length, 4);
  assert.deepEqual(result.completeness, {
    answeredQuestions: 8,
    totalQuestions: 8,
  });
});

test("slugify keeps route generation sober and predictable", () => {
  assert.equal(slugify("  Atlas Customer Portal  "), "atlas-customer-portal");
  assert.equal(slugify("Arquitectura Crítica & Escalabilidad"), "arquitectura-critica-escalabilidad");
});
