export function getFingerprintFromRequest(request: Request): string | null {
  return request.headers.get('x-fingerprint') || null
}

export function isValidFingerprint(fp: string): boolean {
  return typeof fp === 'string' && fp.length >= 8 && fp.length <= 128
}
