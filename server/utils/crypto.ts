import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'

// ─────────────────────────────────────────────────────────────
// crypto · هش رمز عبور (scrypt) — بدون وابستگی خارجی
// فرمت ذخیره: scrypt:<salt-hex>:<hash-hex>
// ─────────────────────────────────────────────────────────────

const KEYLEN = 32

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, KEYLEN).toString('hex')
  return `scrypt:${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string | null): boolean {
  if (!stored) return false
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false
  const [, salt, hash] = parts
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, KEYLEN)
  const expected = Buffer.from(hash, 'hex')
  return candidate.length === expected.length && timingSafeEqual(candidate, expected)
}

export function newToken(): string {
  return randomBytes(24).toString('hex')
}

export function newId(prefix = 'u'): string {
  return `${prefix}-${randomBytes(5).toString('hex')}`
}
