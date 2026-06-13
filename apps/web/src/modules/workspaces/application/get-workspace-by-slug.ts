import { prisma } from "@seventec-atlas/db";

export async function getWorkspaceBySlug(slug: string, userId: string) {
  return prisma.workspace.findFirst({
    where: {
      slug,
      members: {
        some: { userId },
      },
    },
    include: {
      applications: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

