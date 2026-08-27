import { jobs } from '#shared/data/jobs'
import { photoSpots } from '#shared/data/spots'
import { requireAdmin, toPublicUser } from '../../utils/auth'
import { collectionItems, getAdminPricingRules, mergedServices, store } from '../../utils/store'

// GET /api/admin/stats — خلاصه‌ی داشبورد
export default defineEventHandler((event) => {
  requireAdmin(event)
  const recentUsers = [...store.data.users]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5)
    .map(toPublicUser)

  return {
    users: store.data.users.length,
    jobs: jobs.length,
    jobsOpen: jobs.filter(j => !store.data.deleted.jobs.includes(j.id)
      && store.data.overrides.jobs[j.id]?.status !== 'closed'
      && store.data.overrides.jobs[j.id]?.status !== 'paused').length,
    spots: (photoSpots as { length: number }).length - store.data.deleted.spots.length,
    services: mergedServices().length,
    communityCreatives: store.data.communityCreatives.length,
    fontPacks: collectionItems('font-packs').length,
    palettes: collectionItems('color-palettes').length,
    pricingCustomized: store.data.adminPricing !== null,
    minimumPrice: getAdminPricingRules().minimumPrice,
    recentUsers,
  }
})
