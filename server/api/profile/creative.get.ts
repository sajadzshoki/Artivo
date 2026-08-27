import type { Creative } from '#shared/types'
import { creativesById } from '#shared/data/portfolio'
import { requireUser } from '../../utils/auth'
import { store } from '../../utils/store'

// GET /api/profile/creative — پروفایل خلاقِ پیوند‌شده به کاربر
// source: 'seed' (داده‌ی استاتیک + وصله) | 'community' (ساخته‌ی کاربر)
export default defineEventHandler((event) => {
  const user = requireUser(event)
  if (!user.creativeId) return { profile: null, source: null }

  const seed = creativesById().get(user.creativeId)
  if (seed) {
    const patch = store.data.overrides.creatives[user.creativeId] ?? {}
    return { profile: { ...seed, ...patch }, source: 'seed' }
  }
  const community = store.data.communityCreatives.find(c => c.id === user.creativeId)
  if (community) return { profile: community as Creative, source: 'community' }

  return { profile: null, source: null }
})
