// ABOUTME: API routes for sources (references and citations)
import { Hono } from 'hono'

type Bindings = { DB: D1Database }
const app = new Hono<{ Bindings: Bindings }>()

app.get('/', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM sources ORDER BY retrieved DESC').all()
  return c.json({ data: result.results })
})

app.get('/:id', async (c) => {
  const result = await c.env.DB.prepare('SELECT * FROM sources WHERE source_id = ?').bind(c.req.param('id')).first()
  if (!result) return c.json({ error: 'Not found' }, 404)
  return c.json(result)
})

app.post('/', async (c) => {
  const body = await c.req.json()
  const { source_id, what, url, retrieved, citation_ref, notes } = body
  
  await c.env.DB.prepare(
    `INSERT INTO sources (source_id, what, url, retrieved, citation_ref, notes) VALUES (?, ?, ?, ?, ?, ?)`
  ).bind(source_id, what, url || null, retrieved || null, citation_ref || null, notes || null).run()
  
  return c.json({ success: true, source_id }, 201)
})

app.delete('/:id', async (c) => {
  const result = await c.env.DB.prepare('DELETE FROM sources WHERE source_id = ?').bind(c.req.param('id')).run()
  if (result.meta.changes === 0) return c.json({ error: 'Not found' }, 404)
  return c.json({ success: true })
})

export default app
