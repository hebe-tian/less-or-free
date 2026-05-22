import { getKv } from './db'

export async function checkRateLimit(
  request: Request,
  key: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  try {
    const kv = getKv(request)
    const current = await kv.get(key)
    const count = current ? parseInt(current, 10) : 0

    if (count >= limit) return false

    await kv.put(key, String(count + 1), { expirationTtl: windowSeconds })
    return true
  } catch {
    return true
  }
}

export async function getCommentRateLimitKey(fingerprint: string): Promise<string> {
  const today = new Date().toISOString().split('T')[0]
  return `rate:comment:${fingerprint}:${today}`
}

export async function checkCommentRateLimit(request: Request, fingerprint: string): Promise<boolean> {
  const key = await getCommentRateLimitKey(fingerprint)
  return checkRateLimit(request, key, 10, 86400)
}
