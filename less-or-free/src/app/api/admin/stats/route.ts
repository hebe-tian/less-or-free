import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const db = await getDb()
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const totalResult = await db
      .prepare('SELECT COUNT(*) as count FROM tools')
      .first<{ count: number }>()

    const publishedResult = await db
      .prepare("SELECT COUNT(*) as count FROM tools WHERE status = 'published'")
      .first<{ count: number }>()

    const draftResult = await db
      .prepare("SELECT COUNT(*) as count FROM tools WHERE status = 'draft'")
      .first<{ count: number }>()

    const unpublishedResult = await db
      .prepare("SELECT COUNT(*) as count FROM tools WHERE status = 'unpublished'")
      .first<{ count: number }>()

    const highOpposeTools = await db
      .prepare('SELECT id, name, oppose_count, star_count FROM tools WHERE oppose_count >= 5 ORDER BY oppose_count DESC LIMIT 10')
      .all()

    return Response.json(success({
      totalTools: totalResult?.count ?? 0,
      publishedCount: publishedResult?.count ?? 0,
      draftCount: draftResult?.count ?? 0,
      unpublishedCount: unpublishedResult?.count ?? 0,
      highOpposeTools: highOpposeTools.results,
    }))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
