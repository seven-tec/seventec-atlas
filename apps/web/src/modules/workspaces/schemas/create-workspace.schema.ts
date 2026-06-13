import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(3).max(80),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

