import { prisma } from "@seventec-atlas/db";

export async function getApplicationBySlugs(
  workspaceSlug: string,
  applicationSlug: string,
  userId: string,
) {
  return prisma.application.findFirst({
    where: {
      slug: applicationSlug,
      workspace: {
        slug: workspaceSlug,
        members: {
          some: { userId },
        },
      },
    },
    include: {
      workspace: true,
      assessments: {
        orderBy: { createdAt: "desc" },
        include: {
          answers: true,
          analysisRuns: {
            orderBy: { createdAt: "desc" },
            include: {
              scorecard: true,
              executiveReport: true,
            },
          },
        },
      },
    },
  });
}
