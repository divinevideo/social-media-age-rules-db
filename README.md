# Social Media Age Rules DB

A database and admin tool for tracking the minimum-age laws, regulations, compliance decisions, and case law that apply to social media across jurisdictions worldwide. It runs as a single Cloudflare Worker: a Hono API backed by a Cloudflare D1 (SQLite) database, with a React admin UI served as static assets from the same Worker.

## Features

- **Regulatory tracking** — record jurisdictions, legal instruments (laws, bills, regulations, guidelines), and the specific age rules extracted from them.
- **Compliance decisions** — track internal decisions about age enforcement, including decision state, risk level, owner, and product controls.
- **Case law** — log court cases and regulatory proceedings tied to jurisdictions and instruments.
- **Sources and families** — keep reference citations and group related instruments into regulatory families.
- **Research backlog** — queue jurisdictions and topics that still need coverage.
- **US state matrix** — store flexible state-by-state comparison metrics.
- **Reporting** — query age requirements by jurisdiction, compliance summaries, regulatory timelines, and side-by-side jurisdiction comparisons.
- **Import / export** — bulk-import rows as JSON and export any table as JSON or CSV.
- **Admin UI** — a React single-page app with pages for the dashboard, each data type, reports, and import/export.

## Tech stack

- **Hono** — web framework for the Worker API (`src/`).
- **Cloudflare Workers** — runtime; the Worker also serves the admin UI via the `[assets]` binding in `wrangler.toml`.
- **Cloudflare D1** — SQLite-based edge database (binding `DB`).
- **React + Vite + React Router + Tailwind CSS** — admin UI (`admin-ui/`).
- **TypeScript** — across both the Worker and the admin UI.
- **Vitest** — test runner for the Worker.

## Data model

The schema lives in `migrations/0001_initial_schema.sql` and defines the following tables:

| Table | Purpose |
| --- | --- |
| `jurisdictions` | Countries, states, and regions, with a `parent` field for hierarchy and a `level` (country, state, supranational, etc.). |
| `instruments` | Laws, bills, regulations, and guidelines, with type, status, key dates, and a simplified age rule. |
| `rule_assertions` | Specific age rules extracted from instruments (rule type, age min/max, requirement, confidence, review metadata). |
| `compliance_decisions` | Internal decisions about age enforcement (decision state, minimum age to access, risk level, owner, product controls). |
| `case_law_events` | Court cases and regulatory proceedings (court/body, event type, date, summary). |
| `sources` | Reference materials and citations. |
| `regulatory_families` | Named groupings of related instruments. |
| `instrument_families` | Junction table linking instruments to regulatory families (many-to-many). |
| `coverage_backlog` | Topics and jurisdictions still to be researched (priority, status, assignee). |
| `us_state_matrix` | Flexible key-value metrics for US state-by-state comparison. |

Foreign keys cascade from `jurisdictions` and `instruments`, so deleting a jurisdiction removes its dependent rows. Each table carries `created_at` / `updated_at` Unix timestamps.

## API

The Worker mounts all routes under `/api`. `GET /api` returns the endpoint index. Each data type exposes standard CRUD routes; `rules` maps to `rule_assertions`.

- `/api/jurisdictions`, `/api/instruments`, `/api/rules`, `/api/compliance`, `/api/cases`, `/api/sources`, `/api/families`, `/api/backlog`, `/api/matrix` — `GET` (list), `GET /:id`, `POST`, `PUT /:id`, `DELETE /:id`.
- `/api/reports/age-by-jurisdiction`, `/api/reports/compliance-summary`, `/api/reports/timeline`, `/api/reports/compare?jurisdictions=a,b,c`, `/api/reports/summary` — read-only reporting queries.
- `POST /api/import/spreadsheet` — bulk import; body is `{ "table": "<name>", "data": [ ... ] }`. The target table must be in the allowlist, and rows are inserted with `INSERT OR REPLACE`.
- `GET /api/export/:table?format=json|csv` — export a table (defaults to JSON).

CORS is enabled for `/api/*` so the admin UI can call the API. The Worker itself does not authenticate requests; in production the routes are expected to sit behind Cloudflare Access (see the route in `wrangler.toml`).

## Getting started

Prerequisites: Node.js 18+, npm, and a Cloudflare account with Workers and D1 enabled.

```bash
# Install Worker and admin UI dependencies
npm install
cd admin-ui && npm install && cd ..

# Create the D1 database (first time only), then copy the
# returned database_id into wrangler.toml
npx wrangler d1 create divine-age-rules-db

# Apply the schema to your local D1 database
npm run db:migrate:local

# Build the admin UI and start the Worker locally
npm run build:admin
npm run dev
```

`wrangler dev` serves both the API and the admin UI at `http://localhost:8787`.

Other scripts:

- `npm test` / `npm run test:once` — run the Vitest suite.
- `npm run build:admin` — build the admin UI into `admin-ui/dist`.

The `scripts/` directory contains helper shell scripts (`init-local-db.sh`, `seed-database.sh`) for seeding a local database; they expect local JSON data files and may need paths adjusted for your machine. For most cases, use the import API or the admin UI's Import/Export page to load data.

## Configuration

Runtime configuration lives in `wrangler.toml`:

- `name` — the Worker name (`divine-age-rules-db`).
- `routes` — the production route (`age-rules.admin.divine.video/*` on the `divine.video` zone).
- `[[d1_databases]]` — the `DB` binding, database name, and `database_id`.
- `[assets]` — serves the built admin UI from `admin-ui/dist`.

`account_id` and `database_id` are checked in; replace them if you are deploying to a different Cloudflare account or database.

## Deployment

Pushes to `main` deploy automatically via the GitHub Actions workflow in `.github/workflows/deploy.yml`, which installs dependencies, builds the admin UI, and deploys with `cloudflare/wrangler-action`. It requires the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. The workflow can also be triggered manually via `workflow_dispatch`.

To deploy by hand:

```bash
# Apply migrations to the production database
npm run db:migrate:prod

# Build the admin UI and deploy the Worker
npm run deploy
```

## License

MIT

---

Maintained by [Divine](https://divine.video) · [Brand guidelines](https://github.com/divinevideo/brand-guidelines)
