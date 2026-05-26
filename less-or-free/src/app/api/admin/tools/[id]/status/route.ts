export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb, updateToolStatus, getToolWithCategories } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidateFrontend } from '@/lib/revalidate'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params
    const body = await request.json() as { status?: string }
    const { status } = body

    if (!status || !['published', 'unpublished'].includes(status)) {
      return Response.json(error(400, 'Status must be "published" or "unpublished"'), { status: 400 })
    }

    const existing = await getToolWithCategories(db, id)
    if (!existing) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    await updateToolStatus(db, id, status)
    await revalidateFrontend()

    return Response.json(success({ id, status }))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
