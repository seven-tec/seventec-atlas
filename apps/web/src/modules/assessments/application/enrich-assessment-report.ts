"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@seventec-atlas/db";
import {
  enrichedExecutiveReportJsonSchema,
  type EnrichedExecutiveReport,
} from "@seventec-atlas/ai-contracts";
import { getDictionary } from "@/i18n/get-dictionary";
import { withLocale } from "@/i18n/locale";
import { getCurrentLocale } from "@/i18n/server";
import { getAiProviderConfig } from "@/lib/ai-provider";
import { getFallbackRedirectPath, setFlashMessage } from "@/lib/flash";
import { getCurrentUserId } from "@/lib/get-current-user-id";
import {
  mergeLocalizedAiArtifact,
  resolveLocalizedDeterministicArtifact,
  resolveLocalizedRecommendationItems,
  resolveLocalizedRiskItems,
} from "@/modules/reports/presentation/localized-report-artifacts";

type OpenAiResponsesJson = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      text?: string;
    }>;
  }>;
};

function extractOpenAiJsonText(responseJson: OpenAiResponsesJson) {
  if (typeof responseJson?.output_text === "string" && responseJson.output_text.length > 0) {
    return responseJson.output_text;
  }

  for (const outputItem of responseJson?.output ?? []) {
    for (const contentItem of outputItem?.content ?? []) {
      if (typeof contentItem?.text === "string" && contentItem.text.length > 0) {
        return contentItem.text;
      }
    }
  }

  return null;
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return trimmed;
  }

  const match = trimmed.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}

export async function enrichAssessmentReportAction(formData: FormData) {
  let successPath: string | null = null;
  const locale = await getCurrentLocale();
  const dict = getDictionary(locale);
  const languageInstruction =
    locale === "es"
      ? "Respond entirely in Spanish."
      : "Respond entirely in English.";

  try {
    const userId = await getCurrentUserId();
    const assessmentId = String(formData.get("assessmentId") ?? "");

    if (!assessmentId) {
      throw new Error("Assessment id is required");
    }

    const aiConfig = getAiProviderConfig();
    if (!aiConfig.isConfigured || !aiConfig.apiKey) {
      throw new Error(`${aiConfig.label} API key is not configured`);
    }

    const assessment = await prisma.assessment.findFirst({
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
        analysisRuns: {
          orderBy: { createdAt: "desc" },
          include: {
            scorecard: true,
            risks: true,
            recommendations: true,
            executiveReport: true,
          },
        },
      },
    });

    if (!assessment) {
      throw new Error("Assessment not found");
    }

    const latestRun = assessment.analysisRuns[0];
    if (!latestRun?.scorecard || !latestRun.executiveReport) {
      throw new Error("A deterministic report must exist before AI enrichment");
    }
    const localizedDeterministicReport = resolveLocalizedDeterministicArtifact(
      latestRun.executiveReport,
      locale,
    );
    const localizedRisks = resolveLocalizedRiskItems(latestRun.executiveReport, locale);
    const localizedRecommendations = resolveLocalizedRecommendationItems(
      latestRun.executiveReport,
      locale,
    );

    const reportPayload = {
      application: {
        name: assessment.application.name,
        description: assessment.application.description,
        systemType: assessment.application.systemType,
        primaryGoal: assessment.application.primaryGoal,
      },
      deterministicReport: {
        executiveSummary: localizedDeterministicReport.executiveSummary,
        technicalSummary: localizedDeterministicReport.technicalSummary,
        roadmap: localizedDeterministicReport.roadmap,
      },
      scorecard: latestRun.scorecard,
      risks: (localizedRisks ?? latestRun.risks).map((risk) => ({
        title: risk.title,
        category: risk.category,
        priority: risk.priority,
        description: risk.description,
      })),
      recommendations: (localizedRecommendations ?? latestRun.recommendations).map(
        (recommendation) => ({
          title: recommendation.title,
          category: recommendation.category,
          priority: recommendation.priority,
          description: recommendation.description,
        }),
      ),
      expectedSchema: enrichedExecutiveReportJsonSchema,
    };

    let rawText: string | null = null;

    if (aiConfig.provider === "openai") {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiConfig.apiKey}`,
        },
        body: JSON.stringify({
          model: aiConfig.model,
          input: [
            {
              role: "system",
              content: [
                {
                  type: "input_text",
                  text:
                    `You are a senior architecture advisor. Enrich deterministic audit findings into premium B2B language. Do not change the underlying findings. Keep the business framing sober, concrete, and executive-ready. ${languageInstruction}`,
                },
              ],
            },
            {
              role: "user",
              content: [
                {
                  type: "input_text",
                  text: JSON.stringify(reportPayload),
                },
              ],
            },
          ],
          text: {
            format: {
              type: "json_schema",
              name: "assessment_report_enrichment",
              strict: true,
              schema: enrichedExecutiveReportJsonSchema,
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI request failed with status ${response.status}`);
      }

      const responseJson = await response.json();
      rawText = extractOpenAiJsonText(responseJson);
    } else {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${aiConfig.apiKey}`,
          "HTTP-Referer": "https://seventec-atlas.local",
          "X-Title": "SevenTec Atlas MVP",
        },
        body: JSON.stringify({
          model: aiConfig.model,
          messages: [
            {
              role: "system",
              content:
                `You are a senior architecture advisor. Enrich deterministic audit findings into premium B2B language. Do not change the underlying findings. ${languageInstruction} Respond with valid JSON only, with no markdown fences and no commentary.`,
            },
            {
              role: "user",
              content: `Return a JSON object that matches this schema exactly:\n${JSON.stringify(
                enrichedExecutiveReportJsonSchema,
              )}\n\nUse this deterministic input without changing its facts:\n${JSON.stringify(
                reportPayload,
              )}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter request failed with status ${response.status}`);
      }

      const responseJson = await response.json();
      rawText = responseJson?.choices?.[0]?.message?.content ?? null;
    }

    if (!rawText) {
      throw new Error(`${aiConfig.label} returned no structured content`);
    }

    const parsedJsonText = extractJsonObject(rawText);
    if (!parsedJsonText) {
      throw new Error(`${aiConfig.label} did not return valid JSON`);
    }

    const enriched = JSON.parse(parsedJsonText) as EnrichedExecutiveReport;

    await prisma.executiveReport.update({
      where: { analysisRunId: latestRun.id },
      data: {
        artifactsJson: mergeLocalizedAiArtifact(latestRun.executiveReport.artifactsJson, locale, {
          provider: aiConfig.provider,
          model: aiConfig.model,
          enriched,
        }),
        generatedAt: new Date(),
      },
    });

    revalidatePath(
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );

    await setFlashMessage({
      type: "success",
      title: dict.flash.aiEnrichmentCompletedTitle,
      description: dict.flash.aiEnrichmentCompletedDescription,
    });
    successPath = withLocale(
      locale,
      `/workspaces/${assessment.application.workspace.slug}/applications/${assessment.application.slug}/assessments/${assessment.id}`,
    );
  } catch {
    await setFlashMessage({
      type: "error",
      title: dict.flash.aiEnrichmentErrorTitle,
      description: dict.flash.aiEnrichmentErrorDescription,
    });
    redirect(await getFallbackRedirectPath(withLocale(locale, "/dashboard")));
  }

  if (successPath) {
    redirect(successPath);
  }
}
