import Link from "next/link";
import { auth } from "@/auth";
import { EmptyStatePanel } from "@/components/feedback/empty-state-panel";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { formatMessage } from "@/lib/format-message";
import { resolveLocalizedDeterministicArtifact } from "@/modules/reports/presentation/localized-report-artifacts";
import { getUserWorkspaces } from "@/modules/workspaces/application/get-user-workspaces";

const DEMO_WORKSPACE_SLUG = "atlas-demo-workspace";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams?: Promise<{ workspace?: string; application?: string }>;
}) {
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const userId = session!.user!.id!;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const dateLocale = locale === "es" ? "es-CL" : "en-US";
  let workspaces: Awaited<ReturnType<typeof getUserWorkspaces>> = [];
  let databaseUnavailable = false;

  try {
    workspaces = await getUserWorkspaces(userId);
  } catch {
    databaseUnavailable = true;
  }

  const allApplications = workspaces.flatMap((workspace) =>
    workspace.applications.map((application) => ({
      workspace,
      application,
    })),
  );

  const allReports = allApplications
    .flatMap(({ workspace, application }) =>
      application.assessments.flatMap((assessment) =>
        assessment.analysisRuns.map((run) => ({
          workspace,
          application,
          assessment,
          run,
        })),
      ),
    )
    .filter((item) => item.run.scorecard && item.run.executiveReport)
    .sort((a, b) => {
      const left = new Date(a.run.completedAt ?? a.run.createdAt).getTime();
      const right = new Date(b.run.completedAt ?? b.run.createdAt).getTime();
      return right - left;
    });

  const localizedSummaryByRunId = new Map(
    allReports.map((item) => [
      item.run.id,
      item.run.executiveReport
        ? resolveLocalizedDeterministicArtifact(item.run.executiveReport, locale)
        : null,
    ]),
  );

  const selectedWorkspaceSlug = resolvedSearchParams?.workspace ?? "all";
  const selectedApplicationSlug = resolvedSearchParams?.application ?? "all";

  const filteredReports = allReports.filter((item) => {
    const workspaceMatch =
      selectedWorkspaceSlug === "all" || item.workspace.slug === selectedWorkspaceSlug;
    const applicationMatch =
      selectedApplicationSlug === "all" ||
      item.application.slug === selectedApplicationSlug;
    return workspaceMatch && applicationMatch;
  });

  const spotlightReport = filteredReports[0] ?? allReports[0] ?? null;
  const totalApplications = allApplications.length;
  const totalReports = allReports.length;
  const demoWorkspace = workspaces.find((workspace) => workspace.slug === DEMO_WORKSPACE_SLUG);
  const demoApplication = demoWorkspace?.applications[0];
  const demoReport = allReports.find((item) => item.workspace.slug === DEMO_WORKSPACE_SLUG);

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-border bg-surface p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl space-y-4">
            <p className="text-sm uppercase tracking-[0.24em] text-muted">
              {dict.dashboard.eyebrow}
            </p>
            <div className="space-y-3">
              <h1 className="text-4xl font-semibold leading-tight">
                {dict.dashboard.title}
              </h1>
              <p className="text-sm leading-7 text-muted">
                {dict.dashboard.description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={withLocale(locale, "/workspaces/new")}
              className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
            >
              {dict.dashboard.createWorkspace}
            </Link>
            {spotlightReport ? (
              <Link
                href={withLocale(
                  locale,
                  `/workspaces/${spotlightReport.workspace.slug}/applications/${spotlightReport.application.slug}/reports/${spotlightReport.run.id}`,
                )}
                className="rounded-md border border-border px-4 py-2 text-foreground"
              >
                {dict.dashboard.openFlagshipReport}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {dict.dashboard.workspaces}
            </p>
            <p className="mt-3 text-3xl font-semibold">{workspaces.length}</p>
            <p className="mt-2 text-sm text-muted">
              {dict.dashboard.workspacesDescription}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {dict.dashboard.applications}
            </p>
            <p className="mt-3 text-3xl font-semibold">{totalApplications}</p>
            <p className="mt-2 text-sm text-muted">
              {dict.dashboard.applicationsDescription}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted">
              {dict.dashboard.reports}
            </p>
            <p className="mt-3 text-3xl font-semibold">{totalReports}</p>
            <p className="mt-2 text-sm text-muted">
              {dict.dashboard.reportsDescription}
            </p>
          </div>
        </div>

        {demoWorkspace && demoApplication ? (
          <div className="mt-6 rounded-2xl border border-border bg-background p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {dict.dashboard.demoLoaded}
                </p>
                <h2 className="text-xl font-semibold">{demoWorkspace.name}</h2>
                <p className="max-w-2xl text-sm text-muted">
                  {dict.dashboard.demoDescription}
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={withLocale(
                    locale,
                    `/workspaces/${demoWorkspace.slug}/applications/${demoApplication.slug}`,
                  )}
                  className="rounded-md border border-border px-4 py-2 text-foreground"
                >
                  {dict.dashboard.openDemoApp}
                </Link>
                {demoReport ? (
                  <Link
                    href={withLocale(
                      locale,
                      `/workspaces/${demoReport.workspace.slug}/applications/${demoReport.application.slug}/reports/${demoReport.run.id}`,
                    )}
                    className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
                  >
                    {dict.dashboard.openDemoReport}
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {databaseUnavailable ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-8">
          <p className="text-sm uppercase tracking-[0.2em] text-amber-200">
            {dict.dashboard.setupRequired}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-foreground">
            {dict.dashboard.dbUnavailableTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            {dict.dashboard.dbUnavailableDescription}
          </p>
        </div>
      ) : workspaces.length === 0 ? (
        <EmptyStatePanel
          eyebrow={dict.dashboard.onboardingEyebrow}
          title={dict.dashboard.onboardingTitle}
          description={dict.dashboard.onboardingDescription}
          primaryAction={{
            href: withLocale(locale, "/workspaces/new"),
            label: dict.dashboard.createFirstWorkspace,
          }}
          checklistTitle={dict.dashboard.checklistTitle}
          checklist={dict.dashboard.onboardingChecklist}
          aside={dict.dashboard.onboardingAside}
        />
      ) : (
        <>
          <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-border bg-surface p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted">
                    {dict.dashboard.spotlightEyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {dict.dashboard.spotlightTitle}
                  </h2>
                </div>
              </div>

              {spotlightReport ? (
                <div className="mt-6 rounded-2xl border border-border bg-background p-6">
                  <div className="space-y-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted">
                      {spotlightReport.workspace.name}
                    </p>
                    <h3 className="text-2xl font-semibold">
                      {spotlightReport.application.name}
                    </h3>
                    <p className="text-sm text-muted">
                      {dict.dashboard.spotlightDescription}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {dict.dashboard.overallLabel}
                      </p>
                      <p className="mt-2 text-3xl font-semibold">
                        {spotlightReport.run.scorecard?.overallScore}/100
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {dict.application.eyebrow}
                      </p>
                      <p className="mt-2 font-medium">{spotlightReport.application.name}</p>
                    </div>
                    <div className="rounded-xl border border-border p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-muted">
                        {dict.dashboard.reportDateLabel}
                      </p>
                      <p className="mt-2 font-medium">
                        {spotlightReport.run.executiveReport?.generatedAt.toLocaleDateString(
                          dateLocale,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href={withLocale(
                        locale,
                        `/workspaces/${spotlightReport.workspace.slug}/applications/${spotlightReport.application.slug}/reports/${spotlightReport.run.id}`,
                      )}
                      className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
                    >
                      {dict.dashboard.openFlagshipReport}
                    </Link>
                    <Link
                      href={withLocale(
                        locale,
                        `/workspaces/${spotlightReport.workspace.slug}/applications/${spotlightReport.application.slug}`,
                      )}
                      className="rounded-md border border-border px-4 py-2 text-foreground"
                    >
                      {dict.dashboard.openApplication}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-6">
                  <EmptyStatePanel
                    eyebrow={dict.dashboard.spotlightPendingEyebrow}
                    title={dict.dashboard.spotlightPendingTitle}
                    description={dict.dashboard.spotlightPendingDescription}
                    primaryAction={{
                      href:
                        allApplications[0]
                          ? withLocale(
                              locale,
                              `/workspaces/${allApplications[0].workspace.slug}/applications/${allApplications[0].application.slug}`,
                            )
                          : withLocale(locale, "/dashboard"),
                      label: dict.dashboard.openApplication,
                    }}
                    checklistTitle={dict.dashboard.checklistTitle}
                    checklist={dict.dashboard.spotlightPendingChecklist}
                    aside={dict.dashboard.spotlightPendingAside}
                    className="p-6"
                  />
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-border bg-surface p-6">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.dashboard.filtersEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dict.dashboard.filtersTitle}
                </h2>
              </div>

              <form className="mt-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {dict.dashboard.workspaceFilterLabel}
                  </label>
                  <select
                    name="workspace"
                    defaultValue={selectedWorkspaceSlug}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  >
                    <option value="all">{dict.dashboard.allWorkspaces}</option>
                    {workspaces.map((workspace) => (
                      <option key={workspace.id} value={workspace.slug}>
                        {workspace.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {dict.dashboard.applicationFilterLabel}
                  </label>
                  <select
                    name="application"
                    defaultValue={selectedApplicationSlug}
                    className="w-full rounded-md border border-border bg-background px-3 py-2"
                  >
                    <option value="all">{dict.dashboard.allApplications}</option>
                    {allApplications
                      .filter(
                        ({ workspace }) =>
                          selectedWorkspaceSlug === "all" ||
                          workspace.slug === selectedWorkspaceSlug,
                      )
                      .map(({ application }) => (
                        <option key={application.id} value={application.slug}>
                          {application.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="submit"
                    className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
                  >
                    {dict.dashboard.applyFilters}
                  </button>
                  <Link
                    href={withLocale(locale, "/dashboard")}
                    className="rounded-md border border-border px-4 py-2 text-foreground"
                  >
                    {dict.dashboard.resetFilters}
                  </Link>
                </div>
              </form>
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.dashboard.recentSnapshotsEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dict.dashboard.recentSnapshotsTitle}
                </h2>
              </div>
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted">
                {formatMessage(dict.dashboard.visibleCount, {
                  count: filteredReports.length,
                })}
              </span>
            </div>

            {filteredReports.length === 0 ? (
              <div className="mt-6">
                <EmptyStatePanel
                  eyebrow={dict.dashboard.filteredEmptyEyebrow}
                  title={dict.dashboard.filteredEmptyTitle}
                  description={dict.dashboard.filteredEmptyDescription}
                  primaryAction={{
                    href: withLocale(locale, "/dashboard"),
                    label: dict.dashboard.resetFilters,
                  }}
                  checklistTitle={dict.dashboard.checklistTitle}
                  checklist={dict.dashboard.filteredEmptyChecklist}
                  aside={dict.dashboard.filteredEmptyAside}
                  className="p-6"
                />
              </div>
            ) : (
              <div className="mt-6 grid gap-4 xl:grid-cols-2">
                {filteredReports.slice(0, 6).map((item) => (
                  <Link
                    key={item.run.id}
                    href={withLocale(
                      locale,
                      `/workspaces/${item.workspace.slug}/applications/${item.application.slug}/reports/${item.run.id}`,
                    )}
                    className="rounded-2xl border border-border bg-background p-5"
                  >
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-muted">
                            {item.workspace.name}
                          </p>
                          <h3 className="mt-1 text-xl font-semibold">
                            {item.application.name}
                          </h3>
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-semibold">
                            {item.run.scorecard?.overallScore}/100
                          </p>
                          <p className="text-xs text-muted">
                            {dict.dashboard.overallLabel}
                          </p>
                        </div>
                      </div>

                      <p className="text-sm text-muted">
                        {localizedSummaryByRunId.get(item.run.id)?.executiveSummary ??
                          item.run.executiveReport?.executiveSummary}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="rounded-full border border-border px-3 py-1">
                          {dict.report.runLabel} {item.run.id}
                        </span>
                        <span className="rounded-full border border-border px-3 py-1">
                          {item.run.executiveReport?.generatedAt.toLocaleString(dateLocale)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-border bg-surface p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted">
                  {dict.dashboard.workspacesSectionEyebrow}
                </p>
                <h2 className="mt-2 text-2xl font-semibold">
                  {dict.dashboard.workspacesSectionTitle}
                </h2>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {workspaces.map((workspace) => {
                const latestRun = workspace.applications
                  .flatMap((application) =>
                    application.assessments.flatMap((assessment) =>
                      assessment.analysisRuns.map((run) => ({
                        run,
                        application,
                        assessment,
                      })),
                    ),
                  )
                  .sort((a, b) => {
                    const left = new Date(
                      a.run.completedAt ?? a.run.createdAt,
                    ).getTime();
                    const right = new Date(
                      b.run.completedAt ?? b.run.createdAt,
                    ).getTime();
                    return right - left;
                  })[0];

                return (
                  <div
                    key={workspace.id}
                    className="rounded-2xl border border-border bg-background p-6"
                  >
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold">{workspace.name}</h3>
                        <p className="text-sm text-muted">
                          {formatMessage(dict.dashboard.applicationsRegistered, {
                            count: workspace._count.applications,
                          })}
                        </p>
                      </div>

                      {latestRun?.run.scorecard ? (
                        <div className="rounded-lg border border-border p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-muted">
                            {dict.dashboard.latestReportSnapshot}
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {latestRun.application.name}
                          </p>
                          <p className="mt-1 text-sm text-muted">
                            {formatMessage(dict.dashboard.latestReportScore, {
                              score: latestRun.run.scorecard.overallScore,
                            })}
                          </p>
                          <Link
                            href={withLocale(
                              locale,
                              `/workspaces/${workspace.slug}/applications/${latestRun.application.slug}/reports/${latestRun.run.id}`,
                            )}
                            className="mt-4 inline-flex rounded-md border border-border px-3 py-2 text-sm text-foreground"
                          >
                            {dict.dashboard.openLatestReport}
                          </Link>
                        </div>
                      ) : (
                        <div className="rounded-lg border border-dashed border-border p-4 text-sm text-muted">
                          {dict.dashboard.noAnalyzedReport}
                        </div>
                      )}

                      <Link
                        href={withLocale(locale, `/workspaces/${workspace.slug}`)}
                        className="inline-flex rounded-md border border-accent bg-accent px-4 py-2 text-sm text-background"
                      >
                        {dict.dashboard.openWorkspace}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
