// ABOUTME: API routes for instruments (laws, bills, regulations)
// ABOUTME: Provides CRUD operations and search functionality

import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// List all instruments with filtering and pagination
app.get('/', async (c) => {
  const { jurisdiction_id, instrument_type, status, search, page = '1', limit = '50' } = c.req.query()
  const offset = (parseInt(page) - 1) * parseInt(limit)

  let query = 'SELECT * FROM instruments WHERE 1=1'
  const params: any[] = []

  if (jurisdiction_id) {
    query += ' AND jurisdiction_id = ?'
    params.push(jurisdiction_id)
  }

  if (instrument_type) {
    query += ' AND instrument_type = ?'
    params.push(instrument_type)
  }

  if (status) {
    query += ' AND status LIKE ?'
    params.push(`%${status}%`)
  }

  if (search) {
    query += ' AND (title LIKE ? OR citation_or_number LIKE ? OR scope_summary LIKE ?)'
    params.push(`%${search}%`, `%${search}%`, `%${search}%`)
  }

  query += ' ORDER BY effective_or_commencement_date DESC, title LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  const result = await c.env.DB.prepare(query).bind(...params).all()

  // Get total count
  let countQuery = 'SELECT COUNT(*) as total FROM instruments WHERE 1=1'
  const countParams: any[] = []

  if (jurisdiction_id) {
    countQuery += ' AND jurisdiction_id = ?'
    countParams.push(jurisdiction_id)
  }

  if (instrument_type) {
    countQuery += ' AND instrument_type = ?'
    countParams.push(instrument_type)
  }

  if (status) {
    countQuery += ' AND status LIKE ?'
    countParams.push(`%${status}%`)
  }

  if (search) {
    countQuery += ' AND (title LIKE ? OR citation_or_number LIKE ? OR scope_summary LIKE ?)'
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

// Get single instrument
app.get('/:id', async (c) => {
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'SELECT * FROM instruments WHERE instrument_id = ?'
  ).bind(id).first()

  if (!result) {
    return c.json({ error: 'Instrument not found' }, 404)
  }

  return c.json(result)
})

// Create new instrument
app.post('/', async (c) => {
  const body = await c.req.json()
  const {
    instrument_id, jurisdiction_id, instrument_type, title, citation_or_number,
    status, introduced_date, passed_date, signed_or_assented_date,
    effective_or_commencement_date, min_age_rule, scope_summary, source_url
  } = body

  if (!instrument_id || !jurisdiction_id || !instrument_type || !title) {
    return c.json({ error: 'Missing required fields: instrument_id, jurisdiction_id, instrument_type, title' }, 400)
  }

  try {
    await c.env.DB.prepare(
      `INSERT INTO instruments (
        instrument_id, jurisdiction_id, instrument_type, title, citation_or_number,
        status, introduced_date, passed_date, signed_or_assented_date,
        effective_or_commencement_date, min_age_rule, scope_summary, source_url
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      instrument_id, jurisdiction_id, instrument_type, title, citation_or_number || null,
      status || null, introduced_date || null, passed_date || null, signed_or_assented_date || null,
      effective_or_commencement_date || null, min_age_rule || null, scope_summary || null, source_url || null
    ).run()

    return c.json({ success: true, instrument_id }, 201)
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Update instrument
app.put('/:id', async (c) => {
  const id = c.req.param('id')
  const body = await c.req.json()

  const updateFields: string[] = []
  const params: any[] = []

  const allowedFields = [
    'jurisdiction_id', 'instrument_type', 'title', 'citation_or_number',
    'status', 'introduced_date', 'passed_date', 'signed_or_assented_date',
    'effective_or_commencement_date', 'min_age_rule', 'scope_summary', 'source_url'
  ]

  allowedFields.forEach(field => {
    if (field in body) {
      updateFields.push(`${field} = ?`)
      params.push(body[field] || null)
    }
  })

  if (updateFields.length === 0) {
    return c.json({ error: 'No fields to update' }, 400)
  }

  updateFields.push("updated_at = strftime('%s', 'now')")
  params.push(id)

  try {
    const result = await c.env.DB.prepare(
      `UPDATE instruments SET ${updateFields.join(', ')} WHERE instrument_id = ?`
    ).bind(...params).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Instrument not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

// Delete instrument
app.delete('/:id', async (c) => {
  const id = c.req.param('id')

  try {
    const result = await c.env.DB.prepare(
      'DELETE FROM instruments WHERE instrument_id = ?'
    ).bind(id).run()

    if (result.meta.changes === 0) {
      return c.json({ error: 'Instrument not found' }, 404)
    }

    return c.json({ success: true })
  } catch (error: any) {
    return c.json({ error: error.message }, 500)
  }
})

export default app
