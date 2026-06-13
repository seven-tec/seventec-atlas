import { z } from "zod";

export const executiveReportSchema = z.object({
  executiveSummary: z.string(),
  technicalSummary: z.string(),
  roadmap: z.array(
    z.object({
      phase: z.string(),
      title: z.string(),
      rationale: z.string(),
    }),
  ),
});

export type ExecutiveReportOutput = z.infer<typeof executiveReportSchema>;

