export const runtime = 'edge'

import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { computeDiff, SnapshotTool } from '@/lib/diff'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const db = getDb(request)
    const { searchParams } = request.nextUrl
    const v1 = searchParams.get('v1')
    const v2 = searchParams.get('v2')

    if (!v1 || !v2) {
      return Response.json(error(400, 'Both v1 and v2 parameters are required'), { status: 400 })
    }

    const v1Num = parseInt(v1)
    const v2Num = parseInt(v2)

    if (isNaN(v1Num) || isNaN(v2Num)) {
      return Response.json(error(400, 'Invalid version numbers'), { status: 400 })
    }

    const snapshot1 = await db
      .prepare('SELECT data FROM snapshots WHERE version = ?')
      .bind(v1Num)
      .first<{ data: string }>()

    const snapshot2 = await db
      .prepare('SELECT data FROM snapshots WHERE version = ?')
      .bind(v2Num)
      .first<{ data: string }>()

    if (!snapshot1) {
      return Response.json(error(404, 'Snapshot v1 not found'), { status: 404 })
    }

    if (!snapshot2) {
      return Response.json(error(404, 'Snapshot v2 not found'), { status: 404 })
    }

    const v1Data: SnapshotTool[] = JSON.parse(snapshot1.data)
    const v2Data: SnapshotTool[] = JSON.parse(snapshot2.data)

    const diff = computeDiff(v1Data, v2Data)

    return Response.json(success(diff))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
