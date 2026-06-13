import { prisma } from "@seventec-atlas/db";

export async function getApplicationReportHistory(
  workspaceSlug: string,
  applicationSlug: string,
  userId: string,
) {
  return prisma.analysisRun.findMany({
    where: {
      assessment: {
        application: {
          slug: applicationSlug,
          workspace: {
            slug: workspaceSlug,
            members: {
              some: { userId },
            },
          },
        },
      },
      scorecard: {
        isNot: null,
      },
      executiveReport: {
        isNot: null,
      },
    },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    include: {
      assessment: true,
      scorecard: true,
      executiveReport: true,
    },
  });
}
