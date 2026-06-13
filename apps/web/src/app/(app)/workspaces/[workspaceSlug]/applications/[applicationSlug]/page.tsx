import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { EmptyStatePanel } from "@/components/feedback/empty-state-panel";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { formatMessage } from "@/lib/format-message";
import { getApplicationBySlugs } from "@/modules/applications/application/get-application-by-slugs";
import { getAssessmentStatusTone } from "@/modules/reports/presentation/status";

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; applicationSlug: string }>;
}) {
  const { workspaceSlug, applicationSlug } = await params;
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const application = await getApplicationBySlugs(
    workspaceSlug,
    applicationSlug,
    session!.user!.id!,
  );

  if (!application) {
    notFound();
  }

  const latestAnalyzedRun = application.assessments
    .flatMap((assessment) =>
      assessment.analysisRuns.map((run) => ({
        assessment,
        run,
      })),
    )
    .filter((item) => item.run.scorecard && item.run.executiveReport)
    .sort((a, b) => {
      const left = new Date(a.run.completedAt ?? a.run.createdAt).getTime();
      const right = new Date(b.run.completedAt ?? b.run.createdAt).getTime();
      return right - left;
    })[0];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            {dict.application.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold">{application.name}</h1>
          {application.description ? (
            <p className="mt-2 max-w-2xl text-muted">{application.description}</p>
          ) : null}
        </div>
        <Link
          href={withLocale(
            locale,
            `/workspaces/${application.workspace.slug}/applications/${application.slug}/assessments/new`,
          )}
          className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
        >
          {dict.application.createAssessmentDraft}
        </Link>
      </div>

      {latestAnalyzedRun?.run.scorecard && latestAnalyzedRun.run.executiveReport ? (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">
                {dict.application.latestReport}
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                {formatMessage(dict.application.latestReportScore, {
                  score: latestAnalyzedRun.run.scorecard.overallScore,
                })}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {dict.application.latestReportDescription}
              </p>
            </div>
            <Link
              href={withLocale(
                locale,
                `/workspaces/${application.workspace.slug}/applications/${application.slug}/reports/${latestAnalyzedRun.run.id}`,
              )}
              className="rounded-md border border-border px-4 py-2 text-foreground"
            >
              {dict.application.openReport}
            </Link>
          </div>
        </section>
      ) : null}

      <section className="rounded-xl border border-border bg-surface p-6">
        <h2 className="text-xl font-semibold">{dict.application.assessmentDrafts}</h2>
        <div className="mt-4 space-y-3">
          {application.assessments.length === 0 ? (
            <EmptyStatePanel
              eyebrow={dict.application.noDraftEyebrow}
              title={dict.application.noDraftTitle}
              description={dict.application.noDraftDescription}
              primaryAction={{
                href: withLocale(
                  locale,
                  `/workspaces/${application.workspace.slug}/applications/${application.slug}/assessments/new`,
                ),
                label: dict.application.createFirstAssessment,
              }}
              secondaryAction={{
                href: withLocale(locale, `/workspaces/${application.workspace.slug}`),
                label: dict.application.openWorkspace,
              }}
              checklist={[...dict.application.draftChecklist]}
              aside={dict.application.draftAside}
              className="bg-background p-6"
            />
          ) : (
            application.assessments.map((assessment) => (
              <Link
                key={assessment.id}
                href={withLocale(
                  locale,
                  `/workspaces/${application.workspace.slug}/applications/${application.slug}/assessments/${assessment.id}`,
                )}
                className="block rounded-lg border border-border bg-background p-4"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{assessment.id}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-1 text-[11px] ${getAssessmentStatusTone(
                          assessment.status,
                        )}`}
                      >
                        {assessment.status}
                      </span>
                      <span className="text-sm text-muted">
                        {formatMessage(dict.application.questionnaireVersion, {
                          version: assessment.questionnaireVersion,
                        })}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted">
                      {formatMessage(dict.application.structuredAnswersSaved, {
                        count: assessment.answers.length,
                      })}
                    </p>
                    {assessment.analysisRuns[0]?.scorecard ? (
                      <p className="mt-1 text-xs text-muted">
                        {formatMessage(dict.application.overallScore, {
                          score: assessment.analysisRuns[0].scorecard.overallScore,
                        })}
                      </p>
                    ) : null}
                    {assessment.analysisRuns[0]?.executiveReport ? (
                      <p className="mt-2 text-xs text-foreground underline underline-offset-4">
                        {dict.application.reportAvailable}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
