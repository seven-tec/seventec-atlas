# SevenTec Atlas

**Architecture Intelligence for modern web systems.**

SevenTec Atlas is a flagship SaaS project designed to evaluate web applications across **architecture, performance, scalability, maintainability, and operability**, then transform those findings into **executive-grade reports** with deterministic scoring first and AI-assisted interpretation second.

This repository is intentionally positioned as a **serious product artifact**, not a generic dashboard or isolated technical experiment.

---

## Flagship summary

**What it is**

A premium B2B SaaS concept for architecture intelligence: structured assessments, deterministic scoring, report generation, run history, and AI enrichment used only as a controlled interpretation layer.

**Why it matters**

Most architecture reviews stop at technical notes. SevenTec Atlas turns architecture signals into a **decision-ready artifact** that can be understood by engineering leads, CTOs, founders, and clients.

**What it demonstrates**

- product-first technical judgment
- deterministic-first evaluation design
- serious end-to-end SaaS architecture
- premium enterprise-oriented UX
- AI applied with clear business boundaries

---

## Product in action

### Executive dashboard (EN)

![SevenTec Atlas dashboard EN](./docs/screenshots/final-i18n/dashboard-en.png)

### Executive dashboard (ES)

![SevenTec Atlas dashboard ES](./docs/screenshots/final-i18n/dashboard-es.png)

### Premium architecture report (EN)

![SevenTec Atlas premium report EN](./docs/screenshots/final-i18n/report-en.png)

### Premium architecture report (ES)

![SevenTec Atlas premium report ES](./docs/screenshots/final-i18n/report-es.png)

### Share-ready report mode

![SevenTec Atlas share-ready report EN](./docs/screenshots/final-i18n/report-share-en.png)

---

## Public repo assets

This repository also includes public-positioning assets for GitHub and portfolio use:

- repo metadata pack: `./docs/github-repo-metadata.md`
- pinned/profile copy: `./docs/github-profile-copy.md`
- social preview asset: `./docs/branding/social-preview-og.svg`

---

## Why this project exists

Most technical audits fail in one of two ways:

1. they are too vague to support real product decisions
2. they are too technical to communicate value outside engineering

SevenTec Atlas is built to close that gap.

The product evaluates structured architectural signals, generates deterministic risk and recommendation outputs, and then layers AI on top only where it adds value:

- executive polish
- business framing
- roadmap refinement

The result is a system meant to feel credible to:

- engineering leads
- CTOs
- technical founders
- B2B clients
- stakeholders who need architectural clarity with business context

---

## Product principles

- **product before experiment**
- **deterministic scoring before open-ended AI**
- **AI as interpretation layer, not gimmick**
- **premium, sober, enterprise-oriented UX**
- **architecture decisions visible in the product itself**

---

## Current MVP scope

### Core workflow

- sign in
- create workspace
- create application
- create assessment draft
- save structured answers
- submit assessment
- generate deterministic scoring
- generate deterministic report
- enrich report with AI
- review report history
- compare runs with score deltas
- export a share-ready report

### Current output

- overall score
- dimension scores
- prioritized risks
- actionable recommendations
- executive summary
- technical summary
- roadmap by phases
- AI enrichment layer
- run history
- improvement / regression narrative
- print / PDF-ready report layout

---

## Demo flow available locally

This repository now includes a **seeded demo dataset** designed for:

- portfolio walkthroughs
- README visuals
- screenshots
- stakeholder demos
- compare-runs storytelling

### Demo path

- workspace: `atlas-demo-workspace`
- application: `atlas-commerce-platform`
- output: two analyzed runs, compare-ready history, premium report, and share-ready report mode

### Seed command

```bash
npm run demo:seed
```

---

## What makes this repo different

This project is intentionally built to communicate **architectural judgment**.

It is not trying to impress with unnecessary complexity. Instead, it tries to show:

- end-to-end product thinking
- deterministic-first evaluation design
- credible B2B UX decisions
- layered architecture prepared for future analysis engines
- AI usage with clear boundaries and business purpose

---

## Stack

### Application

- Next.js
- TypeScript
- Tailwind CSS
- Auth.js

### Data

- PostgreSQL
- Prisma

### Monorepo

- Turborepo
- pnpm workspaces

### AI

- OpenRouter
- structured JSON-oriented enrichment flow

---

## Repository structure

```text
apps/
  web/                  # Main SaaS application

packages/
  db/                   # Prisma schema and data access
  domain/               # Domain types and concepts
  scoring-core/         # Deterministic scoring engine
  ai-contracts/         # Structured output contracts
  ui/                   # Shared UI primitives
  config/               # Shared config utilities

docs/
  prd/                  # Product framing
  architecture/         # Architecture notes
  decisions/            # Technical decisions
  domain/               # Domain model notes
```

---

## Architecture snapshot

SevenTec Atlas currently uses a **modular monorepo** with a clear separation between:

- product UI
- application services
- scoring logic
- data access
- AI contracts

The scoring pipeline is deterministic-first:

1. collect structured assessment answers
2. compute scorecard and risk/recommendation outputs
3. generate deterministic report
4. optionally enrich the report with AI without replacing the underlying findings

