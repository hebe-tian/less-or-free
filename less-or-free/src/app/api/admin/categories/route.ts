export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error, generateId, now } from '@/lib/utils'
import { getDb, getCategoriesWithCount } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const categories = await getCategoriesWithCount(db)
    return Response.json(success(categories))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const body = (await request.json()) as { name?: string; slug?: string; sort_order?: number }
    const { name, slug, sort_order } = body

    if (!name || !slug) {
      return Response.json(error(400, 'Name and slug are required'), { status: 400 })
    }

    const existing = await db.prepare('SELECT id FROM categories WHERE slug = ?').bind(slug).first()
    if (existing) {
      return Response.json(error(409, 'Slug already exists'), { status: 409 })
    }

    const id = generateId()
    const timestamp = now()

    await db
      .prepare('INSERT INTO categories (id, name, slug, sort_order, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(id, name, slug, sort_order || 0, timestamp, timestamp)
      .run()

    return Response.json(success({ id, name, slug, sort_order: sort_order || 0, created_at: timestamp, updated_at: timestamp }), { status: 201 })
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
