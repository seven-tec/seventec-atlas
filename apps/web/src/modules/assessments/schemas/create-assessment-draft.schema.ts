import { z } from "zod";

export const createAssessmentDraftSchema = z.object({
  applicationId: z.string().cuid(),
});

