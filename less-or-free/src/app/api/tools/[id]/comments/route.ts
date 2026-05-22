export const runtime = 'edge'

import { success, error, generateId, now, escapeHtml } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { isValidFingerprint } from '@/lib/fingerprint'
import { checkCommentRateLimit } from '@/lib/rate-limit'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb(request)
    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = 20
    const offset = (page - 1) * pageSize

    const tool = await db.prepare('SELECT id FROM tools WHERE id = ?').bind(id).first()
    if (!tool) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    const countResult = await db
      .prepare('SELECT COUNT(*) as total FROM comments WHERE tool_id = ?')
      .bind(id)
      .first<{ total: number }>()

    const comments = await db
      .prepare('SELECT * FROM comments WHERE tool_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?')
      .bind(id, pageSize, offset)
      .all()

    return Response.json(success({
      comments: comments.results,
      total: countResult?.total ?? 0,
      page,
      pageSize,
    }))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = getDb(request)
    const body = await request.json() as { fingerprint?: string; content?: string }
    const { fingerprint, content } = body

    if (!fingerprint || !isValidFingerprint(fingerprint)) {
      return Response.json(error(400, 'Invalid fingerprint'), { status: 400 })
    }

    if (!content || typeof content !== 'string' || content.length < 1 || content.length > 500) {
      return Response.json(error(400, 'Content must be between 1 and 500 characters'), { status: 400 })
    }

    const tool = await db.prepare('SELECT id, comment_count FROM tools WHERE id = ?').bind(id).first()
    if (!tool) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    const allowed = await checkCommentRateLimit(request, fingerprint)
    if (!allowed) {
      return Response.json(error(429, 'Rate limit exceeded'), { status: 429 })
    }

    const commentId = generateId()
    const timestamp = now()
    const escapedContent = escapeHtml(content.trim())

    await db
      .prepare('INSERT INTO comments (id, tool_id, content, fingerprint, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(commentId, id, escapedContent, fingerprint, timestamp)
      .run()

    const newCount = (tool.comment_count as number) + 1
    await db.prepare('UPDATE tools SET comment_count = ? WHERE id = ?').bind(newCount, id).run()

    return Response.json(success({
      id: commentId,
      tool_id: id,
      content: escapedContent,
      fingerprint,
      created_at: timestamp,
    }))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
