import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { EmptyStatePanel } from "@/components/feedback/empty-state-panel";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentLocale } from "@/i18n/server";
import { withLocale } from "@/i18n/locale";
import { getWorkspaceBySlug } from "@/modules/workspaces/application/get-workspace-by-slug";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await auth();
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const workspace = await getWorkspaceBySlug(workspaceSlug, session!.user!.id!);

  if (!workspace) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-muted">
            {dict.workspace.eyebrow}
          </p>
          <h1 className="text-3xl font-semibold">{workspace.name}</h1>
        </div>
        <Link
          href={withLocale(locale, `/workspaces/${workspace.slug}/applications/new`)}
          className="rounded-md border border-accent bg-accent px-4 py-2 text-background"
        >
          {dict.workspace.addApplication}
        </Link>
      </div>

      {workspace.applications.length === 0 ? (
        <EmptyStatePanel
          eyebrow={dict.workspace.emptyEyebrow}
          title={dict.workspace.emptyTitle}
          description={dict.workspace.emptyDescription}
          primaryAction={{
            href: withLocale(locale, `/workspaces/${workspace.slug}/applications/new`),
            label: dict.workspace.addFirstApplication,
          }}
          secondaryAction={{
            href: withLocale(locale, "/dashboard"),
            label: dict.workspace.backDashboard,
          }}
          checklist={[...dict.workspace.checklist]}
          aside={dict.workspace.aside}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {workspace.applications.map((application) => (
            <Link
              key={application.id}
              href={withLocale(
                locale,
                `/workspaces/${workspace.slug}/applications/${application.slug}`,
              )}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">{application.name}</h2>
                <p className="text-sm text-muted">
                  {application.systemType.replaceAll("_", " ")}
                </p>
                {application.description ? (
                  <p className="text-sm text-muted">{application.description}</p>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
