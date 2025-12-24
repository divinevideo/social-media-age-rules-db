// ABOUTME: API routes for regulatory families
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM regulatory_families ORDER BY family_name').all()
  return c.json({ data: result.results })
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { family_name, description, notes } = body
  
  const result = await c.env.DB.prepare(
    `INSERT INTO regulatory_families (family_name, description, notes) VALUES (?, ?, ?)`
  ).bind(family_name, description || null, notes || null).run()
  
  return c.json({ success: true, id: result.meta.last_row_id }, 201)
})

export default app
