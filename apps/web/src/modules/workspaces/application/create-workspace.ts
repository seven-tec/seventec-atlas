"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, WorkspaceRole } from "@seventec-atlas/db";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { formatMessage } from "@/lib/format-message";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { slugify } from "@/lib/slugify";
import { createWorkspaceSchema } from "../schemas/create-workspace.schema";

export async function createWorkspaceAction(formData: FormData) {
  let successPath: string | null = null;
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);

  try {
    const input = createWorkspaceSchema.parse({
      name: formData.get("name"),
    });

    const userId = await getCurrentUserId();
    const baseSlug = slugify(input.name);
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 6)}`;

    const workspace = await prisma.workspace.create({
      data: {
        name: input.name,
        slug,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });

    revalidatePath("/dashboard");
    await setFlashMessage({
      type: "success",
      title: dict.flash.workspaceCreatedTitle,
      description: formatMessage(dict.flash.workspaceCreatedDescription, {
        name: workspace.name,
      }),
    });
    successPath = withLocale(locale, `/workspaces/${workspace.slug}`);
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.workspaceCreateErrorTitle,
      description: dict.flash.workspaceCreateErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/workspaces/new")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
