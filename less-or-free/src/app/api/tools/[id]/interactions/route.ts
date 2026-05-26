import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { isValidFingerprint } from '@/lib/fingerprint'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = await getDb()
    const { searchParams } = request.nextUrl
    const fingerprint = searchParams.get('fingerprint')

    if (!fingerprint || !isValidFingerprint(fingerprint)) {
      return Response.json(error(400, 'Invalid fingerprint'), { status: 400 })
    }

    const tool = await db.prepare('SELECT id FROM tools WHERE id = ?').bind(id).first()
    if (!tool) {
      return Response.json(error(404, 'Tool not found'), { status: 404 })
    }

    const starInteraction = await db
      .prepare('SELECT id FROM interactions WHERE tool_id = ? AND fingerprint = ? AND type = ?')
      .bind(id, fingerprint, 'star')
      .first()

    const opposeInteraction = await db
      .prepare('SELECT id FROM interactions WHERE tool_id = ? AND fingerprint = ? AND type = ?')
      .bind(id, fingerprint, 'oppose')
      .first()

    return Response.json(success({
      starred: !!starInteraction,
      opposed: !!opposeInteraction,
    }))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
