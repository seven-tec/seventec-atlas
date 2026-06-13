import { prisma } from "@seventec-atlas/db";

export async function getReportByRunId(
  workspaceSlug: string,
  applicationSlug: string,
  runId: string,
  userId: string,
) {
  return prisma.analysisRun.findFirst({
    where: {
      id: runId,
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
    },
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
      risks: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      },
      recommendations: {
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
      },
      executiveReport: true,
    },
  });
}