This structure is intentionally designed to support a future evolution toward:

- more advanced analysis engines
- broader assessment models
- richer report distribution
- possible lower-level analysis services later, only if justified

---

## Report experience

The report layer is one of the main flagship artifacts in this project.

### It currently supports

- dedicated report route per analysis run
- premium cover layout
- run history
- latest vs previous comparison
- score deltas across dimensions
- deterministic improvement narrative
- share-ready report mode
- browser print-to-PDF workflow

This is important because the report is not just UI output. It is meant to behave like a **client-facing deliverable**.

---

## Visual assets

### Final bilingual screenshot set

- `docs/screenshots/final-i18n/dashboard-en.png`
- `docs/screenshots/final-i18n/dashboard-es.png`
- `docs/screenshots/final-i18n/report-en.png`
- `docs/screenshots/final-i18n/report-es.png`
- `docs/screenshots/final-i18n/report-share-en.png`
- `docs/screenshots/final-i18n/report-share-es.png`

### Recommended GitHub / portfolio hero set

- `docs/screenshots/final-i18n/report-en.png`
- `docs/screenshots/final-i18n/report-es.png`
- `docs/screenshots/final-i18n/dashboard-en.png`
- `docs/screenshots/final-i18n/dashboard-es.png`

To regenerate them locally:

1. start the app on `http://localhost:3004`
2. ensure the demo dataset exists with `npm run demo:seed`
3. capture the final bilingual set

```powershell
npm run screenshots:i18n
```

The capture flow signs in with development auth, loads the seeded demo artifact, and exports reproducible EN/ES PNGs for README, portfolio, or case-study use.

---

## Local development

### Preferred local database path

SevenTec Atlas now includes a Docker Compose setup for PostgreSQL so local onboarding no longer depends on a manual PostgreSQL installation.

#### Start PostgreSQL

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\db-local.ps1 up
```

or:

```bash
npm run db:local:up
```

#### Check PostgreSQL status

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\db-local.ps1 status
```

#### View PostgreSQL logs

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\db-local.ps1 logs
```

#### Stop PostgreSQL

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\db-local.ps1 down
```

### Expected local database connection

```text
postgresql://atlas:atlasdev@127.0.0.1:5433/seventec_atlas
```

### Recommended app start

```bash
npm run dev:local
```

### Localhost release kit

#### Prepare the local stack

```bash
npm run local:prepare
```

#### Start flagship demo mode

```bash
npm run local:demo
```

#### Start production-like localhost mode

```bash
npm run start:local:prod
```

#### Verify the local release

```bash
npm run local:verify
```

If your local Windows environment does not resolve `npm` reliably, you can use:

```bat
.\dev-local.cmd
```

### What `dev:local` does

- prefers Docker Compose PostgreSQL on `127.0.0.1:5433`
- falls back to the legacy local PostgreSQL data directory only if Docker is unavailable
- starts `apps/web` on `http://localhost:3004`

### Reset local environment

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\reset-local.ps1
```

### Check local environment

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\check-local.ps1
```

This validates:

- `docker-compose.yml`
- Docker Compose availability and PostgreSQL container health when Docker is present
- `apps/web/.env.local`
- core env variables
- PostgreSQL port and readiness
- web port and `/sign-in` response

For the full localhost-only operating flow, see:

- `./docs/localhost-release-kit.md`

---

## Environment notes

The main app currently reads local runtime settings from:

```text
apps/web/.env.local
```

Important variables include:

- `DATABASE_URL`
- `AUTH_SECRET`
- `DEV_AUTH_ENABLED`
- `AI_PROVIDER`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`

---

## Current AI approach

AI is used as a **controlled enrichment layer**.

It does **not** replace deterministic scoring.

Current usage focuses on:

- executive polish
- business framing
- roadmap refinement

This is a deliberate product and architecture decision: the system should remain explainable even without the AI layer.

---

## Roadmap direction

Near-term next steps are focused on public presentation and product maturity:

- premium README and repository polish
- stronger portfolio case study packaging
- better screenshots and visual assets
- more polished onboarding and empty states
- stronger dashboard operating views

Longer-term product steps may include:

- public share links
- stronger compare flows
- richer report distribution
- OAuth production auth
- more advanced analysis engines

---

## Case study

A premium case study and a shorter portfolio summary are available at:

- [`docs/case-study-base.md`](./docs/case-study-base.md)
- [`docs/portfolio-summary-final.md`](./docs/portfolio-summary-final.md)

---

## Positioning

SevenTec Atlas is built as a flagship piece for a professional brand centered on:

- web architecture
- performance
- high-level systems thinking
- AI applied with business judgment

If this repository feels more like a **product with architectural intent** than a demo, then it is doing its job.

---

## Portfolio-ready takeaway

SevenTec Atlas is not meant to be “another dashboard”.

It is meant to show that modern web architecture can be packaged as a **serious product system**:

- clear domain boundaries
- deterministic scoring
- strong report UX
- operational history
- controlled AI enrichment
- business-facing output

That combination is the core flagship signal of this repository.
