import { destroySession } from '../../utils/auth'

// POST /api/auth/logout — خروج از نشست فعلی
export default defineEventHandler((event) => {
  destroySession(event)
  return { ok: true }
})
