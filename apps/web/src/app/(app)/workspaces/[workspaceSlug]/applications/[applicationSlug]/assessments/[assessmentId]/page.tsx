import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  FormSubmissionHint,
  PendingFieldset,
} from "@/components/form/form-pending-state";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { formatMessage } from "@/lib/format-message";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";
import { getAiProviderConfig } from "@/lib/ai-provider";
import { enrichAssessmentReportAction } from "@/modules/assessments/application/enrich-assessment-report";
import { saveAssessmentDraftAction } from "@/modules/assessments/application/save-assessment-draft";
import { submitAssessmentAction } from "@/modules/assessments/application/submit-assessment";
import { getAssessmentById } from "@/modules/assessments/application/get-assessment-by-id";
import { assessmentQuestionnaireV1, getAssessmentQuestionnaire } from "@/modules/assessments/questionnaire";
import {
  resolveLocalizedAiArtifact,
  resolveLocalizedDeterministicArtifact,
  resolveLocalizedRecommendationItems,
  resolveLocalizedRiskItems,
} from "@/modules/reports/presentation/localized-report-artifacts";
import { getAssessmentStatusTone } from "@/modules/reports/presentation/status";
import {
  getVisualCategoryLabel,
  getVisualPriorityLabel,
} from "@/modules/reports/presentation/visual-labels";

