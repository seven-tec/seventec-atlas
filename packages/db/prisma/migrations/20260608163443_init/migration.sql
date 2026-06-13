-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER');

-- CreateEnum
CREATE TYPE "AssessmentStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'ANALYZED');

-- CreateEnum
CREATE TYPE "AnalysisRunStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SystemType" AS ENUM ('SAAS', 'ECOMMERCE', 'INTERNAL_TOOL', 'CONTENT_PLATFORM', 'MARKETPLACE', 'OTHER');

-- CreateEnum
CREATE TYPE "TeamSize" AS ENUM ('SOLO', 'SMALL', 'MEDIUM', 'LARGE');

-- CreateEnum
CREATE TYPE "TrafficLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskLikelihood" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RiskImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "RecommendationEffort" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateEnum
CREATE TYPE "RecommendationImpact" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'TRANSFORMATIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionToken")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMember" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "industry" TEXT,
    "businessModel" TEXT,
    "systemType" "SystemType" NOT NULL DEFAULT 'OTHER',
    "teamSize" "TeamSize",
    "trafficLevel" "TrafficLevel",
    "stackSummary" TEXT,
    "primaryGoal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assessment" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" "AssessmentStatus" NOT NULL DEFAULT 'DRAFT',
    "questionnaireVersion" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Assessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssessmentAnswer" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "questionKey" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "normalizedValue" DOUBLE PRECISION,
    "weightSnapshot" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessmentAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalysisRun" (
    "id" TEXT NOT NULL,
    "assessmentId" TEXT NOT NULL,
    "status" "AnalysisRunStatus" NOT NULL DEFAULT 'PENDING',
    "scoringModelVersion" TEXT NOT NULL,
    "aiModel" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalysisRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scorecard" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "architectureScore" DOUBLE PRECISION NOT NULL,
    "performanceScore" DOUBLE PRECISION NOT NULL,
    "scalabilityScore" DOUBLE PRECISION NOT NULL,
    "maintainabilityScore" DOUBLE PRECISION NOT NULL,
    "operabilityScore" DOUBLE PRECISION NOT NULL,
    "breakdownJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Scorecard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskItem" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "severity" "RiskSeverity" NOT NULL,
    "likelihood" "RiskLikelihood" NOT NULL,
    "impact" "RiskImpact" NOT NULL,
    "priority" "RiskPriority" NOT NULL,
    "description" TEXT NOT NULL,
    "evidenceJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" "RiskPriority" NOT NULL,
    "effort" "RecommendationEffort" NOT NULL,
    "expectedImpact" "RecommendationImpact" NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Recommendation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExecutiveReport" (
    "id" TEXT NOT NULL,
    "analysisRunId" TEXT NOT NULL,
    "executiveSummary" TEXT NOT NULL,
    "technicalSummary" TEXT NOT NULL,
    "roadmapJson" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExecutiveReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMember_workspaceId_userId_key" ON "WorkspaceMember"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "Application_workspaceId_idx" ON "Application"("workspaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_workspaceId_slug_key" ON "Application"("workspaceId", "slug");

-- CreateIndex
CREATE INDEX "Assessment_workspaceId_idx" ON "Assessment"("workspaceId");

-- CreateIndex
CREATE INDEX "Assessment_applicationId_idx" ON "Assessment"("applicationId");

-- CreateIndex
CREATE INDEX "Assessment_createdById_idx" ON "Assessment"("createdById");

-- CreateIndex
CREATE INDEX "AssessmentAnswer_assessmentId_sectionKey_idx" ON "AssessmentAnswer"("assessmentId", "sectionKey");

-- CreateIndex
CREATE UNIQUE INDEX "AssessmentAnswer_assessmentId_questionKey_key" ON "AssessmentAnswer"("assessmentId", "questionKey");

-- CreateIndex
CREATE INDEX "AnalysisRun_assessmentId_idx" ON "AnalysisRun"("assessmentId");

-- CreateIndex
CREATE INDEX "AnalysisRun_status_idx" ON "AnalysisRun"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Scorecard_analysisRunId_key" ON "Scorecard"("analysisRunId");

-- CreateIndex
CREATE INDEX "RiskItem_analysisRunId_idx" ON "RiskItem"("analysisRunId");

-- CreateIndex
CREATE INDEX "RiskItem_priority_idx" ON "RiskItem"("priority");

-- CreateIndex
CREATE INDEX "Recommendation_analysisRunId_idx" ON "Recommendation"("analysisRunId");

-- CreateIndex
CREATE INDEX "Recommendation_priority_idx" ON "Recommendation"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "ExecutiveReport_analysisRunId_key" ON "ExecutiveReport"("analysisRunId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMember" ADD CONSTRAINT "WorkspaceMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssessmentAnswer" ADD CONSTRAINT "AssessmentAnswer_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalysisRun" ADD CONSTRAINT "AnalysisRun_assessmentId_fkey" FOREIGN KEY ("assessmentId") REFERENCES "Assessment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scorecard" ADD CONSTRAINT "Scorecard_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskItem" ADD CONSTRAINT "RiskItem_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Recommendation" ADD CONSTRAINT "Recommendation_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExecutiveReport" ADD CONSTRAINT "ExecutiveReport_analysisRunId_fkey" FOREIGN KEY ("analysisRunId") REFERENCES "AnalysisRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
