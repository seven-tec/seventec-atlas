import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { ExportPdfButton } from "@/components/report/export-pdf-button";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { formatMessage } from "@/lib/format-message";
import { getApplicationReportHistory } from "@/modules/reports/application/get-application-report-history";
import { getReportByRunId } from "@/modules/reports/application/get-report-by-run-id";
import {
  buildImprovementNarrative,
  buildScoreDeltas,
} from "@/modules/reports/presentation/compare-runs";
import {
  resolveLocalizedAiArtifact,
  resolveLocalizedDeterministicArtifact,
  resolveLocalizedRecommendationItems,
  resolveLocalizedRiskItems,
} from "@/modules/reports/presentation/localized-report-artifacts";
import {
  getAssessmentStatusTone,
  getDeltaTone,
  getRunStatusTone,
} from "@/modules/reports/presentation/status";
import {
  getVisualCategoryLabel,
  getVisualEffortLabel,
  getVisualPriorityLabel,
  getVisualSeverityLabel,
} from "@/modules/reports/presentation/visual-labels";

function getPriorityTone(priority: string) {
  switch (priority) {
    case "CRITICAL":
      return "border-rose-500/40 bg-rose-500/10 text-rose-100";
    case "HIGH":
      return "border-amber-500/40 bg-amber-500/10 text-amber-100";
    default:
      return "border-border bg-background text-muted";
  }
}

function getRunStatusLabel(
  status: string,
  labels: Record<string, string>,
) {
  return labels[status] ?? status;
}

