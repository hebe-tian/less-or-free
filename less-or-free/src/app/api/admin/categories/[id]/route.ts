export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error, now } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params
    const body = (await request.json()) as { name?: string; slug?: string; sort_order?: number }
    const { name, slug, sort_order } = body

    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first()
    if (!existing) {
      return Response.json(error(404, 'Category not found'), { status: 404 })
    }

    if (slug) {
      const slugConflict = await db.prepare('SELECT id FROM categories WHERE slug = ? AND id != ?').bind(slug, id).first()
      if (slugConflict) {
        return Response.json(error(409, 'Slug already exists'), { status: 409 })
      }
    }

    const sets: string[] = []
    const bindings: unknown[] = []

    if (name !== undefined) {
      sets.push('name = ?')
      bindings.push(name)
    }
    if (slug !== undefined) {
      sets.push('slug = ?')
      bindings.push(slug)
    }
    if (sort_order !== undefined) {
      sets.push('sort_order = ?')
      bindings.push(sort_order)
    }

    sets.push('updated_at = ?')
    bindings.push(now())

    bindings.push(id)

    await db
      .prepare(`UPDATE categories SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run()

    const updated = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first()

    return Response.json(success(updated))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params

    const existing = await db.prepare('SELECT * FROM categories WHERE id = ?').bind(id).first()
    if (!existing) {
      return Response.json(error(404, 'Category not found'), { status: 404 })
    }

    await db.prepare('DELETE FROM tool_categories WHERE category_id = ?').bind(id).run()
    await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()

    return Response.json(success(null))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
