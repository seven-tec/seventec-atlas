"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@seventec-atlas/db";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { assessmentQuestionMap } from "../questionnaire";

export async function saveAssessmentDraftAction(formData: FormData) {
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
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const answerWrites = [];

    for (const [questionKey, definition] of assessmentQuestionMap.entries()) {
      const selectedValue = String(formData.get(questionKey) ?? "");

      if (!selectedValue) {
        continue;
      }

      const selectedOption = definition.question.options.find(
        (option) => option.value === selectedValue,
      );

      if (!selectedOption) {
        continue;
      }

      answerWrites.push(
        prisma.assessmentAnswer.upsert({
          where: {
            assessmentId_questionKey: {
              assessmentId: assessment.id,
              questionKey,
            },
          },
          update: {
            sectionKey: definition.section.key,
            valueJson: {
              selectedValue,
              selectedLabel: selectedOption.label,
            },
            normalizedValue: selectedOption.normalizedValue,
            weightSnapshot: 1,
          },
          create: {
            assessmentId: assessment.id,
            sectionKey: definition.section.key,
            questionKey,
            valueJson: {
              selectedValue,
              selectedLabel: selectedOption.label,
            },
            normalizedValue: selectedOption.normalizedValue,
            weightSnapshot: 1,
          },
        }),
      );
    }

    await prisma.$transaction(answerWrites);

    revalidatePath(
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );
    revalidatePath(
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}`,
    );
    await setFlashMessage({
      type: "success",
      title: dict.flash.draftSavedTitle,
      description: dict.flash.draftSavedDescription,
    });
    successPath = withLocale(
      locale,
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.draftSaveErrorTitle,
      description: dict.flash.draftSaveErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/dashboard")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
