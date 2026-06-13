export const es = {
  common: {
    brandTagline: "Inteligencia de Arquitectura",
    userFallback: "Usuario autenticado",
    signOut: "Cerrar sesión",
    localeEnglish: "EN",
    localeSpanish: "ES",
    dismiss: "Cerrar",
    ready: "Listo",
    processing: "Procesando",
  },
  marketing: {
    eyebrow: "SevenTec Atlas",
    title:
      "Inteligencia de arquitectura para equipos que necesitan claridad técnica y reporting con nivel de negocio",
    description:
      "Evalúa arquitectura, performance, escalabilidad y mantenibilidad con scoring determinista primero, y luego traduce los hallazgos técnicos en narrativas ejecutivas sobrias y artefactos exportables.",
    enterPlatform: "Entrar a la plataforma",
    openDashboard: "Abrir dashboard",
    cards: [
      {
        eyebrow: "Determinista primero",
        title: "Rigor técnico antes que narrativa",
        description:
          "Los scorecards, riesgos y recomendaciones nacen de señales estructuradas, no de generación libre.",
      },
      {
        eyebrow: "Output ejecutivo",
        title: "Reportes que realmente puedes presentar",
        description:
          "Layouts share-ready, resúmenes premium y narrativas comparativas hacen que el output sea útil más allá de ingeniería.",
      },
      {
        eyebrow: "Producto, no gimmick",
        title: "Diseñado para trabajo serio de arquitectura",
        description:
          "La plataforma está pensada para comunicar madurez, priorización y mejora en el tiempo.",
      },
    ],
  },
  signIn: {
    title: "Iniciar sesión",
    description:
      "Entra al flagship MVP. En desarrollo, usa el acceso guiado mientras el OAuth productivo todavía se termina de preparar.",
    devAccessTitle: "Acceso de desarrollo",
    devAccessDescription:
      "Recomendado para iteración de producto, demos de portafolio y validación local mientras se preparan los identity providers productivos.",
    name: "Nombre",
    email: "Correo",
    enterDevMode: "Entrar en modo desarrollo",
    openingWorkspace: "Abriendo workspace...",
    devIdleHint:
      "Usa el acceso guiado para entrar al producto inmediatamente.",
    devPendingHint:
      "La autenticación se está preparando y tu workspace se abrirá en un momento.",
    continueGithub: "Continuar con GitHub",
    redirectingGithub: "Redirigiendo a GitHub...",
    githubIdleHint: "El acceso productivo usará el flujo del proveedor.",
    githubPendingHint:
      "El navegador está siendo redirigido al proveedor de identidad.",
    githubNotConfigured: "GitHub OAuth todavía no está configurado en este entorno.",
  },
  dashboard: {
    eyebrow: "Inteligencia de Arquitectura",
    title: "Convierte señales de arquitectura en reportes con nivel ejecutivo",
    description:
      "Revisa evaluaciones deterministas, compara evolución entre ejecuciones y presenta un artefacto B2B sobrio que conecta hallazgos técnicos con riesgo de delivery y escala.",
    createWorkspace: "Crear workspace",
    openFlagshipReport: "Abrir flagship report",
    workspaces: "Workspaces",
    applications: "Aplicaciones",
    reports: "Reportes",
    workspacesDescription: "Contextos activos de cliente o producto.",
    applicationsDescription: "Sistemas actualmente modelados para evaluación.",
    reportsDescription: "Artefactos de reporte completados y listos para compartir.",
    demoLoaded: "Demo workspace cargado",
    demoDescription:
      "Hay un dataset demo curado disponible para screenshots, recorridos de portafolio y demos orientadas a stakeholders.",
    openDemoApp: "Abrir demo app",
    openDemoReport: "Abrir demo report",
    setupRequired: "Configuración requerida",
    dbUnavailableTitle:
      "El login de desarrollo funciona, pero el acceso a la base de datos todavía no está listo",
    dbUnavailableDescription:
      "El área protegida funciona y tu sesión es válida. El siguiente bloqueo es la autenticación de PostgreSQL en .env. Una vez configuradas las credenciales reales, la creación de workspaces funcionará sin cambiar este flujo.",
    onboardingEyebrow: "Onboarding",
    onboardingTitle: "Comienza con tu primer contexto de auditoría",
    onboardingDescription:
      "Crea un workspace para un producto, cliente o unidad de negocio. Luego registra una aplicación y corre la primera evaluación para generar un reporte de nivel flagship.",
    createFirstWorkspace: "Crear primer workspace",
    checklistTitle: "Camino recomendado",
    onboardingChecklist: [
      "Crea un workspace para definir el contexto operativo.",
      "Registra una aplicación con framing de negocio claro.",
      "Lanza la primera evaluación y envíala a scoring determinista.",
      "Abre el artefacto de reporte listo para ejecutivos.",
    ],
    onboardingAside:
      "La ruta más rápida para portafolio es un workspace serio, una aplicación significativa y un reporte premium.",
    spotlightEyebrow: "Spotlight de reporte",
    spotlightTitle: "Artefacto flagship",
    spotlightDescription:
      "Último reporte analizado con resumen ejecutivo, matriz de riesgos, narrativa de deltas y layout listo para exportar.",
    openApplication: "Abrir aplicación",
    spotlightPendingEyebrow: "Artefacto flagship pendiente",
    spotlightPendingTitle: "Todavía no existe un reporte analizado",
    spotlightPendingDescription:
      "Ya tienes estructura de portafolio en pie. El siguiente hito es enviar una evaluación para desbloquear la capa premium de reporte.",
    spotlightPendingChecklist: [
      "Entra a una aplicación.",
      "Crea un borrador de evaluación.",
      "Guarda respuestas estructuradas.",
      "Envía a scoring determinista.",
    ],
    spotlightPendingAside:
      "Cuando un run quede analizado, este spotlight se convierte en tu punto de entrada al artefacto flagship.",
    filtersEyebrow: "Filtros",
    filtersTitle: "Vista operativa",
    workspaceFilterLabel: "Workspace",
    applicationFilterLabel: "Aplicación",
    allWorkspaces: "Todos los workspaces",
    allApplications: "Todas las aplicaciones",
    applyFilters: "Aplicar filtros",
    resetFilters: "Resetear",
    recentSnapshotsEyebrow: "Snapshots recientes de reporte",
    recentSnapshotsTitle: "Output listo para decisión",
    visibleCount: "{count} visibles",
    filteredEmptyEyebrow: "Vista filtrada vacía",
    filteredEmptyTitle: "No hay reportes que coincidan con la selección actual",
    filteredEmptyDescription:
      "Limpia los filtros o abre otra combinación de workspace/aplicación para repoblar esta vista operativa.",
    filteredEmptyChecklist: [
      "Resetea los filtros de workspace y aplicación.",
      "Abre un workspace con runs analizados.",
      "Crea un nuevo reporte analizado si este slice de portafolio sigue vacío.",
    ],
    filteredEmptyAside:
      "Este empty state es operativo, no un error: el scope actual simplemente no tiene snapshots analizados.",
    workspacesSectionEyebrow: "Workspaces",
    workspacesSectionTitle: "Estructura del portafolio",
    applicationsRegistered: "{count} aplicaciones registradas",
    latestReportSnapshot: "Último snapshot de reporte",
    latestReportScore: "Score general {score}/100",
    openLatestReport: "Abrir último reporte",
    openWorkspace: "Abrir workspace",
    noAnalyzedReport:
      "Todavía no hay un reporte analizado. Agrega un ciclo de assessment para convertir este workspace en un stream de artefactos listo para portafolio.",
    overallLabel: "General",
    reportDateLabel: "Fecha del reporte",
  },
  workspace: {
    setupEyebrow: "Configuración de workspace",
    createTitle: "Crear workspace",
    createDescription:
      "Un workspace es el contexto superior de auditoría. Úsalo para un cliente, producto, plataforma o unidad de negocio antes de registrar aplicaciones bajo revisión.",
    recommendedPath:
      "Camino recomendado: crea primero un workspace, luego agrega una aplicación y corre el primer assessment para desbloquear un flagship report.",
    nameLabel: "Nombre del workspace",
    createCta: "Crear workspace",
    creatingCta: "Creando workspace...",
    idleHint:
      "Esto crea el contexto operativo superior para aplicaciones y reportes.",
    pendingHint:
      "Se están aprovisionando los registros del workspace y serás redirigido automáticamente.",
    eyebrow: "Workspace",
    addApplication: "Agregar aplicación",
    emptyEyebrow: "Siguiente paso",
    emptyTitle: "Registrar la primera aplicación",
    emptyDescription:
      "Este workspace ya existe, pero todavía necesita un sistema concreto bajo revisión. Agrega una aplicación para iniciar el workflow de assessment y generar el primer artefacto de reporte.",
    addFirstApplication: "Agregar primera aplicación",
    backDashboard: "Volver al dashboard",
    checklist: [
      "Agrega el producto o sistema principal.",
      "Describe claramente su objetivo de negocio.",
      "Inicia el primer assessment draft.",
      "Genera el primer reporte premium.",
    ],
    aside:
      "Un workspace serio debería converger rápido en una aplicación representativa que demuestre la experiencia end-to-end de auditoría.",
  },
  application: {
    setupEyebrow: "Configuración de aplicación",
    registerTitle: "Registrar aplicación",
    registerDescription:
      "Captura el sistema principal que quieres evaluar dentro de {workspaceName}. Esto se convierte en el ancla para evaluaciones, reportes e historial de ejecuciones.",
    framingHint:
      "Usa un nombre claro del producto y describe el objetivo de negocio detrás del sistema. Un mejor framing mejora la calidad tanto del reporte determinista como del enriquecimiento con IA.",
    nameLabel: "Nombre de la aplicación",
    descriptionLabel: "Descripción",
    systemTypeLabel: "Tipo de sistema",
    primaryGoalLabel: "Objetivo principal",
    createCta: "Crear aplicación",
    creatingCta: "Creando aplicación...",
    idleHint:
      "Esto ancla futuras evaluaciones, historial de reportes y output ejecutivo.",
    pendingHint:
      "Se está creando el metadata de la aplicación y preparando el contexto del producto.",
    eyebrow: "Aplicación",
    createAssessmentDraft: "Crear borrador de evaluación",
    latestReport: "Último reporte",
    openReport: "Abrir reporte",
    assessmentDrafts: "Borradores de evaluación",
    noDraftEyebrow: "Aún no hay draft",
    noDraftTitle: "Inicia el primer ciclo de evaluación",
    noDraftDescription:
      "Crea un draft, responde el cuestionario de arquitectura, envíalo a scoring determinista y luego abre la vista premium del reporte.",
    createFirstAssessment: "Crear primera evaluación",
    openWorkspace: "Abrir workspace",
    draftChecklist: [
      "Crea un borrador de evaluación versionado.",
      "Responde todas las señales de arquitectura y delivery.",
      "Guarda el draft las veces que necesites.",
      "Envía para desbloquear scoring, riesgos y output de reporte.",
    ],
    draftAside:
      "Aquí es donde una aplicación registrada se convierte en un artefacto real de producto dentro de Atlas.",
    reportAvailable: "Reporte disponible",
    structuredAnswersSaved: "{count} respuestas estructuradas guardadas",
    questionnaireVersion: "cuestionario {version}",
    overallScore: "Score general: {score}/100",
    latestReportDescription:
      "Abre la vista premium del reporte para revisar executive summary, matriz de riesgos, recomendaciones y roadmap en un solo lugar.",
    latestReportScore: "Score {score}/100",
    systemTypes: {
      SAAS: "SaaS",
      ECOMMERCE: "E-commerce",
      INTERNAL_TOOL: "Herramienta interna",
      CONTENT_PLATFORM: "Plataforma de contenido",
      MARKETPLACE: "Marketplace",
      OTHER: "Otro",
    },
  },
  assessment: {
    draftEyebrow: "Borrador de evaluación",
    createDraftTitle: "Crear draft",
    createDraftDescription:
      "Inicializa un registro versionado de evaluación para {applicationName}. Una vez creado, responderás el cuestionario, guardarás señales estructuradas y enviarás el borrador a scoring.",
    applicationLabel: "Aplicación",
    questionnaireVersion: "Versión del cuestionario: {version}",
    createDraftCta: "Crear borrador de evaluación",
    creatingDraftCta: "Creando borrador de evaluación...",
    createDraftIdleHint:
      "Se creará un draft versionado antes de disparar cualquier scoring.",
    createDraftPendingHint:
      "Se está inicializando el metadata del borrador de evaluación para esta aplicación.",
    questionnaireIntro:
      "Cuestionario {version}. Captura primero señales estructuradas y luego envía el draft para generar score determinista, matriz de riesgos, recomendaciones y un artefacto premium de reporte.",
    progress: "Progreso: {answered}/{total} respuestas capturadas.",
    openFullReport: "Abrir reporte completo",
    deterministicScore: "Score determinista",
    overallScore: "Score general: {score}/100",
    dimensions: "Dimensiones",
    priorityRisks: "Riesgos prioritarios",
    noRisks: "No se generaron riesgos para este scorecard.",
    topRecommendations: "Recomendaciones principales",
    noRecommendations: "Todavía no se generaron recomendaciones.",
    executiveSummary: "Resumen ejecutivo",
    technicalSummary: "Resumen técnico",
    suggestedRoadmap: "Roadmap sugerido",
    aiLayer: "Capa de enriquecimiento IA",
    aiLayerDescription:
      "Usa {provider} para pulir el reporte determinista sin reemplazar sus hallazgos base.",
    enrichAi: "Enriquecer con IA",
    enrichingAi: "Enriqueciendo reporte...",
    enrichIdleHint:
      "Agrega pulido ejecutivo sin reemplazar los hallazgos deterministas.",
    enrichPendingHint:
      "La capa IA está traduciendo output técnico en framing premium de negocio.",
    configureApiKey: "Configura {apiKey} para habilitar el enriquecimiento IA.",
    generatedWith: "Generado con",
    executivePolish: "Pulido ejecutivo",
    businessFraming: "Framing de negocio",
    roadmapRefinement: "Refinamiento del roadmap",
    scoreSignal: "Señal de score: {value}/4",
    draftPersistence: "Persistencia de draft habilitada",
    draftPersistenceDescription:
      "Guarda respuestas todas las veces que necesites antes de enviar el draft a scoring.",
    saveIdleHint:
      "Guardar preserva las respuestas actuales; enviar corre el scoring determinista y refresca el estado del reporte.",
    savePendingHint:
      "Tu assessment está siendo procesado. Los controles quedan bloqueados hasta que termine la persistencia o el scoring.",
    saveDraft: "Guardar respuestas del draft",
    savingDraft: "Guardando draft...",
    submitAndScore: "Enviar y puntuar",
    scoringAssessment: "Puntuando evaluación...",
  },
  report: {
    titleSuffix: "Reporte de Inteligencia de Arquitectura",
    coverDescription:
      "Artefacto de auditoría con nivel ejecutivo para arquitectura, rendimiento, escalabilidad, mantenibilidad y madurez operativa.",
    workspace: "Workspace",
    application: "Aplicación",
    reportDate: "Fecha del reporte",
    overallScore: "Score general",
    backToApplication: "Volver a la aplicación",
    openAssessment: "Abrir evaluación",
    shareReadyView: "Vista share-ready",
    shareReadyMode:
      "Modo share-ready habilitado. Este layout está optimizado para revisión de stakeholders y exportación print-to-PDF.",
    shareReadyReport: "Reporte share-ready",
    reportVersion: "Reporte v2",
    premiumDescription:
      "Reporte premium de arquitectura construido desde scoring determinista primero, usando IA solo como capa de interpretación.",
    runLabel: "Ejecución",
    assessmentLabel: "Evaluación",
    generatedAt: "Generado",
    visualLabels: {
      priorities: {
        CRITICAL: "Crítico",
        HIGH: "Alto",
        MEDIUM: "Medio",
        LOW: "Bajo",
      },
      severities: {
        CRITICAL: "Crítico",
        HIGH: "Alto",
        MEDIUM: "Medio",
        LOW: "Bajo",
      },
      categories: {
        ARCHITECTURE: "Arquitectura",
        PERFORMANCE: "Rendimiento",
        SCALABILITY: "Escalabilidad",
        MAINTAINABILITY: "Mantenibilidad",
        OPERABILITY: "Operabilidad",
      },
      efforts: {
        HIGH: "Alto",
        MEDIUM: "Medio",
        LOW: "Bajo",
      },
    },
    runNavigation: "Navegación de runs",
    latestPreviousReports: "Últimos / reportes previos",
    jumpToLatest: "Ir al último",
    current: "Actual",
    previous: "Previo",
    openPrevious: "Abrir previo",
    noPreviousReport: "Todavía no hay un reporte previo disponible.",
    shareReadyExport: "Exportación share-ready",
    clientSafePresentation: "Presentación segura para cliente",
    shareReadyDescription:
      "Usa la vista share-ready cuando quieras un reporte más limpio y orientado a ejecutivos, sin chrome de navegación del producto.",
    openShareReady: "Abrir share-ready",
    compareRuns: "Comparar runs",
    scoreDeltasNarrative: "Deltas de score y narrativa de mejora",
    comparedAgainstRun: "Comparado contra el run {runId}",
    baselineRun: "Run base",
    analysisRunHistory: "Historial de analysis runs",
    reportLineage: "Linaje del reporte",
    runsCount: "{count} runs",
    scoreBaselineDescription:
      "Baseline actual de madurez arquitectónica para tomadores de decisión y planificación de delivery.",
    architecture: "Arquitectura",
    performance: "Rendimiento",
    scalability: "Escalabilidad",
    maintainability: "Mantenibilidad",
    operability: "Operabilidad",
    executiveSummary: "Resumen ejecutivo",
    technicalSummary: "Resumen técnico",
    priorityRisks: "Riesgos prioritarios",
    riskMatrix: "Matriz de riesgos",
    itemsCount: "{count} ítems",
    recommendedActions: "Acciones recomendadas",
    executionPriorities: "Prioridades de ejecución",
    suggestedRoadmap: "Roadmap sugerido",
    improvementPathByPhase: "Ruta de mejora por fase",
    aiEnrichment: "Enriquecimiento IA",
    executivePolishLayer: "Capa de pulido ejecutivo",
    executivePolish: "Pulido ejecutivo",
    businessFraming: "Framing de negocio",
    shareReadyNote: "Nota share-ready",
    shareReadyNoteDescription:
      "Esta vista está optimizada para compartir con ejecutivos, revisión de stakeholders y flujos de print-to-PDF desde el navegador.",
    exportPdf: "Exportar a PDF",
    labels: {
      overall: "General",
      architecture: "Arquitectura",
      performance: "Rendimiento",
      scalability: "Escalabilidad",
      maintainability: "Mantenibilidad",
      operability: "Operabilidad",
    },
    deltaCurrent: "Actual",
    deltaVsPrevious: "vs previo {value}",
    statuses: {
      run: {
        COMPLETED: "Completado",
        PROCESSING: "Procesando",
        FAILED: "Fallido",
      },
      assessment: {
        DRAFT: "Borrador",
        SUBMITTED: "Enviado",
        ANALYZED: "Analizado",
      },
    },
    narrative: {
      firstRun:
        "Este es el primer reporte completado para esta aplicación, por lo que establece la línea base para comparaciones futuras.",
      unavailable: "Los datos de comparación no están disponibles.",
      flat:
        "Este run está prácticamente plano frente al reporte anterior, lo que sugiere que la ejecución se mantuvo estable pero aún no se capturó una mejora medible de madurez arquitectónica.",
      overallImproved: "mejoró",
      overallRegressed: "retrocedió",
      overallUnchanged: "se mantuvo sin cambios",
      strongestPositive: "con el movimiento positivo más fuerte en {label} (+{delta})",
      strongestRegression:
        "mientras que la regresión principal apareció en {label} ({delta})",
      unchangedDimensions:
        "{count} dimensión(es) se mantuvieron sin cambios, lo que ayuda a separar movimiento real de ruido",
      sentence:
        "Comparado con el run anterior, el score general {direction} en {delta} puntos",
    },
  },
  flash: {
    workspaceCreatedTitle: "Workspace creado",
    workspaceCreatedDescription:
      "{name} ya está listo para configuración de aplicaciones y trabajo de evaluación.",
    workspaceCreateErrorTitle: "Falló la creación del workspace",
    workspaceCreateErrorDescription:
      "Revisa el nombre del workspace y la disponibilidad de la base local, luego vuelve a intentarlo.",
    applicationCreatedTitle: "Aplicación registrada",
    applicationCreatedDescription:
      "{name} ya está lista para su primer ciclo de evaluación.",
    applicationCreateErrorTitle: "Falló la configuración de la aplicación",
    applicationCreateErrorDescription:
      "Revisa los campos del formulario y asegúrate de que el workspace objetivo siga disponible.",
    assessmentDraftCreatedTitle: "Borrador de evaluación creado",
    assessmentDraftCreatedDescription:
      "El cuestionario ya está listo. Captura señales estructuradas antes de correr el scoring determinista.",
    assessmentDraftCreateErrorTitle: "Falló el borrador de evaluación",
    assessmentDraftCreateErrorDescription:
      "La aplicación no pudo inicializar un nuevo assessment draft. Vuelve a intentarlo desde la página de la aplicación.",
    draftSavedTitle: "Draft guardado",
    draftSavedDescription:
      "Las respuestas estructuradas se persistieron correctamente. Puedes seguir editando o enviar a scoring.",
    draftSaveErrorTitle: "Falló el guardado del draft",
    draftSaveErrorDescription:
      "No se pudieron persistir las respuestas. Revisa el cuestionario e intenta guardar nuevamente.",
    assessmentAnalyzedTitle: "Evaluación analizada",
    assessmentAnalyzedDescription:
      "El scoring determinista, las recomendaciones y el artefacto de reporte se generaron correctamente.",
    assessmentAnalyzeErrorTitle: "Falló el scoring",
    assessmentAnalyzeErrorDescription:
      "No se pudo analizar el assessment. Confirma que todas las respuestas requeridas estén guardadas e inténtalo de nuevo.",
    aiEnrichmentCompletedTitle: "Enriquecimiento IA completado",
    aiEnrichmentCompletedDescription:
      "El reporte determinista ahora incluye pulido ejecutivo y framing de negocio.",
    aiEnrichmentErrorTitle: "Falló el enriquecimiento IA",
    aiEnrichmentErrorDescription:
      "La capa IA no pudo completarse. Revisa la configuración del proveedor o vuelve a intentarlo en un momento.",
  },
} as const;
