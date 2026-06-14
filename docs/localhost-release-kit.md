# SevenTec Atlas — Localhost Release Kit v1

This project is intentionally optimized for a serious **localhost-only** product workflow.

The goal is not “toy local dev”, but a **production-like local release path** that is:

- reproducible
- demo-ready
- screenshot-ready
- easier to onboard
- credible for portfolio and client review

---

## Main commands

### Prepare local stack

```bash
npm run local:prepare
```

What it does:

- starts PostgreSQL through Docker Compose when available
- falls back to the legacy local PostgreSQL path if Docker is unavailable
- generates Prisma client
- applies committed migrations with `migrate deploy`

### Start flagship demo mode

```bash
npm run local:demo
```

What it does:

- prepares the stack
- seeds the demo workspace and report history
- starts the app on `http://localhost:3004`

Use this for:

- portfolio walkthroughs
- screenshots
- README refreshes
- stakeholder demos

### Start production-like localhost mode

```bash
npm run start:local:prod
```

What it does:

- prepares the stack
- builds the app
- starts the app with `next start` on `http://localhost:3004`

Use this when you want to validate the MVP in a mode closer to real runtime behavior than `next dev`.

### Verify local release

```bash
npm run local:verify
```

What it validates:

- landing responds
- sign-in responds
- marketing report-proof assets respond
- development sign-in works
- demo dashboard loads
- premium report opens
- compare flow reaches the previous report baseline

---

## Recommended localhost release flow

### Fast demo flow

1. `npm run local:demo`
2. open `http://localhost:3004/sign-in`
3. enter the demo flow
4. open dashboard / report / compare flow

### Production-like validation flow

1. `npm run local:prepare`
2. `npm run start:local:prod`
3. in another terminal: `npm run local:verify`

---

## Operational notes

- Preferred database URL:

```text
postgresql://atlas:atlasdev@127.0.0.1:5433/seventec_atlas
```

- Runtime env file:

```text
apps/web/.env.local
```

- If Docker is unavailable, scripts keep compatibility with the legacy local PostgreSQL path.

---

## Manual release checklist

- [ ] `npm run local:prepare` succeeds
- [ ] `npm run local:demo` or `npm run start:local:prod` boots without errors
- [ ] `/sign-in` responds correctly
- [ ] landing shows report-proof section
- [ ] demo workspace exists
- [ ] premium report opens
- [ ] compare-run flow still works
- [ ] README commands match the real workflow
