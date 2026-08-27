import type { UserRole } from '#shared/types'
import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'
import { requireUser, toPublicUser } from '../../utils/auth'
import { store } from '../../utils/store'
import { bad, readJson, str, strArray } from '../../utils/validate'

// PUT /api/auth/profile — ویرایش حساب: نام، ایمیل، موبایل، نقش‌ها، پروفایل کارفرما
export default defineEventHandler(async (event) => {
  const user = requireUser(event)
  const body = await readJson(event)

  if (body.name !== undefined) {
    const name = str(body.name)
    if (name.length < 3) bad('نام باید حداقل ۳ کاراکتر باشد.', 'name')
    user.name = name
  }

  if (body.email !== undefined) {
    const email = str(body.email).toLowerCase()
    if (email && !isValidEmail(email)) bad('ایمیل معتبر نیست.', 'email')
    if (email && store.data.users.some(u => u.id !== user.id && u.email.toLowerCase() === email)) {
      bad('این ایمیل برای حساب دیگری ثبت شده است.', 'email')
    }
    user.email = email
  }

  if (body.mobile !== undefined) {
    const mobile = normalizeMobile(str(body.mobile))
    if (!isValidMobile(mobile)) bad('شماره موبایل معتبر نیست.', 'mobile')
    if (store.data.users.some(u => u.id !== user.id && u.mobile === mobile)) {
      bad('این شماره برای حساب دیگری ثبت شده است.', 'mobile')
    }
    if (mobile !== user.mobile) user.mobileVerified = false
    user.mobile = mobile
  }

  if (body.roles !== undefined) {
    const roles = strArray(body.roles, 3).filter(r => r === 'client' || r === 'creative')
    if (!roles.length) bad('حداقل یک نقش لازم است.', 'roles')
    // نقش ادمین فقط از پنل ادمین/سرور تغییر می‌کند
    const isAdmin = user.roles.includes('admin')
    user.roles = [...new Set<UserRole>([...roles, ...(isAdmin ? ['admin' as const] : [])])]
  }

  if (body.clientProfile !== undefined && typeof body.clientProfile === 'object') {
    const cp = body.clientProfile as Record<string, unknown>
    user.clientProfile = {
      brandName: str(cp.brandName).slice(0, 60),
      city: str(cp.city).slice(0, 40),
      website: str(cp.website).slice(0, 120),
      bio: str(cp.bio).slice(0, 500),
      preferredCategories: strArray(cp.preferredCategories, 12),
    }
  }

  store.save()
  return { user: toPublicUser(user) }
})
