import type { PhotoSpot } from '#shared/types'
import { getAdminCollection } from '#shared/config/admin-collections'
import { creativeServices } from '#shared/data/services'
import { jobs } from '#shared/data/jobs'
import { photoSpots } from '#shared/data/spots'
import { requireAdmin } from '../../../../utils/auth'
import { collectionItems, store, type StoredUser } from '../../../../utils/store'
import { bad, num, readJson, str } from '../../../../utils/validate'

// PUT /api/admin/collections/[name]/[id] — ویرایش آیتم
export default defineEventHandler(async (event) => {
  const admin = requireAdmin(event)
  const name = getRouterParam(event, 'name') ?? ''
  const id = getRouterParam(event, 'id') ?? ''
  const def = getAdminCollection(name)
  if (!def) throw createError({ statusCode: 404, message: 'کالکشن ناشناس است.' })

  const body = await readJson(event)

  // ── users: نگاشت فیلدهای UI به مدل کاربر ──
  if (name === 'users') {
    const user = store.data.users.find(u => u.id === id)
    if (!user) throw createError({ statusCode: 404, message: 'کاربر پیدا نشد.' })
    if (body.name !== undefined) {
      const name2 = str(body.name)
      if (name2.length < 3) bad('نام باید حداقل ۳ کاراکتر باشد.', 'name')
      user.name = name2
    }
    if (body.email !== undefined) user.email = str(body.email).toLowerCase()
    if (body.mobile !== undefined) user.mobile = str(body.mobile)
    if (body.active !== undefined) {
      if (user.id === admin.id && body.active !== true) bad('نمی‌توانی حساب خودت را غیرفعال کنی.', 'active')
      user.active = body.active === true
    }
    if (body.roleAdmin !== undefined || body.roleClient !== undefined || body.roleCreative !== undefined) {
      const wants = {
        admin: body.roleAdmin === true,
        client: body.roleClient === true,
        creative: body.roleCreative === true,
      }
      if (!wants.admin && !wants.client && !wants.creative) bad('حداقل یک نقش لازم است.', 'roleClient')
      if (user.id === admin.id && !wants.admin) bad('نمی‌توانی نقش مدیر را از خودت بگیری.', 'roleAdmin')
      user.roles = [
        ...(wants.client ? ['client' as const] : []),
        ...(wants.creative ? ['creative' as const] : []),
        ...(wants.admin ? ['admin' as const] : []),
      ]
    }
    store.save()
    return { ok: true }
  }

  // ── jobs: وصله روی داده‌ی استاتیک ──
  if (name === 'jobs') {
    if (!jobs.some(j => j.id === id)) throw createError({ statusCode: 404, message: 'پروژه پیدا نشد.' })
    const patch: Record<string, unknown> = { ...(store.data.overrides.jobs[id] ?? {}) }
    if (body.title !== undefined) {
      const title = str(body.title)
      if (title.length < 3) bad('عنوان کوتاه است.', 'title')
      patch.title = title
    }
    if (body.status !== undefined) {
      if (!['open', 'paused', 'closed'].includes(str(body.status))) bad('وضعیت نامعتبر است.', 'status')
      patch.status = str(body.status)
    }
    if (body.urgent !== undefined) patch.urgent = body.urgent === true
    store.data.overrides.jobs[id] = patch
    store.save()
    return { ok: true }
  }

  // ── spots: وصله روی داده‌ی استاتیک ──
  if (name === 'spots') {
    if (!(photoSpots as PhotoSpot[]).some(s => s.id === id)) {
      throw createError({ statusCode: 404, message: 'لوکیشن پیدا نشد.' })
    }
    const patch: Record<string, unknown> = { ...(store.data.overrides.spots[id] ?? {}) }
    if (body.name !== undefined) {
      const n = str(body.name)
      if (n.length < 2) bad('نام کوتاه است.', 'name')
      patch.name = n
    }
    if (body.city !== undefined) patch.city = str(body.city)
    if (body.bestTime !== undefined) patch.bestTime = str(body.bestTime)
    if (body.hidden !== undefined) patch.hidden = body.hidden === true
    if (body.featured !== undefined) patch.featured = body.featured === true
    store.data.overrides.spots[id] = patch
    store.save()
    return { ok: true }
  }

  // ── services: ساخته‌شده‌ها مستقیم، استاتیک‌ها با وصله ──
  if (name === 'services') {
    const created = collectionItems('services-created').find(x => x.id === id)
    if (created) {
      if (body.title !== undefined) {
        const t = str(body.title)
        if (t.length < 3) bad('عنوان کوتاه است.', 'title')
        created.title = t
      }
      if (body.description !== undefined) created.description = str(body.description)
      if (body.startingPrice !== undefined) {
        const p = num(body.startingPrice)
        if (!Number.isFinite(p) || p < 0) bad('قیمت معتبر نیست.', 'startingPrice')
        created.startingPrice = Math.round(p)
      }
      if (body.visible !== undefined) created.visible = body.visible === true
      store.save()
      return { ok: true }
    }
    if (!creativeServices.some(s => s.id === id)) {
      throw createError({ statusCode: 404, message: 'سرویس پیدا نشد.' })
    }
    const patch: Record<string, unknown> = { ...(store.data.overrides.services[id] ?? {}) }
    if (body.title !== undefined) {
      const t = str(body.title)
      if (t.length < 3) bad('عنوان کوتاه است.', 'title')
      patch.title = t
    }
    if (body.description !== undefined) patch.description = str(body.description)
    if (body.startingPrice !== undefined) {
      const p = num(body.startingPrice)
      if (!Number.isFinite(p) || p < 0) bad('قیمت معتبر نیست.', 'startingPrice')
      patch.startingPrice = Math.round(p)
    }
    if (body.visible !== undefined) patch.visible = body.visible === true
    store.data.overrides.services[id] = patch
    store.save()
    return { ok: true }
  }

  // ── store-mode عمومی (فونت‌پک، پالت، تاکسونومی‌ها) ──
  const items = collectionItems(name)
  const item = items.find(x => x.id === id)
  if (!item) throw createError({ statusCode: 404, message: 'آیتم پیدا نشد.' })
  for (const f of def.fields) {
    if (f.key === 'id') continue
    if (body[f.key] !== undefined) item[f.key] = body[f.key]
  }
  store.save()
  return { ok: true }
})
