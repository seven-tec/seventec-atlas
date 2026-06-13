import { z } from "zod";

export const createApplicationSchema = z.object({
  workspaceId: z.string().cuid(),
  name: z.string().min(3).max(100),
  description: z.string().max(240).optional().or(z.literal("")),
  systemType: z.enum([
    "SAAS",
    "ECOMMERCE",
    "INTERNAL_TOOL",
    "CONTENT_PLATFORM",
    "MARKETPLACE",
    "OTHER",
  ]),
  primaryGoal: z.string().max(180).optional().or(z.literal("")),
});

