"use server";

import { redirect } from "next/navigation";
import { AssessmentStatus, prisma } from "@seventec-atlas/db";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { createAssessmentDraftSchema } from "../schemas/create-assessment-draft.schema";

const QUESTIONNAIRE_VERSION = "v1";

export async function createAssessmentDraftAction(formData: FormData) {
  let successPath: string | null = null;
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  try {
    const userId = await getCurrentUserId();
    const input = createAssessmentDraftSchema.parse({
      applicationId: formData.get("applicationId"),
    });

    const application = await prisma.application.findFirst({
      where: {
        id: input.applicationId,
        workspace: {
          members: {
            some: { userId },
          },
        },
      },
      include: { workspace: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    const assessment = await prisma.assessment.create({
      data: {
        workspaceId: application.workspaceId,
        applicationId: application.id,
        createdById: userId,
        status: AssessmentStatus.DRAFT,
        questionnaireVersion: QUESTIONNAIRE_VERSION,
      },
    });

    await setFlashMessage({
      type: "success",
      title: dict.flash.assessmentDraftCreatedTitle,
      description: dict.flash.assessmentDraftCreatedDescription,
    });
    successPath = withLocale(
      locale,
      `/workspaces/${application.workspace.slug}/applications/${application.slug}/assessments/${assessment.id}`,
    );
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.assessmentDraftCreateErrorTitle,
      description: dict.flash.assessmentDraftCreateErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/dashboard")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
