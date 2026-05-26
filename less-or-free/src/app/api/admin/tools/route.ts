export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error, isValidUrl } from '@/lib/utils'
import { getDb, getToolList, createTool } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || undefined
    const search = searchParams.get('search') || undefined
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)

    const result = await getToolList({
      db,
      status,
      search,
      page,
      pageSize,
      admin: true,
    })

    return Response.json(success(result))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const body = await request.json() as { name?: string; description?: string; url?: string; icon_url?: string; badge_payment?: string; badge_china_access?: string; badge_open_source?: string; badge_maintenance?: string; category_ids?: string[] }
    const { name, url, description, icon_url, badge_payment, badge_china_access, badge_open_source, badge_maintenance, category_ids } = body

    if (!name || name.length > 100) {
      return Response.json(error(400, 'Name is required and must be 100 characters or less'), { status: 400 })
    }

    if (!url || !isValidUrl(url)) {
      return Response.json(error(400, 'Valid URL is required'), { status: 400 })
    }

    if (!description || description.length > 2000) {
      return Response.json(error(400, 'Description is required and must be 2000 characters or less'), { status: 400 })
    }

    if (!badge_payment || !badge_china_access || !badge_open_source || !badge_maintenance) {
      return Response.json(error(400, 'All badge fields are required'), { status: 400 })
    }

    const tool = await createTool(db, {
      name,
      url,
      description,
      icon_url: icon_url || undefined,
      badge_payment,
      badge_china_access,
      badge_open_source,
      badge_maintenance,
      category_ids: category_ids || [],
    })

    return Response.json(success(tool), { status: 201 })
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
