// ABOUTME: API routes for US state matrix
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const { state_jurisdiction_id, metric_name } = c.req.query()
  let query = 'SELECT * FROM us_state_matrix WHERE 1=1'
  const params: any[] = []
  
  if (state_jurisdiction_id) {
    query += ' AND state_jurisdiction_id = ?'
    params.push(state_jurisdiction_id)
  }
  
  if (metric_name) {
    query += ' AND metric_name = ?'
    params.push(metric_name)
  }
  
  const result = await c.env.DB.prepare(query).bind(...params).all()
  return c.json({ data: result.results })
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { state_jurisdiction_id, metric_name, metric_value, notes, effective_date } = body
  
  await c.env.DB.prepare(
    `INSERT INTO us_state_matrix (state_jurisdiction_id, metric_name, metric_value, notes, effective_date)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(state_jurisdiction_id, metric_name) DO UPDATE SET
     metric_value = excluded.metric_value, notes = excluded.notes, effective_date = excluded.effective_date`
  ).bind(state_jurisdiction_id, metric_name, metric_value || null, notes || null, effective_date || null).run()
  
  return c.json({ success: true }, 201)
})

export default app
