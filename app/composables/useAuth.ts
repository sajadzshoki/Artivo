import type { PublicUser } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useAuth · وضعیت کاربر سمت کلاینت
// کاربر در plugin سرور (useRequestFetch) پر می‌شود و با payload
// به کلاینت می‌رسد؛ بعد از هر تغییر هم همان‌جا به‌روز می‌شود.
// ─────────────────────────────────────────────────────────────

export interface RegisterPayload {
  name: string
  mobile: string
  email: string
  password: string
  roles: string[]
}

export function useAuth() {
  const user = useState<PublicUser | null>('artivo-user', () => null)
  const ready = useState<boolean>('artivo-user-ready', () => false)

  async function refresh(fetcher: typeof $fetch = $fetch) {
    try {
      const res = await fetcher<{ user: PublicUser | null }>('/api/auth/me')
      user.value = res.user
    }
    catch {
      user.value = null
    }
    finally {
      ready.value = true
    }
  }

  function setUser(u: PublicUser | null) {
    user.value = u
    ready.value = true
  }

  async function login(identifier: string, password: string) {
    const res = await $fetch<{ user: PublicUser }>('/api/auth/login', {
      method: 'POST',
      body: { identifier, password },
    })
    setUser(res.user)
    return res.user
  }

  async function register(payload: RegisterPayload) {
    const res = await $fetch<{ user: PublicUser }>('/api/auth/register', {
      method: 'POST',
      body: payload,
    })
    setUser(res.user)
    return res.user
  }

  async function patchProfile(body: Record<string, unknown>) {
    const res = await $fetch<{ user: PublicUser }>('/api/auth/profile', { method: 'PUT', body })
    setUser(res.user)
    return res.user
  }

  async function logout() {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    }
    catch { /* مهم نیست */ }
    setUser(null)
    await navigateTo('/')
  }

  const isAdmin = computed(() => !!user.value?.roles.includes('admin'))

  function hasRole(role: 'client' | 'creative' | 'admin') {
    return !!user.value?.roles.includes(role)
  }

  return { user, ready, refresh, setUser, login, register, patchProfile, logout, isAdmin, hasRole }
}
