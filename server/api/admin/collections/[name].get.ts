import type { PhotoSpot } from '#shared/types'
import { getAdminCollection } from '#shared/config/admin-collections'
import { jobs } from '#shared/data/jobs'
import { photoSpots } from '#shared/data/spots'
import { requireAdmin } from '../../../utils/auth'
import { collectionItems, mergedServices, store } from '../../../utils/store'

// GET /api/admin/collections/[name] — فهرست آیتم‌های یک کالکشن ادمین
export default defineEventHandler((event) => {
  requireAdmin(event)
  const name = getRouterParam(event, 'name') ?? ''
  const def = getAdminCollection(name)
  if (!def) throw createError({ statusCode: 404, message: 'کالکشن ناشناس است.' })

  if (name === 'users') {
    return {
      items: store.data.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        mobile: u.mobile,
        roleClient: u.roles.includes('client'),
        roleCreative: u.roles.includes('creative'),
        roleAdmin: u.roles.includes('admin'),
        active: u.active,
        createdAt: u.createdAt,
      })),
    }
  }

  if (name === 'jobs') {
    return {
      items: jobs
        .filter(j => !store.data.deleted.jobs.includes(j.id))
        .map(j => ({
          ...j,
          ...(store.data.overrides.jobs[j.id] ?? {}),
          status: (store.data.overrides.jobs[j.id]?.status as string) ?? 'open',
        })),
    }
  }

  if (name === 'spots') {
    return {
      items: (photoSpots as PhotoSpot[])
        .filter(s => !store.data.deleted.spots.includes(s.id))
        .map(s => ({
          ...s,
          ...(store.data.overrides.spots[s.id] ?? {}),
          hidden: store.data.overrides.spots[s.id]?.hidden === true,
          featured: store.data.overrides.spots[s.id]?.featured === true,
        })),
    }
  }

  if (name === 'services') {
    return { items: mergedServices().map(s => ({ ...s, visible: store.data.deleted.services.includes(s.id) ? false : store.data.overrides.services[s.id]?.visible !== false })) }
  }

  // store-mode
  return { items: collectionItems(name) }
})
