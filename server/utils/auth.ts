import type { H3Event } from 'h3'
import type { PublicUser } from '#shared/types'
import { SESSION_COOKIE, SESSION_TTL_MS } from './constants'
import { newToken } from './crypto'
import { store, type StoredUser } from './store'

// ─────────────────────────────────────────────────────────────
// auth · نشست کوکی‌محور (httpOnly) + گاردهای سرور
// ─────────────────────────────────────────────────────────────

export function createSession(event: H3Event, userId: string): void {
  const token = newToken()
  store.data.sessions[token] = { userId, exp: Date.now() + SESSION_TTL_MS }
  store.save()
  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export function destroySession(event: H3Event): void {
  const token = getCookie(event, SESSION_COOKIE)
  if (token && store.data.sessions[token]) {
    delete store.data.sessions[token]
    store.save()
  }
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}

export function getSessionUser(event: H3Event): StoredUser | null {
  const token = getCookie(event, SESSION_COOKIE)
  if (!token) return null
  const session = store.data.sessions[token]
  if (!session || session.exp < Date.now()) return null
  const user = store.data.users.find(u => u.id === session.userId)
  if (!user || !user.active) return null
  return user
}

export function requireUser(event: H3Event): StoredUser {
  const user = getSessionUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'برای این کار باید وارد حساب شوید.' })
  }
  return user
}

export function requireAdmin(event: H3Event): StoredUser {
  const user = requireUser(event)
  if (!user.roles.includes('admin')) {
    throw createError({ statusCode: 403, message: 'دسترسی فقط برای مدیرها.' })
  }
  return user
}

/** تبدیل به نمای عمومی — هرگز hash و داده‌ی حساس بیرون نمی‌رود */
export function toPublicUser(u: StoredUser): PublicUser {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    mobile: u.mobile,
    roles: [...u.roles],
    mobileVerified: u.mobileVerified,
    hasPassword: !!u.passwordHash,
    clientProfile: { ...u.clientProfile, preferredCategories: [...u.clientProfile.preferredCategories] },
    creativeId: u.creativeId,
    createdAt: u.createdAt,
  }
}

export function findUserByMobile(mobile: string): StoredUser | undefined {
  return store.data.users.find(u => u.mobile === mobile)
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return store.data.users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase())
}
