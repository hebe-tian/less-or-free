import { generateId, now } from './utils'

export function getDb(request: Request): D1Database {
  const env = (request as unknown as { env: Env }).env
  if (env?.DB) return env.DB

  const cf = (request as unknown as { cf?: { env: CloudflareEnv } }).cf
  if (cf?.env?.DB) return cf.env.DB

  throw new Error('D1 database binding not found')
}

export function getKv(request: Request): KVNamespace {
  const env = (request as unknown as { env: Env }).env
  if (env?.KV) return env.KV

  const cf = (request as unknown as { cf?: { env: CloudflareEnv } }).cf
  if (cf?.env?.KV) return cf.env.KV

  throw new Error('KV namespace binding not found')
}

export async function getToolWithCategories(db: D1Database, toolId: string) {
  const tool = await db.prepare('SELECT * FROM tools WHERE id = ?').bind(toolId).first()
  if (!tool) return null

  const categories = await db
    .prepare(
      `SELECT c.* FROM categories c
       INNER JOIN tool_categories tc ON c.id = tc.category_id
       WHERE tc.tool_id = ?`
    )
    .bind(toolId)
    .all()

  return { ...tool, categories: categories.results }
}

export async function getToolList(params: {
  db: D1Database
  category?: string
  badgePayment?: string
  badgeChinaAccess?: string
  badgeOpenSource?: string
  badgeMaintenance?: string
  search?: string
  sort?: string
  status?: string
  page?: number
  pageSize?: number
  admin?: boolean
}) {
  const {
    db,
    category,
    badgePayment,
    badgeChinaAccess,
    badgeOpenSource,
    badgeMaintenance,
    search,
    sort = 'latest',
    status = 'published',
    page = 1,
    pageSize = 20,
    admin = false,
  } = params

  const conditions: string[] = []
  const bindings: unknown[] = []

  if (!admin) {
    if (status === 'all') {
      conditions.push("status IN ('published', 'unpublished')")
    } else {
      conditions.push("status = 'published'")
    }
  } else {
    if (status && status !== 'all') {
      conditions.push('status = ?')
      bindings.push(status)
    }
  }

  if (category) {
    conditions.push(
      `id IN (SELECT tool_id FROM tool_categories WHERE category_id = (SELECT id FROM categories WHERE slug = ?))`
    )
    bindings.push(category)
  }

  if (badgePayment) {
    conditions.push('badge_payment = ?')
    bindings.push(badgePayment)
  }
  if (badgeChinaAccess) {
    conditions.push('badge_china_access = ?')
    bindings.push(badgeChinaAccess)
  }
  if (badgeOpenSource) {
    conditions.push('badge_open_source = ?')
    bindings.push(badgeOpenSource)
  }
  if (badgeMaintenance) {
    conditions.push('badge_maintenance = ?')
    bindings.push(badgeMaintenance)
  }

  if (search) {
    conditions.push('(name LIKE ? OR description LIKE ?)')
    bindings.push(`%${search}%`, `%${search}%`)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  let orderBy = 'ORDER BY created_at DESC'
  if (sort === 'stars') orderBy = 'ORDER BY star_count DESC, created_at DESC'
  if (sort === 'name') orderBy = 'ORDER BY name ASC'

  const offset = (page - 1) * pageSize

  const countResult = await db
    .prepare(`SELECT COUNT(*) as total FROM tools ${whereClause}`)
    .bind(...bindings)
    .first<{ total: number }>()

  const tools = await db
    .prepare(`SELECT * FROM tools ${whereClause} ${orderBy} LIMIT ? OFFSET ?`)
    .bind(...bindings, pageSize, offset)
    .all()

  return {
    tools: tools.results,
    total: countResult?.total ?? 0,
    page,
    pageSize,
  }
}

export async function createTool(
  db: D1Database,
  data: {
    name: string
    description: string
    url: string
    icon_url?: string
    badge_payment: string
    badge_china_access: string
    badge_open_source: string
    badge_maintenance: string
    category_ids: string[]
  }
) {
  const id = generateId()
  const timestamp = now()

  await db
    .prepare(
      `INSERT INTO tools (id, name, description, url, icon_url, status, badge_payment, badge_china_access, badge_open_source, badge_maintenance, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'draft', ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      data.name,
      data.description,
      data.url,
      data.icon_url || null,
      data.badge_payment,
      data.badge_china_access,
      data.badge_open_source,
      data.badge_maintenance,
      timestamp,
      timestamp
    )
    .run()

  if (data.category_ids.length > 0) {
    const stmts = data.category_ids.map((catId) =>
      db.prepare('INSERT INTO tool_categories (tool_id, category_id) VALUES (?, ?)').bind(id, catId)
    )
    await db.batch(stmts)
  }

  return { id, ...data, status: 'draft', star_count: 0, oppose_count: 0, comment_count: 0, created_at: timestamp, updated_at: timestamp }
}

export async function updateTool(
  db: D1Database,
  toolId: string,
  data: {
    name?: string
    description?: string
    url?: string
    icon_url?: string
    badge_payment?: string
    badge_china_access?: string
    badge_open_source?: string
    badge_maintenance?: string
    category_ids?: string[]
  }
) {
  const sets: string[] = []
  const bindings: unknown[] = []

  const fields = ['name', 'description', 'url', 'icon_url', 'badge_payment', 'badge_china_access', 'badge_open_source', 'badge_maintenance'] as const
  for (const field of fields) {
    if (data[field] !== undefined) {
      sets.push(`${field} = ?`)
      bindings.push(data[field])
    }
  }

  sets.push('updated_at = ?')
  bindings.push(now())

  if (sets.length > 0) {
    bindings.push(toolId)
    await db
      .prepare(`UPDATE tools SET ${sets.join(', ')} WHERE id = ?`)
      .bind(...bindings)
      .run()
  }

  if (data.category_ids !== undefined) {
    await db.prepare('DELETE FROM tool_categories WHERE tool_id = ?').bind(toolId).run()
    if (data.category_ids.length > 0) {
      const stmts = data.category_ids.map((catId) =>
        db.prepare('INSERT INTO tool_categories (tool_id, category_id) VALUES (?, ?)').bind(toolId, catId)
      )
      await db.batch(stmts)
    }
  }

  return getToolWithCategories(db, toolId)
}

export async function deleteTool(db: D1Database, toolId: string) {
  await db.prepare('DELETE FROM interactions WHERE tool_id = ?').bind(toolId).run()
  await db.prepare('DELETE FROM comments WHERE tool_id = ?').bind(toolId).run()
  await db.prepare('DELETE FROM tool_categories WHERE tool_id = ?').bind(toolId).run()
  await db.prepare('DELETE FROM tools WHERE id = ?').bind(toolId).run()
}

export async function updateToolStatus(db: D1Database, toolId: string, status: string) {
  await db
    .prepare('UPDATE tools SET status = ?, updated_at = ? WHERE id = ?')
    .bind(status, now(), toolId)
    .run()
}

export async function getCategoriesWithCount(db: D1Database) {
  const categories = await db
    .prepare('SELECT * FROM categories ORDER BY sort_order ASC')
    .all()

  const counts = await db
    .prepare(
      `SELECT c.id, COUNT(tc.tool_id) as tool_count
       FROM categories c
       LEFT JOIN tool_categories tc ON c.id = tc.category_id
       LEFT JOIN tools t ON tc.tool_id = t.id AND t.status = 'published'
       GROUP BY c.id`
    )
    .all()

  const countMap = new Map(
    (counts.results as { id: string; tool_count: number }[]).map((r) => [r.id, r.tool_count])
  )

  return (categories.results as { id: string; [key: string]: unknown }[]).map((cat) => ({
    ...cat,
    tool_count: countMap.get(cat.id) ?? 0,
  }))
}
