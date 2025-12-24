// ABOUTME: Main entry point for divine-age-rules-db Cloudflare Worker
// ABOUTME: Handles API routes for age rules tracking, reporting, and admin UI

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import jurisdictions from './routes/jurisdictions'
import instruments from './routes/instruments'
import rules from './routes/rules'
import compliance from './routes/compliance'
import cases from './routes/cases'
import sources from './routes/sources'
import families from './routes/families'
import backlog from './routes/backlog'
import matrix from './routes/matrix'
import reports from './routes/reports'
import importExport from './routes/import-export'

type Bindings = {
  DB: D1Database
  ASSETS: Fetcher
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for admin UI
app.use('/api/*', cors())

app.get('/api', (c) => {
  return c.json({
    endpoints: {
      jurisdictions: '/api/jurisdictions',
      instruments: '/api/instruments',
      rules: '/api/rules',
      compliance: '/api/compliance',
      cases: '/api/cases',
      sources: '/api/sources',
      families: '/api/families',
      backlog: '/api/backlog',
      matrix: '/api/matrix',
      reports: '/api/reports',
      import: '/api/import',
      export: '/api/export'
    }
  })
})

// API Routes (protected by Cloudflare Access in production)
app.route('/api/jurisdictions', jurisdictions)
app.route('/api/instruments', instruments)
app.route('/api/rules', rules)
app.route('/api/compliance', compliance)
app.route('/api/cases', cases)
app.route('/api/sources', sources)
app.route('/api/families', families)
app.route('/api/backlog', backlog)
app.route('/api/matrix', matrix)
app.route('/api/reports', reports)
app.route('/api/import', importExport)
app.route('/api/export', importExport)

// Admin UI static files are served automatically via [assets] config in wrangler.toml

export default app
