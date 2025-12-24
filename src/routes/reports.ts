// ABOUTME: API routes for generating reports and analytics
// ABOUTME: Age requirements by jurisdiction, compliance summaries, timelines, comparisons

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// Report: Age requirements by jurisdiction
app.get('/age-by-jurisdiction', async (c) => {
  const { jurisdiction_id, level } = c.req.query()

  let query = `
    SELECT 
      j.jurisdiction_id,
      j.name as jurisdiction_name,
      j.level,
      j.iso_code,
      ra.rule_type,
      ra.age_min,
      ra.age_max,
      ra.requirement,
      ra.confidence,
      ra.effective_date,
      i.title as instrument_title,
      i.status as instrument_status
    FROM rule_assertions ra
    JOIN jurisdictions j ON ra.jurisdiction_id = j.jurisdiction_id
    JOIN instruments i ON ra.instrument_id = i.instrument_id
    WHERE 1=1
  `
  const params: any[] = []

  if (jurisdiction_id) {
    query += ' AND j.jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (level) {
    query += ' AND j.level = ?'
    params.push(level)
  }

  query += ' ORDER BY j.name, ra.effective_date DESC'

  const result = await c.env.DB.prepare(query).bind(...params).all()

  return c.json({
    report_type: 'age_by_jurisdiction',
    generated_at: new Date().toISOString(),
    data: result.results
  })
})

// Report: Compliance status summaries
app.get('/compliance-summary', async (c) => {
  const query = `
    SELECT 
      j.jurisdiction_id,
      j.name as jurisdiction_name,
      j.level,
      cd.decision_state,
      cd.min_age_to_access,
      cd.risk_level,
      cd.owner,
      cd.last_reviewed_at,
      cd.product_controls,
      COUNT(DISTINCT i.instrument_id) as instrument_count,
      COUNT(DISTINCT ra.id) as rule_count
    FROM compliance_decisions cd
    JOIN jurisdictions j ON cd.jurisdiction_id = j.jurisdiction_id
    LEFT JOIN instruments i ON i.jurisdiction_id = j.jurisdiction_id
    LEFT JOIN rule_assertions ra ON ra.jurisdiction_id = j.jurisdiction_id
    GROUP BY cd.id, j.jurisdiction_id
    ORDER BY j.name
  `

  const result = await c.env.DB.prepare(query).all()

  return c.json({
    report_type: 'compliance_summary',
    generated_at: new Date().toISOString(),
    data: result.results
  })
})

// Report: Regulatory timeline views
app.get('/timeline', async (c) => {
  const { jurisdiction_id, year_start, year_end } = c.req.query()

  let query = `
    SELECT 
      'instrument' as event_type,
      i.instrument_id as id,
      i.jurisdiction_id,
      j.name as jurisdiction_name,
      i.title,
      i.instrument_type,
      i.status,
      i.introduced_date as event_date,
      'introduced' as event_label,
      i.min_age_rule
    FROM instruments i
    JOIN jurisdictions j ON i.jurisdiction_id = j.jurisdiction_id
    WHERE i.introduced_date IS NOT NULL
  `
  const params: any[] = []

  if (jurisdiction_id) {
    query += ' AND i.jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (year_start) {
    query += ' AND i.introduced_date >= ?'
    params.push(`${year_start}-01-01`)
  }

  if (year_end) {
    query += ' AND i.introduced_date <= ?'
    params.push(`${year_end}-12-31`)
  }

  query += `
    UNION ALL
    SELECT 
      'instrument' as event_type,
      i.instrument_id as id,
      i.jurisdiction_id,
      j.name as jurisdiction_name,
      i.title,
      i.instrument_type,
      i.status,
      i.effective_or_commencement_date as event_date,
      'effective' as event_label,
      i.min_age_rule
    FROM instruments i
    JOIN jurisdictions j ON i.jurisdiction_id = j.jurisdiction_id
    WHERE i.effective_or_commencement_date IS NOT NULL
  `

  if (jurisdiction_id) {
    query += ' AND i.jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (year_start) {
    query += ' AND i.effective_or_commencement_date >= ?'
    params.push(`${year_start}-01-01`)
  }

  if (year_end) {
    query += ' AND i.effective_or_commencement_date <= ?'
    params.push(`${year_end}-12-31`)
  }

  query += `
    UNION ALL
    SELECT 
      'case_law' as event_type,
      c.case_id as id,
      c.jurisdiction_id,
      j.name as jurisdiction_name,
      c.court_or_body as title,
      c.event_type as instrument_type,
      NULL as status,
      c.event_date,
      c.event_type as event_label,
      NULL as min_age_rule
    FROM case_law_events c
    JOIN jurisdictions j ON c.jurisdiction_id = j.jurisdiction_id
    WHERE c.event_date IS NOT NULL
  `

  if (jurisdiction_id) {
    query += ' AND c.jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (year_start) {
    query += ' AND c.event_date >= ?'
    params.push(`${year_start}-01-01`)
  }

  if (year_end) {
    query += ' AND c.event_date <= ?'
    params.push(`${year_end}-12-31`)
  }

  query += ' ORDER BY event_date DESC'

  const result = await c.env.DB.prepare(query).bind(...params).all()

  return c.json({
    report_type: 'regulatory_timeline',
    generated_at: new Date().toISOString(),
    filters: { jurisdiction_id, year_start, year_end },
    data: result.results
  })
})

