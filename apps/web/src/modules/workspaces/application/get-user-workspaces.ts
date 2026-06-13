import { prisma } from "@seventec-atlas/db";

export async function getUserWorkspaces(userId: string) {
  return prisma.workspace.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          applications: true,
        },
      },
      applications: {
        orderBy: { createdAt: "desc" },
        include: {
          assessments: {
            orderBy: { createdAt: "desc" },
            include: {
              analysisRuns: {
                where: {
                  executiveReport: {
                    isNot: null,
                  },
                  scorecard: {
                    isNot: null,
                  },
                },
                orderBy: [{ completedAt: "desc" }, { createdAt: "desc" }],
                take: 1,
                include: {
                  scorecard: true,
                  executiveReport: true,
                },
              },
            },
          },
        },
      },
    },
  });
}
