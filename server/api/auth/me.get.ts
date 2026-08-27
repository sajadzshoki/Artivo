import { getSessionUser, toPublicUser } from '../../utils/auth'

// GET /api/auth/me — کاربر نشست جاری (یا null؛ همیشه 200)
export default defineEventHandler((event) => {
  const user = getSessionUser(event)
  return { user: user ? toPublicUser(user) : null }
})
