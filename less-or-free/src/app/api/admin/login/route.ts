import type { NextRequest } from 'next/server'
import { success, error } from '@/lib/utils'
import { getDb } from '@/lib/db'
import { createSession, getAdminPassword, setSessionCookie } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const db = await getDb()

  try {
    const body = await request.json() as { password?: string }
    const { password } = body

    if (!password) {
      return Response.json(error(400, 'Password is required'), { status: 400 })
    }

    const adminPassword = await getAdminPassword()
    if (password !== adminPassword) {
      return Response.json(error(401, 'Invalid password'), { status: 401 })
    }

    const token = await createSession(db)
    const cookie = setSessionCookie(token)

    return Response.json(success({ token }), {
      headers: { 'Set-Cookie': cookie },
    })
  } catch {
    return Response.json(error(500, 'Internal server error'), { status: 500 })
  }
}
