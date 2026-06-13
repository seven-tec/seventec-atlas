import { prisma } from "@seventec-atlas/db";

export async function getLatestApplicationReport(
  workspaceSlug: string,
  applicationSlug: string,
  userId: string,
) {
  return prisma.analysisRun.findFirst({
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
      executiveReport: {
        isNot: null,
      },
      scorecard: {
        isNot: null,
      },
    },
    orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
    include: {
      assessment: {
        include: {
          application: {
            include: {
              workspace: true,
            },
          },
        },
      },
      scorecard: true,
      executiveReport: true,
    },
  });
}
