export const runtime = 'edge'

import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { requireAuth, deleteSession, clearSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const db = getDb(request)
  const token = await requireAuth(request, db)
  if (!token) return Response.json(error(401), { status: 401 })

  try {
    await deleteSession(db, token)
    const cookie = clearSessionCookie()

    return Response.json(success(null), {
      headers: { 'Set-Cookie': cookie },
    })
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
