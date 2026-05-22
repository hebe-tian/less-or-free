export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ version: string }> }) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { version } = await params
    const versionNum = parseInt(version, 10)

    if (isNaN(versionNum)) {
      return Response.json(error(400, 'Invalid version number'), { status: 400 })
    }

    const snapshot = await db
      .prepare('SELECT * FROM snapshots WHERE version = ?')
      .bind(versionNum)
      .first()

    if (!snapshot) {
      return Response.json(error(404, 'Snapshot not found'), { status: 404 })
    }

    return Response.json(success(snapshot))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
