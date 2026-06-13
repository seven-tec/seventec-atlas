export const en = {
  common: {
    brandTagline: "Architecture Intelligence",
    userFallback: "Signed user",
    signOut: "Sign out",
    localeEnglish: "EN",
    localeSpanish: "ES",
    dismiss: "Dismiss",
    ready: "Ready",
    processing: "Processing",
  },
  marketing: {
    eyebrow: "SevenTec Atlas",
    title:
      "Architecture intelligence for teams that need technical clarity and business-grade reporting",
    description:
      "Evaluate architecture, performance, scalability, and maintainability with deterministic scoring first, then translate technical findings into sober executive narratives and exportable artifacts.",
    enterPlatform: "Enter platform",
    openDashboard: "Open dashboard",
    cards: [
      {
        eyebrow: "Deterministic-first",
        title: "Technical rigor before narrative",
        description:
          "Scorecards, risks, and recommendations originate from structured signals, not unconstrained generation.",
      },
      {
        eyebrow: "Executive-grade output",
        title: "Reports you can actually present",
        description:
          "Share-ready layouts, premium summaries, and comparison narratives make the output usable beyond engineering.",
      },
      {
        eyebrow: "Product, not gimmick",
        title: "Built for serious architecture work",
        description:
          "The platform is designed to communicate maturity, prioritization, and improvement over time.",
      },
    ],
  },
  signIn: {
    title: "Sign in",
    description:
      "Enter the flagship MVP. In development, use the guided access path below while production OAuth is still being finalized.",
    devAccessTitle: "Development access",
    devAccessDescription:
      "Recommended for product iteration, portfolio demos, and local validation while production identity providers are being prepared.",
    name: "Name",
    email: "Email",
    enterDevMode: "Enter development mode",
    openingWorkspace: "Opening workspace...",
    devIdleHint:
      "Use the guided dev path to enter the product immediately.",
    devPendingHint:
      "Authentication is being prepared and your workspace will open in a moment.",
    continueGithub: "Continue with GitHub",
    redirectingGithub: "Redirecting to GitHub...",
    githubIdleHint: "Production access will use the provider flow.",
    githubPendingHint:
      "The browser is being redirected to the identity provider.",
    githubNotConfigured: "GitHub OAuth is not configured in this environment yet.",
  },
  dashboard: {
    eyebrow: "Architecture Intelligence",
    title: "Turn architecture signals into executive-grade reports",
    description:
      "Review deterministic assessments, compare evolution across runs, and present a sober B2B artifact that connects technical findings with delivery and scale risk.",
    createWorkspace: "Create workspace",
    openFlagshipReport: "Open flagship report",
    workspaces: "Workspaces",
    applications: "Applications",
    reports: "Reports",
    workspacesDescription: "Active client or product contexts.",
    applicationsDescription: "Systems currently modeled for review.",
    reportsDescription: "Completed report artifacts ready to share.",
    demoLoaded: "Demo workspace loaded",
    demoDescription:
      "A curated demo dataset is available for screenshots, portfolio walkthroughs, and stakeholder-facing product tours.",
    openDemoApp: "Open demo app",
    openDemoReport: "Open demo report",
    setupRequired: "Setup required",
    dbUnavailableTitle:
      "Development login works, but database access is not ready yet",
    dbUnavailableDescription:
      "The protected area is working and your session is valid. The next blocker is PostgreSQL authentication in .env. Once the real credentials are configured, workspace creation will work without changing this flow.",
    onboardingEyebrow: "Onboarding",
    onboardingTitle: "Start with your first audit context",
    onboardingDescription:
      "Create a workspace for a product, client, or business unit. Then register one application and run the first assessment to generate a flagship-grade report.",
    createFirstWorkspace: "Create first workspace",
    checklistTitle: "Recommended path",
    onboardingChecklist: [
      "Create a workspace to define the operating context.",
      "Register one application with clear business framing.",
      "Launch the first assessment and submit it for deterministic scoring.",
      "Open the executive-ready report artifact.",
    ],
    onboardingAside:
      "The fastest portfolio path is one serious workspace, one meaningful application, and one premium report.",
    spotlightEyebrow: "Report spotlight",
    spotlightTitle: "Flagship artifact",
    spotlightDescription:
      "Latest analyzed report with executive summary, risk matrix, delta narrative, and export-ready layout.",
    openApplication: "Open application",
    spotlightPendingEyebrow: "Flagship artifact pending",
    spotlightPendingTitle: "No analyzed report exists yet",
    spotlightPendingDescription:
      "You already have portfolio structure in place. The next milestone is submitting one assessment to unlock the premium report layer.",
    spotlightPendingChecklist: [
      "Enter one application.",
      "Create an assessment draft.",
      "Save structured answers.",
      "Submit for deterministic scoring.",
    ],
    spotlightPendingAside:
      "Once one run is analyzed, this spotlight becomes your flagship artifact entry point.",
    filtersEyebrow: "Filters",
    filtersTitle: "Operational view",
    workspaceFilterLabel: "Workspace",
    applicationFilterLabel: "Application",
    allWorkspaces: "All workspaces",
    allApplications: "All applications",
    applyFilters: "Apply filters",
    resetFilters: "Reset",
    recentSnapshotsEyebrow: "Recent report snapshots",
    recentSnapshotsTitle: "Decision-ready output",
    visibleCount: "{count} visible",
    filteredEmptyEyebrow: "Filtered view empty",
    filteredEmptyTitle: "No reports match the current selection",
    filteredEmptyDescription:
      "Clear filters or open another workspace/application combination to repopulate this operational view.",
    filteredEmptyChecklist: [
      "Reset workspace and application filters.",
      "Open a workspace with analyzed runs.",
      "Create a new analyzed report if this portfolio slice is still empty.",
    ],
    filteredEmptyAside:
      "This empty state is operational, not broken: the current scope simply has no analyzed snapshots.",
    workspacesSectionEyebrow: "Workspaces",
    workspacesSectionTitle: "Portfolio structure",
    applicationsRegistered: "{count} applications registered",
    latestReportSnapshot: "Latest report snapshot",
    latestReportScore: "Overall score {score}/100",
    openLatestReport: "Open latest report",
    openWorkspace: "Open workspace",
    noAnalyzedReport:
      "No analyzed report yet. Add an assessment cycle to turn this workspace into a portfolio-ready artifact stream.",
    overallLabel: "Overall",
    reportDateLabel: "Report date",
  },
  workspace: {
    setupEyebrow: "Workspace setup",
    createTitle: "Create workspace",
    createDescription:
      "A workspace is the top-level audit context. Use it for a client, product, platform, or business unit before registering applications under review.",
    recommendedPath:
      "Recommended path: create a workspace first, then add one application and run the first assessment to unlock a flagship report.",
    nameLabel: "Workspace name",
    createCta: "Create workspace",
    creatingCta: "Creating workspace...",
    idleHint:
      "This creates the top-level operating context for applications and reports.",
    pendingHint:
      "Workspace records are being provisioned and you will be redirected automatically.",
    eyebrow: "Workspace",
    addApplication: "Add application",
    emptyEyebrow: "Next step",
    emptyTitle: "Register the first application",
    emptyDescription:
      "This workspace exists, but it still needs a concrete system under review. Add one application to start the assessment workflow and generate the first report artifact.",
    addFirstApplication: "Add first application",
    backDashboard: "Back to dashboard",
    checklist: [
      "Add the primary product or system.",
      "Describe its business goal clearly.",
      "Launch the first assessment draft.",
      "Generate the first premium report.",
    ],
    aside:
      "A serious workspace should quickly converge into one representative application that demonstrates the audit experience end-to-end.",
  },
  application: {
    setupEyebrow: "Application setup",
    registerTitle: "Register application",
    registerDescription:
      "Capture the primary system you want to evaluate inside {workspaceName}. This becomes the anchor for assessments, reports, and run history.",
    framingHint:
      "Use a clear product name and describe the business goal behind the system. Better framing improves the quality of both deterministic reporting and AI enrichment.",
    nameLabel: "Application name",
    descriptionLabel: "Description",
    systemTypeLabel: "System type",
    primaryGoalLabel: "Primary goal",
    createCta: "Create application",
    creatingCta: "Creating application...",
    idleHint:
      "This anchors future assessments, report history, and executive output.",
    pendingHint:
      "Application metadata is being created and the product context is being prepared.",
    eyebrow: "Application",
    createAssessmentDraft: "Create assessment draft",
    latestReport: "Latest report",
    openReport: "Open report",
    assessmentDrafts: "Assessment drafts",
    noDraftEyebrow: "No draft yet",
    noDraftTitle: "Start the first assessment cycle",
    noDraftDescription:
      "Create a draft, answer the architecture questionnaire, submit it for deterministic scoring, and then open the premium report view.",
    createFirstAssessment: "Create first assessment",
    openWorkspace: "Open workspace",
    draftChecklist: [
      "Create a versioned assessment draft.",
      "Answer all architecture and delivery signals.",
      "Save the draft as needed.",
      "Submit to unlock scoring, risks, and report output.",
    ],
    draftAside:
      "This is where a registered application becomes a real product artifact inside Atlas.",
    reportAvailable: "Report available",
    structuredAnswersSaved: "{count} structured answers saved",
    questionnaireVersion: "questionnaire {version}",
    overallScore: "Overall score: {score}/100",
    latestReportDescription:
      "Open the premium report view to review executive summary, risk matrix, recommendations, and roadmap in one place.",
    latestReportScore: "Score {score}/100",
    systemTypes: {
      SAAS: "SaaS",
      ECOMMERCE: "E-commerce",
      INTERNAL_TOOL: "Internal tool",
      CONTENT_PLATFORM: "Content platform",
      MARKETPLACE: "Marketplace",
      OTHER: "Other",
    },
  },
  assessment: {
    draftEyebrow: "Assessment draft",
    createDraftTitle: "Create draft",
    createDraftDescription:
      "Initialize a versioned assessment record for {applicationName}. Once created, you will answer the questionnaire, save structured signals, and submit the draft for scoring.",
    applicationLabel: "Application",
    questionnaireVersion: "Questionnaire version: {version}",
    createDraftCta: "Create assessment draft",
    creatingDraftCta: "Creating assessment draft...",
    createDraftIdleHint:
      "A versioned draft will be created before any scoring is triggered.",
    createDraftPendingHint:
      "Assessment draft metadata is being initialized for this application.",
    questionnaireIntro:
      "Questionnaire {version}. Capture structured signals first, then submit the draft to generate a deterministic score, risk matrix, recommendations, and a premium report artifact.",
    progress: "Progress: {answered}/{total} answers captured.",
    openFullReport: "Open full report",
    deterministicScore: "Deterministic score",
    overallScore: "Overall score: {score}/100",
    dimensions: "Dimensions",
    priorityRisks: "Priority risks",
    noRisks: "No risk items were generated for this scorecard.",
    topRecommendations: "Top recommendations",
    noRecommendations: "No recommendations generated yet.",
    executiveSummary: "Executive summary",
    technicalSummary: "Technical summary",
    suggestedRoadmap: "Suggested roadmap",
    aiLayer: "AI enrichment layer",
    aiLayerDescription:
      "Uses {provider} to polish the deterministic report without replacing its underlying findings.",
    enrichAi: "Enrich with AI",
    enrichingAi: "Enriching report...",
    enrichIdleHint:
      "Adds executive polish without replacing deterministic findings.",
    enrichPendingHint:
      "The AI layer is translating technical output into premium business framing.",
    configureApiKey: "Configure {apiKey} to enable AI enrichment.",
    generatedWith: "Generated with",
    executivePolish: "Executive polish",
    businessFraming: "Business framing",
    roadmapRefinement: "Roadmap refinement",
    scoreSignal: "Score signal: {value}/4",
    draftPersistence: "Draft persistence enabled",
    draftPersistenceDescription:
      "Save answers as many times as needed before submitting the draft for scoring.",
    saveIdleHint:
      "Save preserves current answers; submit runs deterministic scoring and refreshes the report state.",
    savePendingHint:
      "Your assessment is being processed. Controls stay locked until persistence or scoring finishes.",
    saveDraft: "Save draft answers",
    savingDraft: "Saving draft...",
    submitAndScore: "Submit and score",
    scoringAssessment: "Scoring assessment...",
  },
  report: {
    titleSuffix: "Architecture Intelligence Report",
    coverDescription:
      "Executive-grade audit artifact for architecture, performance, scalability, maintainability, and operational maturity.",
    workspace: "Workspace",
    application: "Application",
    reportDate: "Report date",
    overallScore: "Overall score",
    backToApplication: "Back to application",
    openAssessment: "Open assessment",
    shareReadyView: "Share-ready view",
    shareReadyMode:
      "Share-ready mode enabled. This layout is optimized for stakeholder review and print-to-PDF export.",
    shareReadyReport: "Share-ready report",
    reportVersion: "Report v2",
    premiumDescription:
      "Premium architecture intelligence report built from deterministic scoring first, with AI used only as an interpretation layer.",
    runLabel: "Run",
    assessmentLabel: "Assessment",
    generatedAt: "Generated",
    visualLabels: {
      priorities: {
        CRITICAL: "Critical",
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
      },
      severities: {
        CRITICAL: "Critical",
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
      },
      categories: {
        ARCHITECTURE: "Architecture",
        PERFORMANCE: "Performance",
        SCALABILITY: "Scalability",
        MAINTAINABILITY: "Maintainability",
        OPERABILITY: "Operability",
      },
      efforts: {
        HIGH: "High",
        MEDIUM: "Medium",
        LOW: "Low",
      },
    },
    runNavigation: "Run navigation",
    latestPreviousReports: "Latest / previous reports",
    jumpToLatest: "Jump to latest",
    current: "Current",
    previous: "Previous",
    openPrevious: "Open previous",
    noPreviousReport: "No previous report available yet.",
    shareReadyExport: "Share-ready export",
    clientSafePresentation: "Client-safe presentation",
    shareReadyDescription:
      "Use the share-ready view when you want a cleaner executive-facing report without product navigation chrome.",
    openShareReady: "Open share-ready",
    compareRuns: "Compare runs",
    scoreDeltasNarrative: "Score deltas & improvement narrative",
    comparedAgainstRun: "Compared against run {runId}",
    baselineRun: "Baseline run",
    analysisRunHistory: "Analysis run history",
    reportLineage: "Report lineage",
    runsCount: "{count} runs",
    scoreBaselineDescription:
      "Current architecture maturity baseline for decision-makers and delivery planning.",
    architecture: "Architecture",
    performance: "Performance",
    scalability: "Scalability",
    maintainability: "Maintainability",
    operability: "Operability",
    executiveSummary: "Executive summary",
    technicalSummary: "Technical summary",
    priorityRisks: "Priority risks",
    riskMatrix: "Risk matrix",
    itemsCount: "{count} items",
    recommendedActions: "Recommended actions",
    executionPriorities: "Execution priorities",
    suggestedRoadmap: "Suggested roadmap",
    improvementPathByPhase: "Improvement path by phase",
    aiEnrichment: "AI enrichment",
    executivePolishLayer: "Executive polish layer",
    executivePolish: "Executive polish",
    businessFraming: "Business framing",
    shareReadyNote: "Share-ready note",
    shareReadyNoteDescription:
      "This view is optimized for executive sharing, stakeholder review, and browser print-to-PDF workflows.",
    exportPdf: "Export to PDF",
    labels: {
      overall: "Overall",
      architecture: "Architecture",
      performance: "Performance",
      scalability: "Scalability",
      maintainability: "Maintainability",
      operability: "Operability",
    },
    deltaCurrent: "Current",
    deltaVsPrevious: "vs previous {value}",
    statuses: {
      run: {
        COMPLETED: "Completed",
        PROCESSING: "Processing",
        FAILED: "Failed",
      },
      assessment: {
        DRAFT: "Draft",
        SUBMITTED: "Submitted",
        ANALYZED: "Analyzed",
      },
    },
    narrative: {
      firstRun:
        "This is the first completed report for this application, so it establishes the baseline for future comparisons.",
      unavailable: "Comparison data is unavailable.",
      flat:
        "This run is effectively flat versus the previous report, which suggests execution remained stable but no measurable architecture maturity gain was captured yet.",
      overallImproved: "improved",
      overallRegressed: "regressed",
      overallUnchanged: "remained unchanged",
      strongestPositive: "with the strongest positive movement in {label} (+{delta})",
      strongestRegression:
        "while the main regression appeared in {label} ({delta})",
      unchangedDimensions:
        "{count} dimension(s) remained unchanged, which is useful for separating true movement from noise",
      sentence:
        "Compared with the previous run, the overall score {direction} by {delta} points",
    },
  },
  flash: {
    workspaceCreatedTitle: "Workspace created",
    workspaceCreatedDescription:
      "{name} is ready for application setup and assessment work.",
    workspaceCreateErrorTitle: "Workspace creation failed",
    workspaceCreateErrorDescription:
      "Check the workspace name and local database availability, then try again.",
    applicationCreatedTitle: "Application registered",
    applicationCreatedDescription:
      "{name} is ready for its first assessment cycle.",
    applicationCreateErrorTitle: "Application setup failed",
    applicationCreateErrorDescription:
      "Review the form fields and ensure the target workspace is still available.",
    assessmentDraftCreatedTitle: "Assessment draft created",
    assessmentDraftCreatedDescription:
      "The questionnaire is ready. Capture structured signals before running deterministic scoring.",
    assessmentDraftCreateErrorTitle: "Assessment draft failed",
    assessmentDraftCreateErrorDescription:
      "The application could not initialize a new assessment draft. Try again from the application page.",
    draftSavedTitle: "Draft saved",
    draftSavedDescription:
      "Structured answers were persisted successfully. You can keep editing or submit for scoring.",
    draftSaveErrorTitle: "Draft save failed",
    draftSaveErrorDescription:
      "Answers could not be persisted. Review the questionnaire and try saving again.",
    assessmentAnalyzedTitle: "Assessment analyzed",
    assessmentAnalyzedDescription:
      "Deterministic scoring, recommendations, and the report artifact were generated successfully.",
    assessmentAnalyzeErrorTitle: "Scoring failed",
    assessmentAnalyzeErrorDescription:
      "The assessment could not be analyzed. Confirm all required answers are saved and try again.",
    aiEnrichmentCompletedTitle: "AI enrichment completed",
    aiEnrichmentCompletedDescription:
      "The deterministic report now includes executive polish and business framing.",
    aiEnrichmentErrorTitle: "AI enrichment failed",
    aiEnrichmentErrorDescription:
      "The AI layer could not complete. Check provider configuration or retry in a moment.",
  },
} as const;
