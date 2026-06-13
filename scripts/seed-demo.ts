import {
  AnalysisRunStatus,
  AssessmentStatus,
  SystemType,
  WorkspaceRole,
} from "../packages/db/node_modules/@prisma/client/index.js";
import { prisma } from "../packages/db/src/client.ts";
import { calculateDeterministicScorecard } from "../packages/scoring-core/src/index.ts";
import { buildDeterministicExecutiveReport } from "../apps/web/src/modules/assessments/reporting/deterministic-report.ts";
import {
  assessmentQuestionMap,
  assessmentQuestionnaireV1,
} from "../apps/web/src/modules/assessments/questionnaire.ts";
import { slugify } from "../apps/web/src/lib/slugify.ts";

const DEMO_USER_EMAIL = "architect@seventec.dev";
const DEMO_USER_NAME = "SevenTec Architect";
const DEMO_WORKSPACE_NAME = "Atlas Demo Workspace";
const DEMO_APPLICATION_NAME = "Atlas Commerce Platform";
const DEMO_WORKSPACE_SLUG = slugify(DEMO_WORKSPACE_NAME);
const DEMO_APPLICATION_SLUG = slugify(DEMO_APPLICATION_NAME);
const QUESTIONNAIRE_VERSION = "v1";
const SCORING_MODEL_VERSION = "atlas-score-v1";

type AnswerValue = "poor" | "fair" | "good" | "strong";

const baselineAnswers: Record<string, AnswerValue> = {
  architecture_modularity: "fair",
  architecture_decisions: "fair",
  performance_visibility: "poor",
  performance_strategy: "fair",
  scalability_readiness: "fair",
  scalability_operating_model: "poor",
  maintainability_codebase: "good",
  maintainability_delivery: "fair",
};

const improvedAnswers: Record<string, AnswerValue> = {
  architecture_modularity: "good",
  architecture_decisions: "strong",
  performance_visibility: "good",
  performance_strategy: "good",
  scalability_readiness: "good",
  scalability_operating_model: "good",
  maintainability_codebase: "strong",
  maintainability_delivery: "good",
};

function buildAnswerRows(
  values: Record<string, AnswerValue>,
  assessmentId: string,
) {
  return assessmentQuestionnaireV1.flatMap((section) =>
    section.questions.map((question) => {
      const selectedValue = values[question.key];
      const selectedOption = question.options.find((option) => option.value === selectedValue);

      if (!selectedOption) {
        throw new Error(`Missing demo answer for ${question.key}`);
      }

      return {
        assessmentId,
        sectionKey: section.key,
        questionKey: question.key,
        valueJson: {
          selectedValue,
          selectedLabel: selectedOption.label,
        },
        normalizedValue: selectedOption.normalizedValue,
        weightSnapshot: 1,
      };
    }),
  );
}

