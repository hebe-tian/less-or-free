import { success, error, generateId, now } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { isValidFingerprint } from '@/lib/fingerprint'
import { NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const body = await request.json() as { fingerprint?: string }
    const { fingerprint } = body

    if (!fingerprint || !isValidFingerprint(fingerprint)) {
      return Response.json(error(400, 'Invalid fingerprint'), { status: 400 })
    }

    const tool = await db.prepare('SELECT id, oppose_count FROM tools WHERE id = ?').bind(id).first()
    if (!tool) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    const existing = await db
      .prepare('SELECT id FROM interactions WHERE tool_id = ? AND fingerprint = ? AND type = ?')
      .bind(id, fingerprint, 'oppose')
      .first()

    if (existing) {
      await db.prepare('DELETE FROM interactions WHERE id = ?').bind(existing.id).run()
      const newCount = Math.max(0, (tool.oppose_count as number) - 1)
      await db.prepare('UPDATE tools SET oppose_count = ? WHERE id = ?').bind(newCount, id).run()
      return Response.json(success({ opposed: false, opposeCount: newCount }))
    } else {
      const interactionId = generateId()
      const timestamp = now()
      await db
        .prepare('INSERT INTO interactions (id, tool_id, fingerprint, type, created_at) VALUES (?, ?, ?, ?, ?)')
        .bind(interactionId, id, fingerprint, 'oppose', timestamp)
        .run()
      const newCount = (tool.oppose_count as number) + 1
      await db.prepare('UPDATE tools SET oppose_count = ? WHERE id = ?').bind(newCount, id).run()
      return Response.json(success({ opposed: true, opposeCount: newCount }))
    }
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
