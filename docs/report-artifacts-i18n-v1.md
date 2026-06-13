# Report Artifacts i18n v1

## Decision

SevenTec Atlas should keep **report UI locale-aware** and move toward **report artifacts persisted per locale** instead of relying on one shared artifact body for every language.

For MVP+1, the correct model is:

- deterministic report base generated for `en` and `es`
- AI enrichment generated for `en` and `es`
- UI selects the best artifact for the active locale
- fallback to default locale only when the requested locale is missing

## Why

The browser QA showed a clear product-quality gap:

- route chrome is localized
- report shell is localized
- but persisted summaries, recommendations, roadmap text, and AI output remain in the language in which they were originally generated

That creates a mixed-language report, which weakens the premium B2B perception.

## Recommended data shape

Current `artifactsJson` should evolve from:

```json
{
  "deterministic": { "...": "single-language artifact" },
  "ai": { "...": "single-language enrichment" }
}
```

to:

```json
{
  "locales": {
    "en": {
      "deterministic": {
        "executiveSummary": "...",
        "technicalSummary": "...",
        "roadmap": []
      },
      "ai": {
        "provider": "openrouter",
        "model": "demo/free",
        "enriched": {
          "executivePolish": "...",
          "businessFraming": "...",
          "roadmapRefinement": []
        }
      }
    },
    "es": {
      "deterministic": {
        "executiveSummary": "...",
        "technicalSummary": "...",
        "roadmap": []
      },
      "ai": {
        "provider": "openrouter",
        "model": "demo/free",
        "enriched": {
          "executivePolish": "...",
          "businessFraming": "...",
          "roadmapRefinement": []
        }
      }
    }
  },
  "defaultLocale": "en"
}
```

## Generation strategy

### Deterministic layer

Refactor `buildDeterministicExecutiveReport(...)` to accept:

- locale
- translated dimension labels
- translated maturity vocabulary
- translated roadmap templates

Suggested signature:

```ts
buildDeterministicExecutiveReport(input, { locale, copy })
```

### AI layer

AI enrichment should be generated against the locale-specific deterministic artifact, with prompts explicitly forcing output language:

- English prompt for `en`
- Spanish prompt for `es`

Suggested action contract:

- enrich current locale only
- preserve previously generated locales

## Read strategy in UI

On report page:

1. read active locale
2. try `artifactsJson.locales[locale]`
3. fallback to `artifactsJson.locales[defaultLocale]`
4. if neither exists, fallback to legacy fields for backward compatibility

## Migration path

### Phase A

- keep current schema
- write new locale-aware structure into `artifactsJson`
- continue reading legacy fields as fallback

### Phase B

- update report page and dashboard snapshot cards to read locale-specific summaries
- update AI enrichment action to merge into `locales[locale]`

### Phase C

- optionally backfill demo seed artifacts in both languages
- remove legacy single-language assumptions from presentation layer

## Scope recommendation

For the next implementation phase:

1. close remaining dashboard/report UI hardcoded strings
2. localize deterministic report generation
3. localize dashboard snapshot summary source
4. localize AI enrichment persistence per locale

This is the smallest serious path that preserves MVP speed while materially improving premium product quality.
