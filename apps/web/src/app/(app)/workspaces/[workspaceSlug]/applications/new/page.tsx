import { notFound } from "next/navigation";
import { auth } from "@/auth";
import {
  FormSubmissionHint,
  PendingFieldset,
} from "@/components/form/form-pending-state";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentLocale } from "@/i18n/server";
import { formatMessage } from "@/lib/format-message";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";
import { createApplicationAction } from "@/modules/applications/application/create-application";
import { getWorkspaceBySlug } from "@/modules/workspaces/application/get-workspace-by-slug";

export default async function NewApplicationPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const session = await auth();
  const dict = getDictionary(await getCurrentLocale());
  const workspace = await getWorkspaceBySlug(workspaceSlug, session!.user!.id!);

  if (!workspace) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">
          {dict.application.setupEyebrow}
        </p>
        <h1 className="text-3xl font-semibold">{dict.application.registerTitle}</h1>
        <p className="text-sm leading-7 text-muted">
          {formatMessage(dict.application.registerDescription, {
            workspaceName: workspace.name,
          })}
        </p>
      </div>

      <form action={createApplicationAction} className="rounded-xl border border-border bg-surface p-6">
        <PendingFieldset className="space-y-4">
          <input type="hidden" name="workspaceId" value={workspace.id} />

          <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
            {dict.application.framingHint}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {dict.application.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Atlas Customer Portal"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              {dict.application.descriptionLabel}
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Main SaaS platform evaluated by Atlas."
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="systemType" className="text-sm font-medium">
              {dict.application.systemTypeLabel}
            </label>
            <select
              id="systemType"
              name="systemType"
              className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              defaultValue="SAAS"
            >
              <option value="SAAS">{dict.application.systemTypes.SAAS}</option>
              <option value="ECOMMERCE">{dict.application.systemTypes.ECOMMERCE}</option>
              <option value="INTERNAL_TOOL">{dict.application.systemTypes.INTERNAL_TOOL}</option>
              <option value="CONTENT_PLATFORM">{dict.application.systemTypes.CONTENT_PLATFORM}</option>
              <option value="MARKETPLACE">{dict.application.systemTypes.MARKETPLACE}</option>
              <option value="OTHER">{dict.application.systemTypes.OTHER}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="primaryGoal" className="text-sm font-medium">
              {dict.application.primaryGoalLabel}
            </label>
            <input
              id="primaryGoal"
              name="primaryGoal"
              className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              placeholder="Reduce platform risk before enterprise expansion."
            />
          </div>

          <div className="space-y-3">
            <PendingSubmitButton pendingLabel={dict.application.creatingCta}>
              {dict.application.createCta}
            </PendingSubmitButton>
            <FormSubmissionHint
              idleMessage={dict.application.idleHint}
              pendingMessage={dict.application.pendingHint}
              idleLabel={dict.common.ready}
              pendingLabel={dict.common.processing}
            />
          </div>
        </PendingFieldset>
      </form>
    </div>
  );
}
