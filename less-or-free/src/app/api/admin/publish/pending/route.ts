import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const db = await getDb()
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const tools = await db
      .prepare(
        `SELECT * FROM tools
         WHERE last_snapshot_version IS NULL
         OR updated_at > (SELECT created_at FROM snapshots ORDER BY version DESC LIMIT 1)`
      )
      .all()

    return Response.json(success(tools.results))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
