export const enrichedExecutiveReportJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["executivePolish", "businessFraming", "roadmapRefinement"],
  properties: {
    executivePolish: {
      type: "string",
      description:
        "A polished executive summary for leadership, grounded in the deterministic findings.",
    },
    businessFraming: {
      type: "string",
      description:
        "A business-oriented explanation of why the findings matter for delivery risk, scale, and product execution.",
    },
    roadmapRefinement: {
      type: "array",
      description:
        "A refined roadmap that preserves the deterministic order but improves clarity and actionability.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["phase", "title", "rationale"],
        properties: {
          phase: { type: "string" },
          title: { type: "string" },
          rationale: { type: "string" },
        },
      },
    },
  },
} as const;

export type EnrichedExecutiveReport = {
  executivePolish: string;
  businessFraming: string;
  roadmapRefinement: Array<{
    phase: string;
    title: string;
    rationale: string;
  }>;
};

