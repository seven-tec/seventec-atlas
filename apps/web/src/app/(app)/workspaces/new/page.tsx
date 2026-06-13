import {
  FormSubmissionHint,
  PendingFieldset,
} from "@/components/form/form-pending-state";
import { getDictionary } from "@/i18n/get-dictionary";
import { getCurrentLocale } from "@/i18n/server";
import { createWorkspaceAction } from "@/modules/workspaces/application/create-workspace";
import { PendingSubmitButton } from "@/components/form/pending-submit-button";

export default async function NewWorkspacePage() {
  const dict = getDictionary(await getCurrentLocale());

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">
          {dict.workspace.setupEyebrow}
        </p>
        <h1 className="text-3xl font-semibold">{dict.workspace.createTitle}</h1>
        <p className="text-sm leading-7 text-muted">
          {dict.workspace.createDescription}
        </p>
      </div>

      <form action={createWorkspaceAction} className="rounded-xl border border-border bg-surface p-6">
        <PendingFieldset className="space-y-4">
          <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted">
            {dict.workspace.recommendedPath}
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              {dict.workspace.nameLabel}
            </label>
            <input
              id="name"
              name="name"
              placeholder="SevenTec Advisory"
              className="w-full rounded-md border border-border bg-background px-3 py-2 disabled:cursor-not-allowed disabled:opacity-60"
              required
            />
          </div>

          <div className="space-y-3">
            <PendingSubmitButton pendingLabel={dict.workspace.creatingCta}>
              {dict.workspace.createCta}
            </PendingSubmitButton>
            <FormSubmissionHint
              idleMessage={dict.workspace.idleHint}
              pendingMessage={dict.workspace.pendingHint}
              idleLabel={dict.common.ready}
              pendingLabel={dict.common.processing}
            />
          </div>
        </PendingFieldset>
      </form>
    </div>
  );
}
