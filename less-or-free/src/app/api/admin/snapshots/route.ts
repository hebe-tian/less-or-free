export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const snapshots = await db
      .prepare('SELECT id, version, description, created_at FROM snapshots ORDER BY version DESC')
      .all()

    return Response.json(success(snapshots.results))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
