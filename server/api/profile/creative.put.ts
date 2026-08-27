import type { Creative, CreativeKind, ServiceCategory } from '#shared/types'
import { serviceCategoryLabels } from '#shared/config/service-categories'
import { creativesById } from '#shared/data/portfolio'
import { requireUser } from '../../utils/auth'
import { store } from '../../utils/store'
import { bad, num, readJson, str, strArray } from '../../utils/validate'

// PUT /api/profile/creative — ویرایش پروفایل خلاقِ پیوند‌شده
// seed → وصله روی داده‌ی استاتیک (creativeOverrides) · community → ویرایش مستقیم
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  if (!user.creativeId) bad('اول پروفایل خلاق بساز.')

  const body = await readJson(event)
  const patch: Record<string, unknown> = {}

  if (body.kind !== undefined) {
    const kind = str(body.kind) as CreativeKind
    if (kind !== 'designer' && kind !== 'photographer') bad('نوع خلاق نامعتبر است.', 'kind')
    patch.kind = kind
  }
  if (body.role !== undefined) {
    const role = str(body.role).slice(0, 60)
    if (role.length < 2) bad('عنوان نقش را بنویس.', 'role')
    patch.role = role
  }
  if (body.city !== undefined) {
    const city = str(body.city).slice(0, 40)
    if (!city) bad('شهر را بنویس.', 'city')
    patch.city = city
  }
  if (body.categories !== undefined) {
    const categories = strArray(body.categories, 8).filter(c => c in serviceCategoryLabels) as ServiceCategory[]
    if (!categories.length) bad('حداقل یک دسته انتخاب کن.', 'categories')
    patch.categories = categories
  }
  if (body.startingPrice !== undefined) {
    const p = num(body.startingPrice)
    if (!Number.isFinite(p) || p < 0) bad('قیمت شروع معتبر نیست.', 'startingPrice')
    patch.startingPrice = p
  }
  if (body.experienceYears !== undefined) {
    patch.experienceYears = Math.min(50, Math.max(0, num(body.experienceYears) || 0))
  }
  if (body.bio !== undefined) {
    const bio = str(body.bio).slice(0, 700)
    if (bio.length < 30) bad('بیو حداقل ۳۰ کاراکتر باشد.', 'bio')
    patch.bio = bio
  }
  if (body.skills !== undefined) patch.skills = strArray(body.skills, 10)

  const isSeed = creativesById().has(user.creativeId)
  if (isSeed) {
    store.data.overrides.creatives[user.creativeId] = {
      ...(store.data.overrides.creatives[user.creativeId] ?? {}),
      ...patch,
    }
    store.save()
    const merged = { ...creativesById().get(user.creativeId)!, ...(patch as Partial<Creative>) }
    return { profile: merged, source: 'seed' }
  }

  const community = store.data.communityCreatives.find(c => c.id === user.creativeId)
  if (!community) bad('پروفایل خلاق پیدا نشد؛ دوباره بساز.')
  Object.assign(community, patch)
  store.save()
  return { profile: community, source: 'community' }
})
