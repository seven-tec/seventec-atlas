"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@seventec-atlas/db";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { formatMessage } from "@/lib/format-message";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { slugify } from "@/lib/slugify";
import { createApplicationSchema } from "../schemas/create-application.schema";

export async function createApplicationAction(formData: FormData) {
  let successPath: string | null = null;
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  try {
    const userId = await getCurrentUserId();

    const input = createApplicationSchema.parse({
      workspaceId: formData.get("workspaceId"),
      name: formData.get("name"),
      description: formData.get("description"),
      systemType: formData.get("systemType"),
      primaryGoal: formData.get("primaryGoal"),
    });

    const workspace = await prisma.workspace.findFirst({
      where: {
        id: input.workspaceId,
        members: { some: { userId } },
      },
    });

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    const baseSlug = slugify(input.name);
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

    const application = await prisma.application.create({
      data: {
        workspaceId: workspace.id,
        name: input.name,
        slug,
        description: input.description || null,
        systemType: input.systemType,
        primaryGoal: input.primaryGoal || null,
      },
    });

    revalidatePath(`/workspaces/${workspace.slug}`);
    await setFlashMessage({
      type: "success",
      title: dict.flash.applicationCreatedTitle,
      description: formatMessage(dict.flash.applicationCreatedDescription, {
        name: application.name,
      }),
    });
    successPath = withLocale(
      locale,
      `/workspaces/${workspace.slug}/applications/${application.slug}`,
    );
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.applicationCreateErrorTitle,
      description: dict.flash.applicationCreateErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/dashboard")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
