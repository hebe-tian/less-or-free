import type { NextRequest } from 'next/server'
import { success, error, isValidUrl } from '@/lib/utils'
import { getDb, updateTool, deleteTool, getToolWithCategories } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb()
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params
    const body = await request.json() as { name?: string; description?: string; url?: string; icon_url?: string; badge_payment?: string; badge_china_access?: string; badge_open_source?: string; badge_maintenance?: string; category_ids?: string[] }
    const { name, url, description, icon_url, badge_payment, badge_china_access, badge_open_source, badge_maintenance, category_ids } = body

    const existing = await getToolWithCategories(db, id)
    if (!existing) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    if (name !== undefined && (name.length === 0 || name.length > 100)) {
      return Response.json(error(400, 'Name must be 1-100 characters'), { status: 400 })
    }

    if (url !== undefined && !isValidUrl(url)) {
      return Response.json(error(400, 'Invalid URL format'), { status: 400 })
    }

    if (description !== undefined && (description.length === 0 || description.length > 2000)) {
      return Response.json(error(400, 'Description must be 1-2000 characters'), { status: 400 })
    }

    const tool = await updateTool(db, id, {
      name,
      url,
      description,
      icon_url,
      badge_payment,
      badge_china_access,
      badge_open_source,
      badge_maintenance,
      category_ids,
    })

    return Response.json(success(tool))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = await getDb()
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params

    const existing = await getToolWithCategories(db, id)
    if (!existing) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    await deleteTool(db, id)

    return Response.json(success(null))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
