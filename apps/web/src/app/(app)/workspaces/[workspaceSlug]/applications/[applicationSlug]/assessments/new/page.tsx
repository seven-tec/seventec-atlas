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
import { createAssessmentDraftAction } from "@/modules/assessments/application/create-assessment-draft";
import { getApplicationBySlugs } from "@/modules/applications/application/get-application-by-slugs";

export default async function NewAssessmentDraftPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string; applicationSlug: string }>;
}) {
  const { workspaceSlug, applicationSlug } = await params;
  const session = await auth();
  const dict = getDictionary(await getCurrentLocale());
  const application = await getApplicationBySlugs(
    workspaceSlug,
    applicationSlug,
    session!.user!.id!,
  );

  if (!application) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.24em] text-muted">
          {dict.assessment.draftEyebrow}
        </p>
        <h1 className="text-3xl font-semibold">{dict.assessment.createDraftTitle}</h1>
        <p className="text-sm leading-7 text-muted">
          {formatMessage(dict.assessment.createDraftDescription, {
            applicationName: application.name,
          })}
        </p>
      </div>

      <form action={createAssessmentDraftAction} className="rounded-xl border border-border bg-surface p-6">
        <PendingFieldset className="space-y-6">
          <input type="hidden" name="applicationId" value={application.id} />
          <div className="rounded-lg border border-border bg-background p-4">
            <p className="text-sm text-muted">{dict.assessment.applicationLabel}</p>
            <p className="font-medium">{application.name}</p>
            <p className="mt-2 text-sm text-muted">
              {formatMessage(dict.assessment.questionnaireVersion, { version: "v1" })}
            </p>
          </div>

          <div className="space-y-3">
            <PendingSubmitButton pendingLabel={dict.assessment.creatingDraftCta}>
              {dict.assessment.createDraftCta}
            </PendingSubmitButton>
            <FormSubmissionHint
              idleMessage={dict.assessment.createDraftIdleHint}
              pendingMessage={dict.assessment.createDraftPendingHint}
              idleLabel={dict.common.ready}
              pendingLabel={dict.common.processing}
            />
          </div>
        </PendingFieldset>
      </form>
    </div>
  );
}
