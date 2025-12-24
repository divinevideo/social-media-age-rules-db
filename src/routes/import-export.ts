// ABOUTME: API routes for importing and exporting data
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

// Bulk import from JSON
app.post('/spreadsheet', async (c) => {
  try {
    const body = await c.req.json()
    const { table, data } = body
    
    if (!table || !data || !Array.isArray(data)) {
      return c.json({ error: 'Invalid request. Expected { table, data: [] }' }, 400)
    }
    
    const allowedTables = [
      'jurisdictions', 'instruments', 'rule_assertions', 'compliance_decisions',
      'case_law_events', 'sources', 'regulatory_families', 'coverage_backlog', 'us_state_matrix'
    ]
    
    if (!allowedTables.includes(table)) {
      return c.json({ error: `Invalid table. Allowed: ${allowedTables.join(', ')}` }, 400)
    }
    
    let imported = 0
    let errors = []
    
    for (const row of data) {
      try {
        const columns = Object.keys(row)
        const values = Object.values(row)
        const placeholders = columns.map(() => '?').join(',')
        
        await c.env.DB.prepare(
          `INSERT OR REPLACE INTO ${table} (${columns.join(',')}) VALUES (${placeholders})`
        ).bind(...values).run()
        
        imported++
      } catch (err: any) {
        errors.push({ row, error: err.message })
      }
    }
    
    return c.json({ 
      success: true, 
      imported, 
      total: data.length,
      errors: errors.length > 0 ? errors : undefined 
    })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Export table to JSON/CSV
app.get('/:table', async (c) => {
  const table = c.req.param('table')
  const format = c.req.query('format') || 'json'
  
  const allowedTables = [
    'jurisdictions', 'instruments', 'rule_assertions', 'compliance_decisions',
    'case_law_events', 'sources', 'regulatory_families', 'coverage_backlog', 'us_state_matrix'
  ]
  
  if (!allowedTables.includes(table)) {
    return c.json({ error: `Invalid table. Allowed: ${allowedTables.join(', ')}` }, 400)
  }
  
  const result = await c.env.DB.prepare(`SELECT * FROM ${table}`).all()
  
  if (format === 'csv') {
    if (result.results.length === 0) {
      return c.text('No data')
    }
    
    const headers = Object.keys(result.results[0])
    const csv = [
      headers.join(','),
      ...result.results.map(row => 
        headers.map(h => {
          const val = (row as any)[h]
          return val === null ? '' : `"${String(val).replace(/"/g, '""')}"`
        }).join(',')
      )
    ].join('\n')
    
    c.header('Content-Type', 'text/csv')
    c.header('Content-Disposition', `attachment; filename="${table}.csv"`)
    return c.text(csv)
  }
  
  return c.json({ table, count: result.results.length, data: result.results })
})

export default app
