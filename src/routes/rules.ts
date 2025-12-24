// ABOUTME: API routes for rule assertions (specific age rules from instruments)
// ABOUTME: Provides CRUD operations and search functionality

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// List all rule assertions with filtering
app.get('/', async (c) => {
  const { jurisdiction_id, instrument_id, rule_type, age_min, search, page = '1', limit = '50' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = 'SELECT * FROM rule_assertions WHERE 1=1'
  const params: any[] = []

  if (jurisdiction_id) {
    query += ' AND jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (instrument_id) {
    query += ' AND instrument_id = ?'
    params.push(instrument_id)
  }

  if (rule_type) {
    query += ' AND rule_type = ?'
    params.push(rule_type)
  }

  if (age_min) {
    query += ' AND age_min = ?'
    params.push(parseInt(age_min))
  }

  if (search) {
    query += ' AND requirement LIKE ?'
    params.push(`%${search}%`)
  }

  query += ' ORDER BY effective_date DESC, id DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const result = await c.env.DB.prepare(query).bind(...params).all()

  let countQuery = 'SELECT COUNT(*) as total FROM rule_assertions WHERE 1=1'
  const countParams: any[] = []

  if (jurisdiction_id) {
    countQuery += ' AND jurisdiction_id = ?'
    countParams.push(jurisdiction_id)
  }

  if (instrument_id) {
    countQuery += ' AND instrument_id = ?'
    countParams.push(instrument_id)
  }

  if (rule_type) {
    countQuery += ' AND rule_type = ?'
    countParams.push(rule_type)
  }

  if (age_min) {
    countQuery += ' AND age_min = ?'
    countParams.push(parseInt(age_min))
  }

  if (search) {
    countQuery += ' AND requirement LIKE ?'
    countParams.push(`%${search}%`)
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

// Get single rule
app.get('/:id', async (c) => {
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'SELECT * FROM rule_assertions WHERE id = ?'
  ).bind(id).first()

  if (!result) {
    return c.json({ error: 'Rule not found' }, 404)
  }

  return c.json(result)
})

// Create new rule
app.post('/', async (c) => {
  const body = await c.req.json()
  const {
    jurisdiction_id, instrument_id, rule_type, age_min, age_max,
    requirement, confidence, reviewed_by, reviewed_at, effective_date
  } = body

  if (!jurisdiction_id || !instrument_id || !rule_type || !requirement) {
    return c.json({ error: 'Missing required fields: jurisdiction_id, instrument_id, rule_type, requirement' }, 400)
  }

  try {
    const result = await c.env.DB.prepare(
      `INSERT INTO rule_assertions (
        jurisdiction_id, instrument_id, rule_type, age_min, age_max,
        requirement, confidence, reviewed_by, reviewed_at, effective_date
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      jurisdiction_id, instrument_id, rule_type, age_min || null, age_max || null,
      requirement, confidence || null, reviewed_by || null, reviewed_at || null, effective_date || null
    ).run()

    return c.json({ success: true, id: result.meta.last_row_id }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update rule
app.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const updateFields: string[] = []
  const params: any[] = []

  const allowedFields = [
    'jurisdiction_id', 'instrument_id', 'rule_type', 'age_min', 'age_max',
    'requirement', 'confidence', 'reviewed_by', 'reviewed_at', 'effective_date'
  ]

  allowedFields.forEach(field => {
    if (field in body) {
      updateFields.push(`${field} = ?`)
      params.push(body[field] ?? null)
    }
  })

  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  updateFields.push("updated_at = strftime('%s', 'now')")
  params.push(id)

  try {
    const result = await c.env.DB.prepare(
      `UPDATE rule_assertions SET ${updateFields.join(', ')} WHERE id = ?`
    ).bind(...params).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Rule not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete rule
app.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM rule_assertions WHERE id = ?'
    ).bind(id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Rule not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
