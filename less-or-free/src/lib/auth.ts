import { getCloudflareContext } from '@opennextjs/cloudflare'
import { generateId, now } from './utils'

const SESSION_COOKIE_NAME = 'admin_token'
const SESSION_DURATION_HOURS = 24

export async function getAdminPassword(): Promise<string> {
  const { env } = await getCloudflareContext()
  if (env.ADMIN_PASSWORD) return env.ADMIN_PASSWORD
  return 'admin123'
}

export async function createSession(db: D1Database): Promise<string> {
  const id = generateId()
  const token = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + SESSION_DURATION_HOURS * 60 * 60 * 1000).toISOString()

  await db
    .prepare('INSERT INTO admin_sessions (id, token, expires_at) VALUES (?, ?, ?)')
    .bind(id, token, expiresAt)
    .run()

  return token
}

export async function validateSession(db: D1Database, token: string): Promise<boolean> {
  const session = await db
    .prepare('SELECT * FROM admin_sessions WHERE token = ? AND expires_at > ?')
    .bind(token, now())
    .first()

  return !!session
}

export async function deleteSession(db: D1Database, token: string): Promise<void> {
  await db.prepare('DELETE FROM admin_sessions WHERE token = ?').bind(token).run()
}

export async function cleanExpiredSessions(db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM admin_sessions WHERE expires_at <= ?').bind(now()).run()
}

export function getTokenFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get('cookie') || ''
  const cookies = cookieHeader.split(';').map((c) => c.trim())
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=')
    if (name === SESSION_COOKIE_NAME && value) {
      return value
    }
  }
  return null
}

export function setSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_DURATION_HOURS * 3600}`
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
}

export async function requireAuth(request: Request, db: D1Database): Promise<string | null> {
  const token = getTokenFromRequest(request)
  if (!token) return null

  const valid = await validateSession(db, token)
  return valid ? token : null
}
