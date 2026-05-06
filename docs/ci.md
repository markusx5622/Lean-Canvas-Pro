# CI Pipeline

Every push to `main` and every pull request triggers the **CI** workflow (`.github/workflows/ci.yml`). The single job runs four steps in order:

| Step | Command | What it checks |
|------|---------|----------------|
| **Install** | `npm ci` | All declared dependencies resolve and install cleanly from the lock-file. |
| **Type-check** | `npm run lint` (runs `tsc --noEmit`) | No TypeScript type errors across the full source tree. Despite the `lint` name, this script performs type-checking only — there is no separate linter configured. |
| **Tests** | `npm run test` | All Vitest unit tests in `src/**/*.test.ts` pass (currently 198 tests across the evaluator module). |
| **Build** | `npm run build` | Vite produces a valid frontend bundle **and** esbuild produces the production server bundle in `dist/`. |

## Interpreting a failing check

- **Install fails** → likely a corrupted or conflicting `package-lock.json`; run `npm ci` locally to reproduce.
- **Type-check fails** → TypeScript found type errors; run `npm run lint` (i.e. `tsc --noEmit`) locally and fix the reported files.
- **Tests fail** → a unit test regressed; run `npm run test` (or `npm run test:watch` for interactive mode) locally.
- **Build fails** → Vite or esbuild encountered a compile error; run `npm run build` locally to reproduce.

## Environment variables

The build does **not** require real secrets. Supabase, Sentry, and PostHog are all optional at build time — the app gracefully degrades when those keys are absent. No repository secrets need to be configured for the CI workflow to pass.

## Adding new checks

Add extra steps to `.github/workflows/ci.yml` inside the same job (or create a second job that `needs: ci` to keep the dependency clear).
