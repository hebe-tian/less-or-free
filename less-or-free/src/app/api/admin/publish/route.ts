import type { NextRequest } from 'next/server'
import { success, error, generateId, now } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { revalidateFrontend } from '@/lib/revalidate'

export async function POST(request: NextRequest) {
  const db = await getDb()
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    const body = await request.json() as { description?: string }
    const { description } = body

    const publishedTools = await db
      .prepare("SELECT id, name, badge_payment, badge_china_access, badge_open_source, badge_maintenance, status FROM tools WHERE status = 'published'")
      .all()

    const toolIds = (publishedTools.results as { id: string }[]).map((t) => t.id)

    const categoryMap = new Map<string, string[]>()
    if (toolIds.length > 0) {
      const placeholders = toolIds.map(() => '?').join(',')
      const tcResults = await db
        .prepare(`SELECT tool_id, category_id FROM tool_categories WHERE tool_id IN (${placeholders})`)
        .bind(...toolIds)
        .all()

      for (const row of tcResults.results as { tool_id: string; category_id: string }[]) {
        if (!categoryMap.has(row.tool_id)) {
          categoryMap.set(row.tool_id, [])
        }
        categoryMap.get(row.tool_id)!.push(row.category_id)
      }
    }

    const serializedTools = (publishedTools.results as { id: string; name: string; badge_payment: string; badge_china_access: string; badge_open_source: string; badge_maintenance: string; status: string }[]).map((t) => ({
      id: t.id,
      name: t.name,
      badge_payment: t.badge_payment,
      badge_china_access: t.badge_china_access,
      badge_open_source: t.badge_open_source,
      badge_maintenance: t.badge_maintenance,
      status: t.status,
      category_ids: categoryMap.get(t.id) || [],
    }))

    const data = JSON.stringify(serializedTools)

    const maxVersion = await db
      .prepare('SELECT MAX(version) as max_ver FROM snapshots')
      .first<{ max_ver: number | null }>()

    const version = (maxVersion?.max_ver ?? 0) + 1
    const id = generateId()
    const timestamp = now()

    await db
      .prepare('INSERT INTO snapshots (id, version, description, data, created_at) VALUES (?, ?, ?, ?, ?)')
      .bind(id, version, description || null, data, timestamp)
      .run()

    if (toolIds.length > 0) {
      const placeholders = toolIds.map(() => '?').join(',')
      await db
        .prepare(`UPDATE tools SET last_snapshot_version = ? WHERE id IN (${placeholders}) AND status = 'published'`)
        .bind(version, ...toolIds)
        .run()
    }

    await revalidateFrontend()

    return Response.json(success({ version, id, toolCount: publishedTools.results.length }), { status: 201 })
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
