export const runtime = 'edge'

import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const db = getDb(request)
    const snapshots = await db
      .prepare('SELECT id, version, description, created_at FROM snapshots ORDER BY version DESC')
      .all()

    return Response.json(success(snapshots.results))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
