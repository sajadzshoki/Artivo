import type { CreativeService, ServiceCategory } from '#shared/types'
import { getAdminCollection } from '#shared/config/admin-collections'
import { creatives } from '#shared/data/content'
import { serviceCategoryLabels } from '#shared/config/service-categories'
import { requireAdmin } from '../../../utils/auth'
import { newId } from '../../../utils/crypto'
import { collectionItems, store } from '../../../utils/store'
import { bad, num, readJson, str, strArray } from '../../../utils/validate'

// POST /api/admin/collections/[name] — ساخت آیتم تازه (فقط کالکشن‌های مجاز)
const LATIN_ID = /^[a-z0-9-]{2,40}$/

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const name = getRouterParam(event, 'name') ?? ''
  const def = getAdminCollection(name)
  if (!def) throw createError({ statusCode: 404, message: 'کالکشن ناشناس است.' })
  if (!def.canCreate) bad('برای این کالکشن ساخت آیتم ممکن نیست.')

  const body = await readJson(event)

  if (name === 'services') {
    const title = str(body.title)
    if (title.length < 3) bad('عنوان سرویس لازم است.', 'title')
    const creativeId = str(body.creativeId)
    if (!creatives.some(c => c.id === creativeId)) bad('خلاق منتخب نامعتبر است.', 'creativeId')
    const category = str(body.category) as ServiceCategory
    if (!(category in serviceCategoryLabels)) bad('دسته نامعتبر است.', 'category')
    const startingPrice = num(body.startingPrice)
    if (!Number.isFinite(startingPrice) || startingPrice < 0) bad('قیمت شروع معتبر نیست.', 'startingPrice')
    const service: CreativeService = {
      id: newId('sv'),
      creativeId,
      title,
      description: str(body.description).slice(0, 500),
      category,
      startingPrice: Math.round(startingPrice),
      deliveryDays: Math.min(120, Math.max(1, num(body.deliveryDays) || 7)),
      revisions: Math.min(10, Math.max(0, num(body.revisions) || 2)),
      features: strArray(body.features, 8),
      portfolioItemIds: [],
      popular: false,
    }
    collectionItems('services-created').unshift(service as unknown as Record<string, unknown>)
    store.save()
    return { item: service }
  }

  // store-mode عمومی
  const item: Record<string, unknown> = { ...body }
  if (name === 'project-categories' || name === 'photography-categories') {
    const id = str(body.id).toLowerCase()
    if (!LATIN_ID.test(id)) bad('شناسه باید ۲ تا ۴۰ حرف لاتین کوچک/رقم/خط تیره باشد.', 'id')
    if (collectionItems(name).some(x => x.id === id)) bad('این شناسه قبلاً استفاده شده است.', 'id')
    item.id = id
  }
  else {
    item.id = newId('c')
  }

  for (const f of def.fields.filter(f => f.required)) {
    const v = item[f.key]
    if (f.type === 'boolean') continue
    if (f.type === 'colors' || f.type === 'tags') {
      if (!Array.isArray(v) || !v.length) bad(`${f.label} لازم است.`, f.key)
      continue
    }
    if (v === undefined || v === null || String(v).trim() === '') bad(`${f.label} لازم است.`, f.key)
  }

  collectionItems(name).unshift(item)
  store.save()
  return { item }
})
