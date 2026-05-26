export const runtime = 'edge'

import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ version: string }> }
) {
  try {
    const { version } = await params
    const db = getDb(request)
    const versionNum = parseInt(version)

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
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
