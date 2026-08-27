import type { Creative, CreativeKind, ServiceCategory } from '#shared/types'
import { serviceCategoryLabels } from '#shared/config/service-categories'
import { creativeKindLabels } from '#shared/types'
import { requireUser, toPublicUser } from '../../utils/auth'
import { newId } from '../../utils/crypto'
import { store } from '../../utils/store'
import { bad, num, readJson, str, strArray } from '../../utils/validate'

// POST /api/profile/creative — ساخت پروفایل خلاق برای کاربر (بدون پیوند قبلی)
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  if (user.creativeId) bad('از قبل پروفایل خلاق داری؛ از ویرایش استفاده کن.')

  const body = await readJson(event)
  const kind = str(body.kind) as CreativeKind
  if (kind !== 'designer' && kind !== 'photographer') bad('نوع خلاق را انتخاب کن.', 'kind')

  const role = str(body.role).slice(0, 60)
  if (role.length < 2) bad('عنوان نقش را بنویس (مثلاً طراح پوستر).', 'role')

  const city = str(body.city).slice(0, 40)
  if (!city) bad('شهر را انتخاب کن.', 'city')

  const categories = strArray(body.categories, 8).filter(c => c in serviceCategoryLabels) as ServiceCategory[]
  if (!categories.length) bad('حداقل یک دسته انتخاب کن.', 'categories')

  const startingPrice = num(body.startingPrice)
  if (!Number.isFinite(startingPrice) || startingPrice < 0) bad('قیمت شروع معتبر نیست.', 'startingPrice')

  const experienceYears = Math.min(50, Math.max(0, num(body.experienceYears) || 0))
  const bio = str(body.bio).slice(0, 700)
  if (bio.length < 30) bad('بیو حداقل ۳۰ کاراکتر باشد تا در فهرست خلاق‌ها خوب دیده شوی.', 'bio')

  const creative: Creative = {
    id: newId('u'),
    name: user.name,
    kind,
    role,
    city,
    rating: 0,
    projectsDone: 0,
    startingPrice,
    skills: strArray(body.skills, 10),
    categories,
    bio,
    experienceYears,
    experience: [],
    languages: ['فارسی'],
    avatar: '',
    accent: kind === 'photographer' ? '#2E6F5E' : '#4B44DC',
    responseTime: 'معمولاً در طول روز',
    memberSince: new Intl.DateTimeFormat('fa-IR', { year: 'numeric' }).format(new Date()),
  }

  store.data.communityCreatives.unshift(creative)
  user.creativeId = creative.id
  store.save()
  return { profile: creative, user: toPublicUser(user) }
})
