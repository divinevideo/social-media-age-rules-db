# Repository Guidelines

## Project Structure & Module Organization
- Worker code lives in `src/`; the admin application lives in `admin-ui/`; schema changes live in `migrations/`.
- Supporting scripts live in `scripts/`; deployment and local environment settings live in `wrangler.toml` and `package.json`.
- Keep frontend, worker, and migration changes scoped so reviews can follow the regulatory data impact clearly.

## Build, Test, and Development Commands
- `npm test` or `npm run test:once`: run Vitest coverage for the worker.
- `npm run build:admin`: build the admin UI.
- `npm run dev`: start the Cloudflare Worker locally.
- `npm run db:migrate:local` / `npm run db:migrate:prod`: apply D1 migrations.

## Coding Style & Naming Conventions
- Use TypeScript consistently across the worker and admin UI.
- Keep PRs tightly scoped; avoid unrelated data, schema, or UI cleanup.
- Temporary or transitional code must include `TODO(#issue):` with a tracking issue.

## Pull Request Guardrails
- PR titles must use Conventional Commit format: `type(scope): summary` or `type: summary`.
- Set the correct PR title when opening the PR. Do not rely on fixing it later.
- If a PR title changes after opening, verify the semantic PR check reruns successfully.
- PR descriptions should include summary, motivation, related issue, and manual test plan.
- UI changes should include screenshots or an explicit note that there is no visual change.
- Public PRs, issues, branch names, screenshots, and descriptions must not mention corporate partners, customers, brands, campaign names, or other sensitive external identities unless a maintainer explicitly approves it. Use generic descriptors instead.