function buildRunArtifacts(values: Record<string, AnswerValue>, applicationName: string) {
  const answers = Object.entries(values).map(([questionKey, selectedValue]) => {
    const definition = assessmentQuestionMap.get(questionKey);
    const option = definition?.question.options.find((item) => item.value === selectedValue);

    if (!definition || !option) {
      throw new Error(`Invalid demo answer payload for ${questionKey}`);
    }

    return {
      sectionKey: definition.section.key,
      questionKey,
      normalizedValue: option.normalizedValue,
    };
  });

  const scoring = calculateDeterministicScorecard(answers, assessmentQuestionnaireV1.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  ));
  const architectureScore =
    scoring.scorecard.dimensions.find((item) => item.key === "architecture")?.score ?? 0;
  const performanceScore =
    scoring.scorecard.dimensions.find((item) => item.key === "performance")?.score ?? 0;
  const scalabilityScore =
    scoring.scorecard.dimensions.find((item) => item.key === "scalability")?.score ?? 0;
  const maintainabilityScore =
    scoring.scorecard.dimensions.find((item) => item.key === "maintainability")?.score ?? 0;
  const operabilityScore =
    scoring.scorecard.dimensions.find((item) => item.key === "operability")?.score ?? 0;

  const deterministicReport = buildDeterministicExecutiveReport({
    applicationName,
    overallScore: scoring.scorecard.overallScore,
    architectureScore,
    performanceScore,
    scalabilityScore,
    maintainabilityScore,
    topRiskTitles: scoring.risks.map((risk) => risk.title),
  });

  return {
    scoring,
    deterministicReport,
    dimensions: {
      architectureScore,
      performanceScore,
      scalabilityScore,
      maintainabilityScore,
      operabilityScore,
    },
  };
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    update: { name: DEMO_USER_NAME },
    create: {
      email: DEMO_USER_EMAIL,
      name: DEMO_USER_NAME,
    },
  });

  const existingWorkspace = await prisma.workspace.findUnique({
    where: { slug: DEMO_WORKSPACE_SLUG },
    select: { id: true },
  });

  if (existingWorkspace) {
    await prisma.workspace.delete({
      where: { id: existingWorkspace.id },
    });
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: DEMO_WORKSPACE_NAME,
      slug: DEMO_WORKSPACE_SLUG,
      ownerId: user.id,
      members: {
        create: {
          userId: user.id,
          role: WorkspaceRole.OWNER,
        },
      },
    },
  });

  const application = await prisma.application.create({
    data: {
      workspaceId: workspace.id,
      name: DEMO_APPLICATION_NAME,
      slug: DEMO_APPLICATION_SLUG,
      description:
        "Enterprise commerce platform used as the flagship Atlas demo dataset for architecture intelligence, reporting, and run comparisons.",
      systemType: SystemType.SAAS,
      primaryGoal:
        "Reduce delivery risk and improve scalability confidence before a larger enterprise expansion phase.",
    },
  });

  const now = new Date();
  const baselineRunAt = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 12);
  const improvedRunAt = new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2);

  const baselineAssessment = await prisma.assessment.create({
    data: {
      workspaceId: workspace.id,
      applicationId: application.id,
      createdById: user.id,
      questionnaireVersion: QUESTIONNAIRE_VERSION,
      status: AssessmentStatus.ANALYZED,
      submittedAt: baselineRunAt,
    },
  });

  await prisma.assessmentAnswer.createMany({
    data: buildAnswerRows(baselineAnswers, baselineAssessment.id),
  });

  const baseline = buildRunArtifacts(baselineAnswers, application.name);

  await prisma.analysisRun.create({
    data: {
      assessmentId: baselineAssessment.id,
      status: AnalysisRunStatus.COMPLETED,
      scoringModelVersion: SCORING_MODEL_VERSION,
      startedAt: new Date(baselineRunAt.getTime() - 1000 * 60 * 8),
      completedAt: baselineRunAt,
      createdAt: baselineRunAt,
      scorecard: {
        create: {
          overallScore: baseline.scoring.scorecard.overallScore,
          architectureScore: baseline.dimensions.architectureScore,
          performanceScore: baseline.dimensions.performanceScore,
          scalabilityScore: baseline.dimensions.scalabilityScore,
          maintainabilityScore: baseline.dimensions.maintainabilityScore,
          operabilityScore: baseline.dimensions.operabilityScore,
          breakdownJson: baseline.scoring.scorecard.dimensions,
        },
      },
      risks: {
        create: baseline.scoring.risks.map((risk) => ({
          title: risk.title,
          category: risk.category,
          severity: risk.severity,
          likelihood: risk.likelihood,
          impact: risk.impact,
          priority: risk.priority,
          description: risk.description,
          evidenceJson: { source: "demo-seed", cohort: "baseline" },
        })),
      },
      recommendations: {
        create: baseline.scoring.recommendations.map((recommendation) => ({
          title: recommendation.title,
          category: recommendation.category,
          priority: recommendation.priority,
          effort: recommendation.effort,
          expectedImpact: recommendation.expectedImpact,
          description: recommendation.description,
        })),
      },
      executiveReport: {
        create: {
          executiveSummary: baseline.deterministicReport.executiveSummary,
          technicalSummary: baseline.deterministicReport.technicalSummary,
          roadmapJson: baseline.deterministicReport.roadmap,
          artifactsJson: {
            deterministic: baseline.deterministicReport,
            ai: null,
          },
          generatedAt: baselineRunAt,
        },
      },
    },
  });

  const improvedAssessment = await prisma.assessment.create({
    data: {
      workspaceId: workspace.id,
      applicationId: application.id,
      createdById: user.id,
      questionnaireVersion: QUESTIONNAIRE_VERSION,
      status: AssessmentStatus.ANALYZED,
      submittedAt: improvedRunAt,
    },
  });

  await prisma.assessmentAnswer.createMany({
    data: buildAnswerRows(improvedAnswers, improvedAssessment.id),
  });

  const improved = buildRunArtifacts(improvedAnswers, application.name);

  const improvedRun = await prisma.analysisRun.create({
    data: {
      assessmentId: improvedAssessment.id,
      status: AnalysisRunStatus.COMPLETED,
      scoringModelVersion: SCORING_MODEL_VERSION,
      aiModel: "demo/openrouter-free",
      startedAt: new Date(improvedRunAt.getTime() - 1000 * 60 * 6),
      completedAt: improvedRunAt,
      createdAt: improvedRunAt,
      scorecard: {
        create: {
          overallScore: improved.scoring.scorecard.overallScore,
          architectureScore: improved.dimensions.architectureScore,
          performanceScore: improved.dimensions.performanceScore,
          scalabilityScore: improved.dimensions.scalabilityScore,
          maintainabilityScore: improved.dimensions.maintainabilityScore,
          operabilityScore: improved.dimensions.operabilityScore,
          breakdownJson: improved.scoring.scorecard.dimensions,
        },
      },
      risks: {
        create: improved.scoring.risks.map((risk) => ({
          title: risk.title,
          category: risk.category,
          severity: risk.severity,
          likelihood: risk.likelihood,
          impact: risk.impact,
          priority: risk.priority,
          description: risk.description,
          evidenceJson: { source: "demo-seed", cohort: "improved" },
        })),
      },
      recommendations: {
        create: improved.scoring.recommendations.map((recommendation) => ({
          title: recommendation.title,
          category: recommendation.category,
          priority: recommendation.priority,
          effort: recommendation.effort,
          expectedImpact: recommendation.expectedImpact,
          description: recommendation.description,
        })),
      },
      executiveReport: {
        create: {
          executiveSummary: improved.deterministicReport.executiveSummary,
          technicalSummary: improved.deterministicReport.technicalSummary,
          roadmapJson: improved.deterministicReport.roadmap,
          artifactsJson: {
            deterministic: improved.deterministicReport,
            ai: {
              provider: "openrouter",
              model: "demo/free",
              enriched: {
                executivePolish:
                  "The platform now shows a materially more stable architecture posture, with clearer readiness for enterprise growth and lower near-term delivery friction.",
                businessFraming:
                  "The latest run suggests the program has moved from reactive stabilization into a more investable modernization phase, which is the right moment to formalize standards before scale accelerates again.",
                roadmapRefinement: [
                  {
                    phase: "Phase 1",
                    title: "Consolidate operating standards",
                    rationale:
                      "Protect recent improvements with explicit delivery and architecture guardrails.",
                  },
                  {
                    phase: "Phase 2",
                    title: "Scale performance discipline",
                    rationale:
                      "Expand observability and capacity planning before transaction volume grows further.",
                  },
                  {
                    phase: "Phase 3",
                    title: "Institutionalize review cadence",
                    rationale:
                      "Use recurring score snapshots to convert architecture quality into a managed operating metric.",
                  },
                ],
              },
            },
          },
          generatedAt: improvedRunAt,
        },
      },
    },
  });

  console.log("Demo workspace seeded successfully.");
  console.log(`User: ${DEMO_USER_EMAIL}`);
  console.log(`Workspace: /workspaces/${workspace.slug}`);
  console.log(
    `Application: /workspaces/${workspace.slug}/applications/${application.slug}`,
  );
  console.log(
    `Latest report: /workspaces/${workspace.slug}/applications/${application.slug}/reports/${improvedRun.id}`,
  );
}

main()
  .catch((error) => {
    console.error("Failed to seed demo workspace.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