export default async function ReportPage({
  params,
  searchParams,
}: {
  params: Promise<{
    workspaceSlug: string;
    applicationSlug: string;
    runId: string;
  }>;
  searchParams?: Promise<{ view?: string }>;
}) {
  const { workspaceSlug, applicationSlug, runId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const shareReady = resolvedSearchParams?.view === "share";
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const dateLocale = locale === "es" ? "es-CL" : "en-US";
  const userId = session!.user!.id!;
  const report = await getReportByRunId(
    workspaceSlug,
    applicationSlug,
    runId,
    userId,
  );
  const history = await getApplicationReportHistory(
    workspaceSlug,
    applicationSlug,
    userId,
  );

  if (!report || !report.scorecard || !report.executiveReport) {
    notFound();
  }

  const { assessment, scorecard, executiveReport } = report;
  const localizedDeterministicReport = resolveLocalizedDeterministicArtifact(
    executiveReport,
    locale,
  );
  const localizedRiskItems = resolveLocalizedRiskItems(executiveReport, locale);
  const localizedRecommendations = resolveLocalizedRecommendationItems(
    executiveReport,
    locale,
  );
  const aiArtifacts = resolveLocalizedAiArtifact(executiveReport, locale);

  const currentRunIndex = history.findIndex((item) => item.id === report.id);
  const latestRun = history[0];
  const previousRun = currentRunIndex >= 0 ? history[currentRunIndex + 1] : null;
  const comparisonDeltas =
    previousRun?.scorecard && report.scorecard
      ? buildScoreDeltas(report.scorecard, previousRun.scorecard, dict.report.labels)
      : null;
  const improvementNarrative = comparisonDeltas
    ? buildImprovementNarrative(comparisonDeltas, dict.report.narrative)
    : dict.report.narrative.firstRun;
  const reportTitle = `${assessment.application.name} ${dict.report.titleSuffix}`;

  return (
    <div className={`mx-auto ${shareReady ? "max-w-5xl" : "max-w-6xl"} space-y-8`}>
      <section className="print-cover rounded-3xl border border-border bg-surface p-8 print-surface">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.28em] text-muted print-muted">
                SevenTec Atlas
              </p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-tight">
                {reportTitle}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted print-muted">
                {dict.report.coverDescription}
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted print-muted">
                  {dict.report.workspace}
                </p>
                <p className="mt-2 font-medium text-foreground">
                  {assessment.application.workspace.name}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted print-muted">
                  {dict.report.application}
                </p>
                <p className="mt-2 font-medium text-foreground">
                  {assessment.application.name}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted print-muted">
                  {dict.report.reportDate}
                </p>
                <p className="mt-2 font-medium text-foreground">
                  {executiveReport.generatedAt.toLocaleString(dateLocale)}
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted print-muted">
                  {dict.report.overallScore}
                </p>
                <p className="mt-2 text-2xl font-semibold text-foreground">
                  {scorecard.overallScore}/100
                </p>
              </div>
            </div>
          </div>

          {!shareReady ? (
            <div className="flex flex-wrap gap-3 print:hidden">
              <Link
                href={withLocale(
                  locale,
                  `/workspaces/${workspaceSlug}/applications/${applicationSlug}`,
                )}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground"
              >
                {dict.report.backToApplication}
              </Link>
              <Link
                href={withLocale(
                  locale,
                  `/workspaces/${workspaceSlug}/applications/${applicationSlug}/assessments/${assessment.id}`,
                )}
                className="rounded-md border border-accent bg-accent px-4 py-2 text-sm text-background"
              >
                {dict.report.openAssessment}
              </Link>
              <Link
                href={withLocale(
                  locale,
                  `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${report.id}`,
                ) + "?view=share"}
                className="rounded-md border border-border px-4 py-2 text-sm text-foreground"
              >
                {dict.report.shareReadyView}
              </Link>
              <ExportPdfButton label={dict.report.exportPdf} />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted print-card print-muted">
              {dict.report.shareReadyMode}
            </div>
          )}
        </div>
      </section>

      <div className="flex flex-wrap items-start justify-between gap-4 print:hidden">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            {shareReady ? dict.report.shareReadyReport : dict.report.reportVersion}
          </p>
          <div>
            <h2 className="text-3xl font-semibold">{assessment.application.name}</h2>
            <p className="mt-2 max-w-3xl text-sm text-muted">
              {dict.report.premiumDescription}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted">
            <span className="rounded-full border border-border px-3 py-1">
              {dict.report.runLabel} {report.id}
            </span>
            <span
              className={`rounded-full border px-3 py-1 ${getRunStatusTone(report.status)}`}
            >
              {dict.report.runLabel}{" "}
              {getRunStatusLabel(report.status, dict.report.statuses.run)}
            </span>
            <span
              className={`rounded-full border px-3 py-1 ${getAssessmentStatusTone(
                assessment.status,
              )}`}
            >
              {dict.report.assessmentLabel}{" "}
              {getRunStatusLabel(assessment.status, dict.report.statuses.assessment)}
            </span>
            <span className="rounded-full border border-border px-3 py-1">
              {dict.report.generatedAt} {executiveReport.generatedAt.toLocaleString(dateLocale)}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <ExportPdfButton label={dict.report.exportPdf} />
        </div>
      </div>

      {!shareReady ? (
        <section className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.report.runNavigation}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dict.report.latestPreviousReports}
                </h2>
              </div>
              {latestRun ? (
                <Link
                  href={withLocale(
                    locale,
                    `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${latestRun.id}`,
                  )}
                  className="rounded-md border border-border px-3 py-2 text-sm text-foreground"
                >
                  {dict.report.jumpToLatest}
                </Link>
              ) : null}
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {dict.report.current}
                </p>
                <p className="mt-2 font-medium text-foreground">
                  {dict.report.runLabel} {report.id}
                </p>
                <p className="mt-1 text-sm text-muted">
                  {dict.report.labels.overall} {scorecard.overallScore}/100
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 print-card">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {dict.report.previous}
                </p>
                {previousRun?.scorecard ? (
                  <>
                    <p className="mt-2 font-medium text-foreground">
                      {dict.report.runLabel} {previousRun.id}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {dict.report.labels.overall} {previousRun.scorecard.overallScore}/100
                    </p>
                    <Link
                      href={withLocale(
                        locale,
                        `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${previousRun.id}`,
                      )}
                      className="mt-4 inline-flex rounded-md border border-border px-3 py-2 text-sm text-foreground"
                    >
                      {dict.report.openPrevious}
                    </Link>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted">{dict.report.noPreviousReport}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
            <p className="text-xs uppercase tracking-[0.24em] text-muted">
              {dict.report.shareReadyExport}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">
              {dict.report.clientSafePresentation}
            </h2>
            <p className="mt-3 text-sm leading-6 text-muted">
              {dict.report.shareReadyDescription}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={withLocale(
                  locale,
                  `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${report.id}`,
                ) + "?view=share"}
                className="rounded-md border border-accent bg-accent px-4 py-2 text-sm text-background"
              >
                {dict.report.openShareReady}
              </Link>
              <ExportPdfButton label={dict.report.exportPdf} />
            </div>
          </div>
        </section>
      ) : null}

      {!shareReady ? (
        <section className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.report.compareRuns}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dict.report.scoreDeltasNarrative}
                </h2>
              </div>
            {previousRun ? (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {formatMessage(dict.report.comparedAgainstRun, {
                  runId: previousRun.id,
                })}
              </span>
            ) : (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {dict.report.baselineRun}
              </span>
            )}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-background p-5 print-card">
            <p className="text-sm leading-7 text-muted">{improvementNarrative}</p>
          </div>

          {comparisonDeltas ? (
            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {comparisonDeltas.map((item) => (
                <div
                  key={item.key}
                  className={`rounded-xl border p-4 print-card print-avoid-break ${getDeltaTone(
                    item.direction,
                  )}`}
                >
                  <p className="text-xs uppercase tracking-[0.2em]">{item.label}</p>
                  <div className="mt-3 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-2xl font-semibold text-foreground">
                        {item.current}
                      </p>
                      <p className="text-xs text-muted">{dict.report.deltaCurrent}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-medium text-foreground">
                        {item.delta > 0 ? `+${item.delta}` : item.delta}
                      </p>
                      <p className="text-xs text-muted">
                        {formatMessage(dict.report.deltaVsPrevious, {
                          value: item.previous,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      ) : null}

      {!shareReady ? (
        <section className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {dict.report.analysisRunHistory}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{dict.report.reportLineage}</h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {formatMessage(dict.report.runsCount, { count: history.length })}
            </span>
          </div>

          <div className="mt-6 space-y-3">
            {history.map((run) => (
              <Link
                key={run.id}
                  href={withLocale(
                    locale,
                    `/workspaces/${workspaceSlug}/applications/${applicationSlug}/reports/${run.id}`,
                  )}
                  className={`block rounded-xl border p-4 print-card ${
                  run.id === report.id
                    ? "border-accent bg-accent/10"
                    : "border-border bg-background"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-foreground">
                        {dict.report.runLabel} {run.id}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] ${getRunStatusTone(
                          run.status,
                        )}`}
                      >
                        {getRunStatusLabel(run.status, dict.report.statuses.run)}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] ${getAssessmentStatusTone(
                          run.assessment.status,
                        )}`}
                      >
                        {getRunStatusLabel(
                          run.assessment.status,
                          dict.report.statuses.assessment,
                        )}
                      </span>
                    </div>
                    <p className="text-xs text-muted">
                      {run.executiveReport?.generatedAt.toLocaleString(dateLocale) ??
                        run.createdAt.toLocaleString(dateLocale)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-semibold text-foreground">
                      {run.scorecard?.overallScore ?? "--"}/100
                    </p>
                    <p className="text-xs text-muted">{dict.report.overallScore}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-5">
        <div className="rounded-2xl border border-border bg-surface p-6 md:col-span-2 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {dict.report.overallScore}
          </p>
          <p className="mt-4 text-5xl font-semibold">{scorecard.overallScore}/100</p>
          <p className="mt-3 text-sm text-muted">
            {dict.report.scoreBaselineDescription}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dict.report.architecture}
          </p>
          <p className="mt-4 text-3xl font-semibold">{scorecard.architectureScore}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dict.report.performance}
          </p>
          <p className="mt-4 text-3xl font-semibold">{scorecard.performanceScore}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dict.report.scalability}
          </p>
          <p className="mt-4 text-3xl font-semibold">{scorecard.scalabilityScore}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dict.report.maintainability}
          </p>
          <p className="mt-4 text-3xl font-semibold">{scorecard.maintainabilityScore}</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">
            {dict.report.operability}
          </p>
          <p className="mt-4 text-3xl font-semibold">{scorecard.operabilityScore}</p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {dict.report.executiveSummary}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
                  {localizedDeterministicReport.executiveSummary}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface print-avoid-break">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {dict.report.technicalSummary}
          </p>
          <p className="mt-4 text-sm leading-7 text-muted">
                  {localizedDeterministicReport.technicalSummary}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-surface p-6 print-surface">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {dict.report.priorityRisks}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">{dict.report.riskMatrix}</h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {formatMessage(dict.report.itemsCount, { count: report.risks.length })}
            </span>
          </div>

          <div className="mt-6 space-y-4">
            {(localizedRiskItems ?? report.risks).map((risk, index) => (
              <div
                key={`${risk.title}-${index}`}
                className={`rounded-xl border p-4 print-card print-avoid-break ${getPriorityTone(
                  risk.priority,
                )}`}
              >
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em]">
                  <span>
                    {getVisualPriorityLabel(risk.priority, dict.report.visualLabels)}
                  </span>
                  <span>·</span>
                  <span>
                    {getVisualCategoryLabel(risk.category, dict.report.visualLabels)}
                  </span>
                  <span>·</span>
                  <span>
                    {getVisualSeverityLabel(risk.severity, dict.report.visualLabels)} /{" "}
                    {getVisualSeverityLabel(risk.likelihood, dict.report.visualLabels)}
                  </span>
                </div>
                <h3 className="mt-3 text-lg font-medium text-foreground">{risk.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{risk.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 print-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {dict.report.recommendedActions}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {dict.report.executionPriorities}
          </h2>

          <div className="mt-6 space-y-4">
            {(localizedRecommendations ?? report.recommendations).map(
              (recommendation, index) => (
              <div
                key={`${recommendation.title}-${index}`}
                className="rounded-xl border border-border p-4 print-card print-avoid-break"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted">
                  <span>
                    {getVisualPriorityLabel(
                      recommendation.priority,
                      dict.report.visualLabels,
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    {getVisualCategoryLabel(
                      recommendation.category,
                      dict.report.visualLabels,
                    )}
                  </span>
                  <span>·</span>
                  <span>
                    {getVisualEffortLabel(
                      recommendation.effort,
                      dict.report.visualLabels,
                    )}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-medium">{recommendation.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {recommendation.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-6 print-surface print-page-break">
        <p className="text-xs uppercase tracking-[0.24em] text-muted">
          {dict.report.suggestedRoadmap}
        </p>
        <h2 className="mt-2 text-2xl font-semibold">
          {dict.report.improvementPathByPhase}
        </h2>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {Array.isArray(localizedDeterministicReport.roadmap)
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
                    key={`${String(item.phase)}-${index}`}
                    className="rounded-xl border border-border bg-background p-5 print-card print-avoid-break"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {String(item.phase)}
                    </p>
                    <h3 className="mt-3 text-lg font-medium text-foreground">
                      {String(item.title)}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {String(item.rationale)}
                    </p>
                  </div>
                );
              })
            : null}
        </div>
      </section>

      {aiArtifacts &&
      typeof aiArtifacts === "object" &&
      "enriched" in aiArtifacts &&
      typeof aiArtifacts.enriched === "object" &&
      aiArtifacts.enriched ? (
        <section className="rounded-2xl border border-border bg-surface p-6 print-surface print-page-break">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-muted">
                {dict.report.aiEnrichment}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {dict.report.executivePolishLayer}
              </h2>
            </div>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
              {("provider" in aiArtifacts ? String(aiArtifacts.provider) : "ai") +
                " · " +
                ("model" in aiArtifacts ? String(aiArtifacts.model) : "unknown")}
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {"executivePolish" in aiArtifacts.enriched ? (
              <div className="rounded-xl border border-border bg-background p-5 print-card print-avoid-break">
                <h3 className="text-lg font-medium">{dict.report.executivePolish}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {String(aiArtifacts.enriched.executivePolish)}
                </p>
              </div>
            ) : null}

            {"businessFraming" in aiArtifacts.enriched ? (
              <div className="rounded-xl border border-border bg-background p-5 print-card print-avoid-break">
                <h3 className="text-lg font-medium">{dict.report.businessFraming}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {String(aiArtifacts.enriched.businessFraming)}
                </p>
              </div>
            ) : null}
          </div>

          {"roadmapRefinement" in aiArtifacts.enriched &&
          Array.isArray(aiArtifacts.enriched.roadmapRefinement) ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {aiArtifacts.enriched.roadmapRefinement.map((item, index) => {
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
                    key={`${String(item.phase)}-ai-${index}`}
                    className="rounded-xl border border-border bg-background p-5 print-card print-avoid-break"
                  >
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {String(item.phase)}
                    </p>
                    <h3 className="mt-3 text-lg font-medium">{String(item.title)}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {String(item.rationale)}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {shareReady ? (
        <section className="rounded-2xl border border-border bg-surface p-6 print-surface">
          <p className="text-xs uppercase tracking-[0.24em] text-muted">
            {dict.report.shareReadyNote}
          </p>
          <p className="mt-3 text-sm leading-6 text-muted">
            {dict.report.shareReadyNoteDescription}
          </p>
        </section>
      ) : null}
    </div>
  );
}
