// ABOUTME: API routes for compliance decisions
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM compliance_decisions ORDER BY last_reviewed_at DESC').all()
  return c.json({ data: result.results })
})

app.get('/:id', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM compliance_decisions WHERE id = ?').bind(c.req.param('id')).first()
  if (!result) return c.json({ error: 'Not found' }, 404)
  return c.json(result)
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { jurisdiction_id, decision_state, min_age_to_access, risk_level, owner, last_reviewed_at, product_controls, notes } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO compliance_decisions (jurisdiction_id, decision_state, min_age_to_access, risk_level, owner, last_reviewed_at, product_controls, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(jurisdiction_id, decision_state, min_age_to_access || null, risk_level || null, owner || null, last_reviewed_at || null, product_controls || null, notes || null).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

app.put('/:id', async (c) => {
  const body = await c.req.json()
  const id = c.req.param('id')
  const fields = ['jurisdiction_id', 'decision_state', 'min_age_to_access', 'risk_level', 'owner', 'last_reviewed_at', 'product_controls', 'notes']
  const updates = fields.filter(f => f in body).map(f => `${f} = ?`)
  const values = fields.filter(f => f in body).map(f => body[f] ?? null)
  
  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400)
  
  const result = await c.env.DB.prepare(
    `UPDATE compliance_decisions SET ${updates.join(', ')}, updated_at = strftime('%s', 'now') WHERE id = ?`
  ).bind(...values, id).run()
  
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})

app.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM compliance_decisions WHERE id = ?').bind(c.req.param('id')).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})

export default app
