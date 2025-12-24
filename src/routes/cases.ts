// ABOUTME: API routes for case law events
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const { jurisdiction_id } = c.req.query()
  let query = 'SELECT * FROM case_law_events WHERE 1=1'
  const params: any[] = []
  
  if (jurisdiction_id) {
    query += ' AND jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }
  
  query += ' ORDER BY event_date DESC'
  const result = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ data: result.results })
})

app.get('/:id', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM case_law_events WHERE case_id = ?').bind(c.req.param('id')).first()
  if (!result) return c.json({ error: 'Not found' }, 404)
  return c.json(result)
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { case_id, jurisdiction_id, instrument_id, court_or_body, event_type, event_date, summary, source_url } = body
  
  await c.env.DB.prepare(
    `INSERT INTO case_law_events (case_id, jurisdiction_id, instrument_id, court_or_body, event_type, event_date, summary, source_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(case_id, jurisdiction_id, instrument_id || null, court_or_body || null, event_type, event_date || null, summary || null, source_url || null).run()
  
  return c.json({ success: true, case_id }, 201)
})

app.put('/:id', async (c) => {
  const body = await c.req.json()
  const id = c.req.param('id')
  const fields = ['jurisdiction_id', 'instrument_id', 'court_or_body', 'event_type', 'event_date', 'summary', 'source_url']
  const updates = fields.filter(f => f in body).map(f => `${f} = ?`)
  const values = fields.filter(f => f in body).map(f => body[f] ?? null)
  
  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
  
  const result = await c.env.DB.prepare(
    `UPDATE case_law_events SET ${updates.join(', ')}, updated_at = strftime('%s', 'now') WHERE case_id = ?`
  ).bind(...values, id).run()
  
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})

app.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM case_law_events WHERE case_id = ?').bind(c.req.param('id')).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})

export default app
