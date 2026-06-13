export type AssessmentDraft = {
  id: string;
  applicationId: string;
  questionnaireVersion: string;
  status: "DRAFT" | "SUBMITTED" | "ANALYZED";
};

