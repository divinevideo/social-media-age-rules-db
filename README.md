# Divine Age Rules Database

Database module for tracking social media age rules and regulations globally. Part of the diVine.Video admin dashboard ecosystem.

## Features

- **Comprehensive Tracking**: Track age rules across jurisdictions, legal instruments, and compliance decisions
- **Global Coverage**: Support for international, federal, state, and local jurisdictions
- **Regulatory Intelligence**: Monitor laws, bills, regulations, and case law
- **Compliance Management**: Internal decision tracking and product controls
- **Reporting**: Generate reports on age requirements, compliance status, timelines, and jurisdictional comparisons
- **Data Import/Export**: Bulk import from spreadsheets and export to CSV/JSON

## Tech Stack

- **Hono**: Lightweight web framework optimized for Cloudflare Workers
- **Cloudflare D1**: SQLite-based edge database for regulatory data
- **Cloudflare Workers Assets**: Static file serving for admin UI
- **React + Vite**: Admin UI for data management and reporting
- **TypeScript**: Type-safe implementation

## Data Model

### Core Tables

1. **Jurisdictions**: Countries, states, regions with hierarchical relationships
2. **Instruments**: Laws, bills, regulations, guidelines
3. **RuleAssertions**: Specific age rules extracted from instruments
4. **ComplianceDecisions**: Internal decisions about age enforcement
5. **CaseLawEvents**: Court cases and legal proceedings
6. **Sources**: Reference materials and citations
7. **RegulatoryFamilies**: Groupings of related regulations
8. **CoverageBacklog**: Research and tracking backlog
9. **USStateMatrix**: US state-by-state comparison data

## Development

### Prerequisites

- Node.js 18+
- npm or similar package manager
- Cloudflare account with Workers and D1 enabled

### Setup

```bash
# Install dependencies
npm install

# Create D1 database (first time only)
npx wrangler d1 create divine-age-rules-db
# Copy the database_id from output to wrangler.toml

# Apply database migrations locally
npm run db:migrate:local
```

### Local Development

```bash
# Install admin UI dependencies (first time only)
cd admin-ui && npm install && cd ..

# Build admin UI
npm run build:admin

# Start development server
npm run dev

# Server runs at http://localhost:8787
# Admin UI accessible at http://localhost:8787
```

### Data Import

To populate the database with initial data:

1. Ensure you have Python 3.x with pandas installed:
   ```bash
   pip3 install pandas openpyxl
   ```

2. Place your Excel file in `import-data/` directory

3. Generate JSON files:
   ```bash
   cd import-data
   python3 generate-json-files-v3.py
   ```

4. Import via the Admin UI:
   - Start the dev server: `npm run dev`
   - Navigate to Import/Export page
   - Upload each JSON file in numerical order (0-9)
   - The UI will display import progress and any errors

Note: Files must be imported in order due to foreign key constraints (jurisdictions before instruments, etc.)

### Deployment

```bash
# Apply migrations to production database
npm run db:migrate:prod

# Deploy worker to Cloudflare
npm run deploy

# Production URL: https://age-rules.admin.divine.video
```

## API Endpoints

All endpoints are protected by Cloudflare Access (admin-only).

### Jurisdictions API

- `GET /api/jurisdictions` - List all jurisdictions with pagination
- `GET /api/jurisdictions/:id` - Get jurisdiction details
- `POST /api/jurisdictions` - Create new jurisdiction
- `PUT /api/jurisdictions/:id` - Update jurisdiction
- `DELETE /api/jurisdictions/:id` - Delete jurisdiction

### Instruments API

- `GET /api/instruments` - List all instruments with filtering
- `GET /api/instruments/:id` - Get instrument details
- `POST /api/instruments` - Create new instrument
- `PUT /api/instruments/:id` - Update instrument
- `DELETE /api/instruments/:id` - Delete instrument

### Rule Assertions API

- `GET /api/rules` - List all rule assertions
- `GET /api/rules/:id` - Get rule details
- `POST /api/rules` - Create new rule
- `PUT /api/rules/:id` - Update rule
- `DELETE /api/rules/:id` - Delete rule

### Compliance Decisions API

- `GET /api/compliance` - List all compliance decisions
- `GET /api/compliance/:id` - Get compliance decision details
- `POST /api/compliance` - Create new compliance decision
- `PUT /api/compliance/:id` - Update compliance decision
- `DELETE /api/compliance/:id` - Delete compliance decision

### Reporting API

- `GET /api/reports/age-by-jurisdiction` - Age requirements by jurisdiction
- `GET /api/reports/compliance-summary` - Compliance status summaries
- `GET /api/reports/timeline` - Regulatory timeline views
- `GET /api/reports/compare?jurisdictions=a,b,c` - Compare jurisdictions

### Import/Export API

- `POST /api/import/spreadsheet` - Bulk import from JSON/CSV
- `GET /api/export/:table?format=csv|json` - Export table data

## Security

- **Cloudflare Access**: All routes protected at the edge
- **Admin Only**: No public API access
- **Audit Logging**: Track all data modifications
- **Input Validation**: Strict validation on all inputs

## License

MIT
