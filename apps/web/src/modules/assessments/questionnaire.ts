import type { Locale } from "@/i18n/config";

type LocalizedText = {
  en: string;
  es: string;
};

export type AssessmentQuestion = {
  key: string;
  label: LocalizedText;
  help: LocalizedText;
  options: Array<{
    value: string;
    label: LocalizedText;
    normalizedValue: number;
  }>;
};

export type AssessmentSectionDefinition = {
  key: string;
  title: LocalizedText;
  description: LocalizedText;
  questions: AssessmentQuestion[];
};

export const assessmentQuestionnaireV1: AssessmentSectionDefinition[] = [
  {
    key: "architecture",
    title: { en: "Architecture", es: "Arquitectura" },
    description: {
      en: "Core system boundaries, modularity, and capacity to evolve safely.",
      es: "Límites centrales del sistema, modularidad y capacidad para evolucionar con seguridad.",
    },
    questions: [
      {
        key: "architecture_modularity",
        label: {
          en: "How modular is the system structure?",
          es: "¿Qué tan modular es la estructura del sistema?",
        },
        help: {
          en: "Evaluate separation of responsibilities and change isolation.",
          es: "Evalúa separación de responsabilidades y aislamiento del cambio.",
        },
        options: [
          { value: "poor", label: { en: "Tightly coupled", es: "Fuertemente acoplado" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Partially modular", es: "Parcialmente modular" }, normalizedValue: 2 },
          { value: "good", label: { en: "Clearly modular", es: "Claramente modular" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Well bounded and evolvable", es: "Bien delimitado y evolutivo" }, normalizedValue: 4 },
        ],
      },
      {
        key: "architecture_decisions",
        label: {
          en: "How explicit are the architectural decisions?",
          es: "¿Qué tan explícitas son las decisiones arquitectónicas?",
        },
        help: {
          en: "Look for standards, documented patterns, and consistent choices.",
          es: "Busca estándares, patrones documentados y decisiones consistentes.",
        },
        options: [
          { value: "poor", label: { en: "Ad hoc", es: "Ad hoc" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Some shared conventions", es: "Algunas convenciones compartidas" }, normalizedValue: 2 },
          { value: "good", label: { en: "Mostly explicit", es: "Mayormente explícitas" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Documented and enforced", es: "Documentadas y aplicadas" }, normalizedValue: 4 },
        ],
      },
    ],
  },
  {
    key: "performance",
    title: { en: "Performance", es: "Performance" },
    description: {
      en: "Signals around latency, efficiency, and bottlenecks in the current platform.",
      es: "Señales sobre latencia, eficiencia y cuellos de botella en la plataforma actual.",
    },
    questions: [
      {
        key: "performance_visibility",
        label: {
          en: "How visible are performance bottlenecks today?",
          es: "¿Qué tan visibles son hoy los cuellos de botella de performance?",
        },
        help: {
          en: "Assess profiling, monitoring, and performance awareness.",
          es: "Evalúa profiling, monitoreo y conciencia sobre performance.",
        },
        options: [
          { value: "poor", label: { en: "No visibility", es: "Sin visibilidad" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Basic visibility", es: "Visibilidad básica" }, normalizedValue: 2 },
          { value: "good", label: { en: "Tracked regularly", es: "Seguimiento regular" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Measured and optimized", es: "Medido y optimizado" }, normalizedValue: 4 },
        ],
      },
      {
        key: "performance_strategy",
        label: {
          en: "How mature is the performance strategy?",
          es: "¿Qué tan madura es la estrategia de performance?",
        },
        help: {
          en: "Caching, payload discipline, rendering strategy, and resource usage.",
          es: "Caching, disciplina de payload, estrategia de rendering y uso de recursos.",
        },
        options: [
          { value: "poor", label: { en: "Reactive only", es: "Solo reactiva" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Some practices", es: "Algunas prácticas" }, normalizedValue: 2 },
          { value: "good", label: { en: "Intentional strategy", es: "Estrategia intencional" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Operationally mature", es: "Operativamente madura" }, normalizedValue: 4 },
        ],
      },
    ],
  },
  {
    key: "scalability",
    title: { en: "Scalability", es: "Escalabilidad" },
    description: {
      en: "Ability to handle growth in traffic, team size, and business complexity.",
      es: "Capacidad de manejar crecimiento en tráfico, tamaño de equipo y complejidad del negocio.",
    },
    questions: [
      {
        key: "scalability_readiness",
        label: {
          en: "How ready is the application for usage growth?",
          es: "¿Qué tan preparada está la aplicación para crecer en uso?",
        },
        help: {
          en: "Consider bottlenecks, elasticity, and systemic limits.",
          es: "Considera cuellos de botella, elasticidad y límites sistémicos.",
        },
        options: [
          { value: "poor", label: { en: "Fragile under growth", es: "Frágil ante el crecimiento" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Some headroom", es: "Algo de holgura" }, normalizedValue: 2 },
          { value: "good", label: { en: "Reasonably ready", es: "Razonablemente preparada" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Designed for growth", es: "Diseñada para crecer" }, normalizedValue: 4 },
        ],
      },
      {
        key: "scalability_operating_model",
        label: {
          en: "How scalable is the operating model around the app?",
          es: "¿Qué tan escalable es el modelo operativo alrededor de la app?",
        },
        help: {
          en: "Deployments, team coordination, and environment management.",
          es: "Deployments, coordinación de equipo y gestión de entornos.",
        },
        options: [
          { value: "poor", label: { en: "Mostly manual", es: "Mayormente manual" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Partially standardized", es: "Parcialmente estandarizado" }, normalizedValue: 2 },
          { value: "good", label: { en: "Repeatable process", es: "Proceso repetible" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Highly standardized", es: "Altamente estandarizado" }, normalizedValue: 4 },
        ],
      },
    ],
  },
  {
    key: "maintainability",
    title: { en: "Maintainability", es: "Mantenibilidad" },
    description: {
      en: "Ease of making changes safely, onboarding engineers, and reducing delivery friction.",
      es: "Facilidad para hacer cambios con seguridad, incorporar ingenieros y reducir fricción de delivery.",
    },
    questions: [
      {
        key: "maintainability_codebase",
        label: {
          en: "How maintainable is the codebase?",
          es: "¿Qué tan mantenible es el codebase?",
        },
        help: {
          en: "Readability, consistency, testability, and upgrade friction.",
          es: "Legibilidad, consistencia, testabilidad y fricción de upgrades.",
        },
        options: [
          { value: "poor", label: { en: "Hard to change safely", es: "Difícil de cambiar con seguridad" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Mixed quality", es: "Calidad mixta" }, normalizedValue: 2 },
          { value: "good", label: { en: "Mostly maintainable", es: "Mayormente mantenible" }, normalizedValue: 3 },
          { value: "strong", label: { en: "Easy to evolve", es: "Fácil de evolucionar" }, normalizedValue: 4 },
        ],
      },
      {
        key: "maintainability_delivery",
        label: {
          en: "How reliable is delivery quality today?",
          es: "¿Qué tan confiable es hoy la calidad del delivery?",
        },
        help: {
          en: "Testing, review discipline, CI confidence, and rollout safety.",
          es: "Testing, disciplina de revisión, confianza en CI y seguridad de rollout.",
        },
        options: [
          { value: "poor", label: { en: "Frequent regressions", es: "Regresiones frecuentes" }, normalizedValue: 1 },
          { value: "fair", label: { en: "Inconsistent quality", es: "Calidad inconsistente" }, normalizedValue: 2 },
          { value: "good", label: { en: "Reliable delivery", es: "Delivery confiable" }, normalizedValue: 3 },
          { value: "strong", label: { en: "High confidence delivery", es: "Alta confianza en delivery" }, normalizedValue: 4 },
        ],
      },
    ],
  },
];

export function getAssessmentQuestionnaire(locale: Locale) {
  return assessmentQuestionnaireV1.map((section) => ({
    key: section.key,
    title: section.title[locale],
    description: section.description[locale],
    questions: section.questions.map((question) => ({
      key: question.key,
      label: question.label[locale],
      help: question.help[locale],
      options: question.options.map((option) => ({
        value: option.value,
        label: option.label[locale],
        normalizedValue: option.normalizedValue,
      })),
    })),
  }));
}

export const assessmentQuestionMap = new Map(
  assessmentQuestionnaireV1.flatMap((section) =>
    section.questions.map((question) => [question.key, { section, question }] as const),
  ),
);