// Report: Compare jurisdictions
app.get('/compare', async (c) => {
  const jurisdictionsParam = c.req.query('jurisdictions')
  
  if (!jurisdictionsParam) {
    return c.json({ error: 'Missing required parameter: jurisdictions (comma-separated)' }, 400)
  }

  const jurisdictions = jurisdictionsParam.split(',').map(j => j.trim())

  if (jurisdictions.length < 2) {
    return c.json({ error: 'At least 2 jurisdictions required for comparison' }, 400)
  }

  // Build placeholders for SQL
  const placeholders = jurisdictions.map(() => '?').join(',')

  // Get jurisdiction details
  const jurisdictionData = await c.env.DB.prepare(
    `SELECT * FROM jurisdictions WHERE jurisdiction_id IN (${placeholders})`
  ).bind(...jurisdictions).all()

  // Get instruments for each jurisdiction
  const instrumentsData = await c.env.DB.prepare(
    `SELECT 
      jurisdiction_id,
      COUNT(*) as total_instruments,
      COUNT(CASE WHEN status LIKE '%in force%' OR status LIKE '%enacted%' THEN 1 END) as active_instruments,
      MIN(effective_or_commencement_date) as earliest_effective_date,
      MAX(effective_or_commencement_date) as latest_effective_date
     FROM instruments 
     WHERE jurisdiction_id IN (${placeholders})
     GROUP BY jurisdiction_id`
  ).bind(...jurisdictions).all()

  // Get rule assertions for each jurisdiction
  const rulesData = await c.env.DB.prepare(
    `SELECT 
      jurisdiction_id,
      rule_type,
      MIN(age_min) as min_age_requirement,
      MAX(age_min) as max_age_requirement,
      COUNT(*) as rule_count,
      AVG(confidence) as avg_confidence
     FROM rule_assertions 
     WHERE jurisdiction_id IN (${placeholders})
     GROUP BY jurisdiction_id, rule_type`
  ).bind(...jurisdictions).all()

  // Get compliance decisions
  const complianceData = await c.env.DB.prepare(
    `SELECT * FROM compliance_decisions WHERE jurisdiction_id IN (${placeholders})`
  ).bind(...jurisdictions).all()

  return c.json({
    report_type: 'jurisdiction_comparison',
    generated_at: new Date().toISOString(),
    jurisdictions: jurisdictionData.results,
    instruments: instrumentsData.results,
    rules: rulesData.results,
    compliance: complianceData.results
  })
})

// Report: Summary statistics
app.get('/summary', async (c) => {
  const stats = await c.env.DB.batch([
    c.env.DB.prepare('SELECT COUNT(*) as total FROM jurisdictions'),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM instruments'),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM rule_assertions'),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM compliance_decisions'),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM case_law_events'),
    c.env.DB.prepare('SELECT COUNT(*) as total FROM coverage_backlog WHERE status != "completed"'),
    c.env.DB.prepare('SELECT COUNT(DISTINCT jurisdiction_id) as total FROM rule_assertions WHERE age_min IS NOT NULL'),
    c.env.DB.prepare('SELECT AVG(age_min) as avg_age, MIN(age_min) as min_age, MAX(age_min) as max_age FROM rule_assertions WHERE age_min IS NOT NULL')
  ])

  return c.json({
    report_type: 'summary_statistics',
    generated_at: new Date().toISOString(),
    statistics: {
      total_jurisdictions: stats[0].results[0]?.total || 0,
      total_instruments: stats[1].results[0]?.total || 0,
      total_rules: stats[2].results[0]?.total || 0,
      total_compliance_decisions: stats[3].results[0]?.total || 0,
      total_case_law_events: stats[4].results[0]?.total || 0,
      pending_backlog_items: stats[5].results[0]?.total || 0,
      jurisdictions_with_age_rules: stats[6].results[0]?.total || 0,
      age_statistics: stats[7].results[0] || {}
    }
  })
})

export default app
