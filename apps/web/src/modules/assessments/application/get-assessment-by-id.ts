import { prisma } from "@seventec-atlas/db";

export async function getAssessmentById(
  assessmentId: string,
  userId: string,
) {
  return prisma.assessment.findFirst({
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
      answers: {
        orderBy: [{ sectionKey: "asc" }, { questionKey: "asc" }],
      },
      analysisRuns: {
        orderBy: { createdAt: "desc" },
        include: {
          scorecard: true,
          executiveReport: true,
          risks: {
            orderBy: { createdAt: "asc" },
          },
          recommendations: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });
}
