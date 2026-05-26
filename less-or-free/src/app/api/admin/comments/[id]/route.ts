export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const { id } = await params

    const comment = await db.prepare('SELECT * FROM comments WHERE id = ?').bind(id).first()
    if (!comment) {
      return Response.json(error(404, 'Comment not found'), { status: 404 })
    }

    await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run()

    if (comment.tool_id) {
      await db
        .prepare('UPDATE tools SET comment_count = comment_count - 1 WHERE id = ? AND comment_count > 0')
        .bind(comment.tool_id)
        .run()
    }

    return Response.json(success(null))
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
