// ABOUTME: API routes for jurisdictions (countries, states, regions)
// ABOUTME: Provides CRUD operations and search functionality

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// List all jurisdictions with optional filtering and pagination
app.get('/', async (c) => {
  const { level, parent, search, page = '1', limit = '50' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = 'SELECT * FROM jurisdictions WHERE 1=1'
  const params: any[] = []

  if (level) {
    query += ' AND level = ?'
    params.push(level)
  }

  if (parent) {
    query += ' AND parent = ?'
    params.push(parent)
  }

  if (search) {
    query += ' AND (name LIKE ? OR jurisdiction_id LIKE ? OR notes LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY name LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const result = await c.env.DB.prepare(query).bind(...params).all()

  // Get total count for pagination
  let countQuery = 'SELECT COUNT(*) as total FROM jurisdictions WHERE 1=1'
  const countParams: any[] = []

  if (level) {
    countQuery += ' AND level = ?'
    countParams.push(level)
  }

  if (parent) {
    countQuery += ' AND parent = ?'
    countParams.push(parent)
  }

  if (search) {
    countQuery += ' AND (name LIKE ? OR jurisdiction_id LIKE ? OR notes LIKE ?)'
    countParams.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  const countResult = await c.env.DB.prepare(countQuery).bind(...countParams).first()
  const total = countResult?.total || 0

  return c.json({
    data: result.results,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  })
})

// Get single jurisdiction by ID
app.get('/:id', async (c) => {
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'SELECT * FROM jurisdictions WHERE jurisdiction_id = ?'
  ).bind(id).first()

  if (!result) {
    return c.json({ error: 'Jurisdiction not found' }, 404)
  }

  return c.json(result)
})

// Create new jurisdiction
app.post('/', async (c) => {
  const body = await c.req.json()
  const { jurisdiction_id, name, level, parent, iso_code, notes } = body

  if (!jurisdiction_id || !name || !level) {
    return c.json({ error: 'Missing required fields: jurisdiction_id, name, level' }, 400)
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO jurisdictions (jurisdiction_id, name, level, parent, iso_code, notes)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(jurisdiction_id, name, level, parent || null, iso_code || null, notes || null).run()

    return c.json({ success: true, jurisdiction_id }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update jurisdiction
app.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()
  const { name, level, parent, iso_code, notes } = body

  try {
    const result = await c.env.DB.prepare(
      `UPDATE jurisdictions 
       SET name = ?, level = ?, parent = ?, iso_code = ?, notes = ?, 
           updated_at = strftime('%s', 'now')
       WHERE jurisdiction_id = ?`
    ).bind(name, level, parent || null, iso_code || null, notes || null, id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Jurisdiction not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete jurisdiction
app.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM jurisdictions WHERE jurisdiction_id = ?'
    ).bind(id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Jurisdiction not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
