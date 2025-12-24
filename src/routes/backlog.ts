// ABOUTME: API routes for coverage backlog
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const { status } = c.req.query()
  let query = 'SELECT * FROM coverage_backlog WHERE 1=1'
  const params: any[] = []
  
  if (status) {
    query += ' AND status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY priority DESC, created_at DESC'
  const result = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ data: result.results })
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { jurisdiction_id, topic, priority, status, assigned_to, notes } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO coverage_backlog (jurisdiction_id, topic, priority, status, assigned_to, notes)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(jurisdiction_id || null, topic, priority || null, status || 'pending', assigned_to || null, notes || null).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

export default app
