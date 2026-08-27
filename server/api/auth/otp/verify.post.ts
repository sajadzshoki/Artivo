import { isValidMobile, normalizeMobile } from '#shared/utils/format'
import { createSession, findUserByMobile, toPublicUser } from '../../../utils/auth'
import { newId } from '../../../utils/crypto'
import { OTP_MAX_ATTEMPTS } from '../../../utils/constants'
import { store } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

// POST /api/auth/otp/verify — بررسی کد
// purpose=login  → ورود (و ساخت خودکار حساب موبایل‌محور)
// purpose=reset  → صدور توکن بازیابی رمز
// purpose=verify → تأیید شماره‌ی کاربر نشست جاری
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const mobile = normalizeMobile(str(body.mobile))
  const code = str(body.code)
  const purpose = str(body.purpose)

  if (!isValidMobile(mobile)) bad('شماره موبایل معتبر نیست.', 'mobile')
  if (!/^\d{4}$/.test(code)) bad('کد ۴ رقمی را وارد کن.', 'code')
  if (!['login', 'reset', 'verify'].includes(purpose)) bad('هدف درخواست نامعتبر است.')

  const record = store.data.otps[mobile]
  if (!record || record.purpose !== purpose || record.exp < Date.now()) {
    bad('کد منقضی شده؛ دوباره درخواست بده.', 'code')
  }

  record.attempts += 1
  if (record.code !== code) {
    if (record.attempts >= OTP_MAX_ATTEMPTS) {
      delete store.data.otps[mobile]
      store.save()
      bad('کد اشتباه است؛ تعداد تلاش‌ها تمام شد. کد جدید بگیر.', 'code')
    }
    store.save()
    bad('کد اشتباه است.', 'code')
  }

  // موفق — کد مصرف شد
  delete store.data.otps[mobile]

  if (purpose === 'login') {
    let user = findUserByMobile(mobile)
    if (!user) {
      // ورود با OTP برای شماره‌ی ناشناس = ساخت خودکار حساب (بدون رمز)
      user = {
        id: newId('u'),
        name: `کاربر ${mobile.slice(-4)}`,
        email: '',
        mobile,
        passwordHash: null,
        roles: ['client'],
        mobileVerified: true,
        active: true,
        clientProfile: { brandName: '', city: '', website: '', bio: '', preferredCategories: [] },
        creativeId: null,
        createdAt: store.now(),
      }
      store.data.users.push(user)
    }
    if (!user.active) {
      throw createError({ statusCode: 403, message: 'این حساب غیرفعال شده؛ با پشتیبانی تماس بگیر.' })
    }
    user.mobileVerified = true
    createSession(event, user.id)
    store.save()
    return { ok: true, purpose, user: toPublicUser(user) }
  }

  if (purpose === 'reset') {
    const user = findUserByMobile(mobile)
    if (!user) bad('کاربری با این شماره پیدا نشد.', 'mobile')
    const token = newToken()
    store.data.resets[token] = { userId: user.id, exp: Date.now() + 10 * 60 * 1000 }
    store.save()
    return { ok: true, purpose, resetToken: token }
  }

  // verify — تأیید شماره‌ی کاربر وارد‌شده
  const sessionUser = store.data.users.find(u => u.mobile === mobile)
  if (!sessionUser) bad('کاربری با این شماره پیدا نشد.', 'mobile')
  sessionUser.mobileVerified = true
  store.save()
  return { ok: true, purpose, user: toPublicUser(sessionUser) }
})