export default async function AssessmentDraftPage({
  params,
}: {
  params: Promise<{
    workspaceSlug: string;
    applicationSlug: string;
    assessmentId: string;
  }>;
}) {
  const { workspaceSlug, applicationSlug, assessmentId } = await params;
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const assessment = await getAssessmentById(assessmentId, session!.user!.id!);

  if (
    !assessment ||
    assessment.application.slug !== applicationSlug ||
    assessment.application.workspace.slug !== workspaceSlug
  ) {
    notFound();
  }

  const answersByQuestionKey = new Map(
    assessment.answers.map((answer) => [answer.questionKey, answer]),
  );
  const totalQuestions = assessmentQuestionnaireV1.reduce(
    (sum, section) => sum + section.questions.length,
    0,
  );
  const questionnaire = getAssessmentQuestionnaire(locale);
  const latestAnalysisRun = assessment.analysisRuns[0];
  const latestScorecard = latestAnalysisRun?.scorecard;
  const latestExecutiveReport = latestAnalysisRun?.executiveReport;
  const aiConfig = getAiProviderConfig();
  const localizedDeterministicReport = latestExecutiveReport
    ? resolveLocalizedDeterministicArtifact(latestExecutiveReport, locale)
    : null;
  const localizedRiskItems = latestExecutiveReport
    ? resolveLocalizedRiskItems(latestExecutiveReport, locale)
    : null;
  const localizedRecommendations = latestExecutiveReport
    ? resolveLocalizedRecommendationItems(latestExecutiveReport, locale)
    : null;
  const aiArtifacts = latestExecutiveReport
    ? resolveLocalizedAiArtifact(latestExecutiveReport, locale)
    : null;
  const canSubmit = assessment.answers.length === totalQuestions;
  const canEnrichWithAi = !!latestScorecard && aiConfig.isConfigured;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">
          {dict.assessment.draftEyebrow}
        </p>
        <h1 className="text-3xl font-semibold">{assessment.application.name}</h1>
        <p className="max-w-3xl text-sm text-muted">
          {formatMessage(dict.assessment.questionnaireIntro, {
            version: assessment.questionnaireVersion,
          })}
        </p>
        <p className="text-sm text-muted">
          {formatMessage(dict.assessment.progress, {
            answered: assessment.answers.length,
            total: totalQuestions,
          })}
        </p>
        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs ${getAssessmentStatusTone(
            assessment.status,
          )}`}
        >
          {dict.report.statuses.assessment[assessment.status] ?? assessment.status}
        </span>
        {latestAnalysisRun?.scorecard && latestExecutiveReport ? (
          <Link
            href={withLocale(
              locale,
              `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${latestAnalysisRun.id}`,
            )}
            className="inline-flex rounded-md border border-border px-4 py-2 text-sm text-foreground"
          >
            {dict.assessment.openFullReport}
          </Link>
        ) : null}
      </div>

      {latestScorecard ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {dict.assessment.deterministicScore}
              </p>
              <h2 className="text-2xl font-semibold">
                {formatMessage(dict.assessment.overallScore, {
                  score: latestScorecard.overallScore,
                })}
              </h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-sm text-muted">
              {dict.report.statuses.assessment[assessment.status] ?? assessment.status}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="font-medium">{dict.assessment.dimensions}</h3>
              <div className="mt-3 space-y-2 text-sm text-muted">
                <p>{dict.report.architecture}: {latestScorecard.architectureScore}/100</p>
                <p>{dict.report.performance}: {latestScorecard.performanceScore}/100</p>
                <p>{dict.report.scalability}: {latestScorecard.scalabilityScore}/100</p>
                <p>{dict.report.maintainability}: {latestScorecard.maintainabilityScore}/100</p>
                <p>{dict.report.operability}: {latestScorecard.operabilityScore}/100</p>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-background p-4">
              <h3 className="font-medium">{dict.assessment.priorityRisks}</h3>
              <div className="mt-3 space-y-3 text-sm text-muted">
                {(localizedRiskItems ?? latestAnalysisRun?.risks)?.length ? (
                  (localizedRiskItems ?? latestAnalysisRun?.risks ?? [])
                    .slice(0, 3)
                    .map((risk, index) => (
                      <div
                        key={`${risk.title}-${index}`}
                      >
                      <p className="font-medium text-foreground">{risk.title}</p>
                      <p>
                        {getVisualPriorityLabel(risk.priority, dict.report.visualLabels)} ·{" "}
                        {getVisualCategoryLabel(risk.category, dict.report.visualLabels)} ·{" "}
                        {risk.description}
                      </p>
                    </div>
                    ))
                ) : (
                  <p>{dict.assessment.noRisks}</p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <h3 className="font-medium">{dict.assessment.topRecommendations}</h3>
            <div className="mt-3 space-y-3 text-sm text-muted">
              {(localizedRecommendations ?? latestAnalysisRun?.recommendations)?.length ? (
                (localizedRecommendations ?? latestAnalysisRun?.recommendations ?? [])
                  .slice(0, 3)
                  .map((recommendation, index) => (
                    <div
                      key={`${recommendation.title}-${index}`}
                    >
                      <p className="font-medium text-foreground">
                        {recommendation.title}
                      </p>
                      <p>
                        {getVisualPriorityLabel(
                          recommendation.priority,
                          dict.report.visualLabels,
                        )}{" "}
                        ·{" "}
                        {getVisualCategoryLabel(
                          recommendation.category,
                          dict.report.visualLabels,
                        )}{" "}
                        · {recommendation.description}
                      </p>
                    </div>
                  ))
              ) : (
                <p>{dict.assessment.noRecommendations}</p>
              )}
            </div>
          </div>

          {latestExecutiveReport ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="font-medium">{dict.assessment.executiveSummary}</h3>
                <p className="mt-3 text-sm text-muted">
                  {localizedDeterministicReport?.executiveSummary}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <h3 className="font-medium">{dict.assessment.technicalSummary}</h3>
                <p className="mt-3 text-sm text-muted">
                  {localizedDeterministicReport?.technicalSummary}
                </p>
              </div>
            </div>
          ) : null}

          {latestExecutiveReport ? (
            <div className="mt-4 rounded-lg border border-border bg-background p-4">
              <h3 className="font-medium">{dict.assessment.suggestedRoadmap}</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-3">
                {Array.isArray(localizedDeterministicReport?.roadmap)
                  ? localizedDeterministicReport.roadmap.map((item, index) => {
                      if (
                        typeof item !== "object" ||
                        !item ||
                        !("phase" in item) ||
                        !("title" in item) ||
                        !("rationale" in item)
                      ) {
                        return null;
                      }

                      return (
                        <div
                          key={`${item.phase}-${index}`}
                          className="rounded-lg border border-border p-4"
                        >
                          <p className="text-xs uppercase tracking-[0.2em] text-muted">
                            {String(item.phase)}
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {String(item.title)}
                          </p>
                          <p className="mt-2 text-sm text-muted">
                            {String(item.rationale)}
                          </p>
                        </div>
                      );
                    })
                  : null}
              </div>
            </div>
          ) : null}

          <div className="mt-4 rounded-lg border border-border bg-background p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-medium">{dict.assessment.aiLayer}</h3>
                <p className="mt-2 text-sm text-muted">
                  {formatMessage(dict.assessment.aiLayerDescription, {
                    provider: aiConfig.label,
                  })}
                </p>
              </div>
              <form action={enrichAssessmentReportAction}>
                <PendingFieldset className="space-y-3">
                  <input type="hidden" name="assessmentId" value={assessment.id} />
                  <PendingSubmitButton
                    pendingLabel={dict.assessment.enrichingAi}
                    disabled={!canEnrichWithAi}
                    variant="secondary"
                  >
                    {dict.assessment.enrichAi}
                  </PendingSubmitButton>
                  <FormSubmissionHint
                    idleMessage={dict.assessment.enrichIdleHint}
                    pendingMessage={dict.assessment.enrichPendingHint}
                    idleLabel={dict.common.ready}
                    pendingLabel={dict.common.processing}
                    className="max-w-sm"
                  />
                </PendingFieldset>
              </form>
            </div>

            {!canEnrichWithAi ? (
              <p className="mt-3 text-sm text-muted">
                {formatMessage(dict.assessment.configureApiKey, {
                  apiKey:
                    aiConfig.provider === "openrouter"
                      ? "OPENROUTER_API_KEY"
                      : "OPENAI_API_KEY",
                })}
              </p>
            ) : null}

            {aiArtifacts &&
            typeof aiArtifacts === "object" &&
            "enriched" in aiArtifacts &&
            typeof aiArtifacts.enriched === "object" &&
            aiArtifacts.enriched &&
            "executivePolish" in aiArtifacts.enriched &&
            "businessFraming" in aiArtifacts.enriched &&
            "roadmapRefinement" in aiArtifacts.enriched ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-border p-4 text-sm text-muted">
                  Generated with{" "}
                  {"provider" in aiArtifacts ? String(aiArtifacts.provider) : aiConfig.provider}
                  {" · "}
                  {"model" in aiArtifacts ? String(aiArtifacts.model) : aiConfig.model}
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-medium">{dict.assessment.executivePolish}</h4>
                  <p className="mt-2 text-sm text-muted">
                    {String(aiArtifacts.enriched.executivePolish)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-medium">{dict.assessment.businessFraming}</h4>
                  <p className="mt-2 text-sm text-muted">
                    {String(aiArtifacts.enriched.businessFraming)}
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <h4 className="font-medium">{dict.assessment.roadmapRefinement}</h4>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    {Array.isArray(aiArtifacts.enriched.roadmapRefinement)
                      ? (aiArtifacts.enriched.roadmapRefinement as unknown[]).map((item, index) => {
                          if (
                            typeof item !== "object" ||
                            !item ||
                            !("phase" in item) ||
                            !("title" in item) ||
                            !("rationale" in item)
                          ) {
                            return null;
                          }

                          return (
                            <div
                              key={`${String(item.phase)}-${index}`}
                              className="rounded-lg border border-border p-4"
                            >
                              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                                {String(item.phase)}
                              </p>
                              <p className="mt-2 font-medium text-foreground">
                                {String(item.title)}
                              </p>
                              <p className="mt-2 text-sm text-muted">
                                {String(item.rationale)}
                              </p>
                            </div>
                          );
                        })
                      : null}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <form action={saveAssessmentDraftAction} className="space-y-6">
        <PendingFieldset className="space-y-6">
          <input type="hidden" name="assessmentId" value={assessment.id} />

          {questionnaire.map((section) => (
            <section
              key={section.key}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="mb-6 space-y-2">
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {section.key}
                </p>
                <h2 className="text-2xl font-semibold">{section.title}</h2>
                <p className="text-sm text-muted">{section.description}</p>
              </div>

              <div className="space-y-6">
                {section.questions.map((question) => {
                  const savedAnswer = answersByQuestionKey.get(question.key);
                  const savedValue =
                    typeof savedAnswer?.valueJson === "object" &&
                    savedAnswer?.valueJson &&
                    "selectedValue" in savedAnswer.valueJson
                      ? String(savedAnswer.valueJson.selectedValue)
                      : "";

                  return (
                    <div
                      key={question.key}
                      className="rounded-lg border border-border bg-background p-5"
                    >
                      <div className="mb-4 space-y-1">
                        <label className="text-base font-medium">{question.label}</label>
                        <p className="text-sm text-muted">{question.help}</p>
                      </div>

                      <div className="grid gap-3 md:grid-cols-2">
                        {question.options.map((option) => (
                          <label
                            key={option.value}
                            className="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4 text-sm"
                          >
                            <input
                              type="radio"
                              name={question.key}
                              value={option.value}
                              defaultChecked={savedValue === option.value}
                              className="mt-1 disabled:cursor-not-allowed"
                            />
                            <span>
                              <span className="block font-medium text-foreground">
                              {option.label}
                            </span>
                            <span className="block text-muted">
                                {formatMessage(dict.assessment.scoreSignal, {
                                  value: option.normalizedValue,
                                })}
                            </span>
                          </span>
                        </label>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="font-medium">{dict.assessment.draftPersistence}</p>
                <p className="text-sm text-muted">
                  {dict.assessment.draftPersistenceDescription}
                </p>
                <FormSubmissionHint
                  idleMessage={dict.assessment.saveIdleHint}
                  pendingMessage={dict.assessment.savePendingHint}
                  idleLabel={dict.common.ready}
                  pendingLabel={dict.common.processing}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <PendingSubmitButton pendingLabel={dict.assessment.savingDraft}>
                  {dict.assessment.saveDraft}
                </PendingSubmitButton>
                <PendingSubmitButton
                  formAction={submitAssessmentAction}
                  disabled={!canSubmit}
                  pendingLabel={dict.assessment.scoringAssessment}
                  variant="secondary"
                >
                  {dict.assessment.submitAndScore}
                </PendingSubmitButton>
              </div>
            </div>
          </div>
        </PendingFieldset>
      </form>
    </div>
  );
}
