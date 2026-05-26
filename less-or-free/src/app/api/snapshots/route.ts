import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'

export async function GET() {
  try {
    const db = await getDb()
    const snapshots = await db
      .prepare('SELECT id, version, description, created_at FROM snapshots ORDER BY version DESC')
      .all()

    return Response.json(success(snapshots.results))
  } catch (e) {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
