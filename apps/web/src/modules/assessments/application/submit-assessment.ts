"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AnalysisRunStatus, AssessmentStatus, prisma } from "@seventec-atlas/db";
import { calculateDeterministicScorecard } from "@seventec-atlas/scoring-core";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import { defaultLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import {
  buildDeterministicExecutiveReport,
  buildLocalizedRecommendationItems,
  buildLocalizedRiskItems,
} from "../reporting/deterministic-report";
import { buildLocalizedDeterministicArtifacts } from "@/modules/reports/presentation/localized-report-artifacts";
import { assessmentQuestionnaireV1 } from "../questionnaire";

const SCORING_MODEL_VERSION = "atlas-score-v1";

export async function submitAssessmentAction(formData: FormData) {
  let successPath: string | null = null;
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  try {
    const userId = await getCurrentUserId();
    const assessmentId = String(formData.get("assessmentId") ?? "");

    if (!assessmentId) {
      throw new Error("Assessment id is required");
    }

    const assessment = await prisma.assessment.findFirst({
      where: {
        id: assessmentId,
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
      include: {
        application: {
          include: {
            workspace: true,
          },
        },
        answers: true,
        analysisRuns: {
          include: {
            scorecard: true,
            risks: true,
            recommendations: true,
            executiveReport: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const totalQuestions = assessmentQuestionnaireV1.reduce(
      (sum, section) => sum + section.questions.length,
      0,
    );

    if (assessment.answers.length < totalQuestions) {
      throw new Error("Assessment is incomplete");
    }

    const scoring = calculateDeterministicScorecard(
      assessment.answers.map((answer) => ({
        sectionKey: answer.sectionKey,
        questionKey: answer.questionKey,
        normalizedValue: answer.normalizedValue,
      })),
      totalQuestions,
    );
    const architectureScore =
      scoring.scorecard.dimensions.find((d) => d.key === "architecture")?.score ?? 0;
    const performanceScore =
      scoring.scorecard.dimensions.find((d) => d.key === "performance")?.score ?? 0;
    const scalabilityScore =
      scoring.scorecard.dimensions.find((d) => d.key === "scalability")?.score ?? 0;
    const maintainabilityScore =
      scoring.scorecard.dimensions.find((d) => d.key === "maintainability")?.score ?? 0;
    const operabilityScore =
      scoring.scorecard.dimensions.find((d) => d.key === "operability")?.score ?? 0;
    const deterministicReportInput = {
      applicationName: assessment.application.name,
      overallScore: scoring.scorecard.overallScore,
      architectureScore,
      performanceScore,
      scalabilityScore,
      maintainabilityScore,
      topRiskTitles: scoring.risks.map((risk) => risk.title),
    };
    const deterministicReportsByLocale = Object.fromEntries(
      locales.map((currentLocale) => {
        const scoreByCategory = {
          architecture: architectureScore,
          performance: performanceScore,
          scalability: scalabilityScore,
          maintainability: maintainabilityScore,
        } as const;

        return [
          currentLocale,
          {
            deterministic: buildDeterministicExecutiveReport(
              deterministicReportInput,
              currentLocale,
            ),
            risks: buildLocalizedRiskItems(scoring.risks, scoreByCategory, currentLocale),
            recommendations: buildLocalizedRecommendationItems(
              scoring.recommendations,
              scoreByCategory,
              currentLocale,
            ),
          },
        ];
      }),
    ) as Record<
      (typeof locales)[number],
      {
        deterministic: ReturnType<typeof buildDeterministicExecutiveReport>;
        risks: ReturnType<typeof buildLocalizedRiskItems>;
        recommendations: ReturnType<typeof buildLocalizedRecommendationItems>;
      }
    >;
    const defaultDeterministicReport =
      deterministicReportsByLocale[defaultLocale].deterministic;

    const existingRun = assessment.analysisRuns[0];

    if (existingRun) {
      await prisma.$transaction([
        prisma.riskItem.deleteMany({ where: { analysisRunId: existingRun.id } }),
        prisma.recommendation.deleteMany({ where: { analysisRunId: existingRun.id } }),
        prisma.scorecard.deleteMany({ where: { analysisRunId: existingRun.id } }),
        prisma.analysisRun.update({
          where: { id: existingRun.id },
          data: {
            status: AnalysisRunStatus.COMPLETED,
            scoringModelVersion: SCORING_MODEL_VERSION,
            startedAt: existingRun.startedAt ?? new Date(),
            completedAt: new Date(),
            errorMessage: null,
            scorecard: {
              create: {
                overallScore: scoring.scorecard.overallScore,
                architectureScore,
                performanceScore,
                scalabilityScore,
                maintainabilityScore,
                operabilityScore,
                breakdownJson: scoring.scorecard.dimensions,
              },
            },
            risks: {
              create: scoring.risks.map((risk) => ({
                title: risk.title,
                category: risk.category,
                severity: risk.severity,
                likelihood: risk.likelihood,
                impact: risk.impact,
                priority: risk.priority,
                description: risk.description,
                evidenceJson: { source: "deterministic-scoring-v1" },
              })),
            },
            recommendations: {
              create: scoring.recommendations.map((recommendation) => ({
                title: recommendation.title,
                category: recommendation.category,
                priority: recommendation.priority,
                effort: recommendation.effort,
                expectedImpact: recommendation.expectedImpact,
                description: recommendation.description,
              })),
            },
            executiveReport: {
              upsert: {
                update: {
                  executiveSummary: defaultDeterministicReport.executiveSummary,
                  technicalSummary: defaultDeterministicReport.technicalSummary,
                  roadmapJson: defaultDeterministicReport.roadmap,
                  artifactsJson: buildLocalizedDeterministicArtifacts(
                    deterministicReportsByLocale,
                    existingRun.executiveReport?.artifactsJson,
                  ),
                  generatedAt: new Date(),
                },
                create: {
                  executiveSummary: defaultDeterministicReport.executiveSummary,
                  technicalSummary: defaultDeterministicReport.technicalSummary,
                  roadmapJson: defaultDeterministicReport.roadmap,
                  artifactsJson: buildLocalizedDeterministicArtifacts(
                    deterministicReportsByLocale,
                  ),
                },
              },
            },
          },
        }),
        prisma.assessment.update({
          where: { id: assessment.id },
          data: {
            status: AssessmentStatus.ANALYZED,
            submittedAt: new Date(),
          },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.analysisRun.create({
          data: {
            assessmentId: assessment.id,
            status: AnalysisRunStatus.COMPLETED,
            scoringModelVersion: SCORING_MODEL_VERSION,
            startedAt: new Date(),
            completedAt: new Date(),
            scorecard: {
              create: {
                overallScore: scoring.scorecard.overallScore,
                architectureScore,
                performanceScore,
                scalabilityScore,
                maintainabilityScore,
                operabilityScore,
                breakdownJson: scoring.scorecard.dimensions,
              },
            },
            risks: {
              create: scoring.risks.map((risk) => ({
                title: risk.title,
                category: risk.category,
                severity: risk.severity,
                likelihood: risk.likelihood,
                impact: risk.impact,
                priority: risk.priority,
                description: risk.description,
                evidenceJson: { source: "deterministic-scoring-v1" },
              })),
            },
            recommendations: {
              create: scoring.recommendations.map((recommendation) => ({
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
                executiveSummary: defaultDeterministicReport.executiveSummary,
                technicalSummary: defaultDeterministicReport.technicalSummary,
                roadmapJson: defaultDeterministicReport.roadmap,
                artifactsJson: buildLocalizedDeterministicArtifacts(
                  deterministicReportsByLocale,
                ),
              },
            },
          },
        }),
        prisma.assessment.update({
          where: { id: assessment.id },
          data: {
            status: AssessmentStatus.ANALYZED,
            submittedAt: new Date(),
          },
        }),
      ]);
    }

    revalidatePath(
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );
    revalidatePath(
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}`,
    );
    revalidatePath("/dashboard");

    await setFlashMessage({
      type: "success",
      title: dict.flash.assessmentAnalyzedTitle,
      description: dict.flash.assessmentAnalyzedDescription,
    });
    successPath = withLocale(
      locale,
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.assessmentAnalyzeErrorTitle,
      description: dict.flash.assessmentAnalyzeErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/dashboard")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
