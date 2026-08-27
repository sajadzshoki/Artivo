import { isValidEmail, isValidMobile, normalizeMobile } from '#shared/utils/format'
import { findUserByEmail, findUserByMobile } from '../../../utils/auth'
import { RESET_TTL_MS } from '../../../utils/constants'
import { sendOtpCode } from '../../../utils/kavenegar'
import { store } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

// POST /api/auth/password/forgot
//  - موبایل: مثل ورود OTP کد می‌فرستد (purpose=reset) → verify → توکن
//  - ایمیل: بدون سرویس ایمیل، فقط در توسعه توکن نمایشی برمی‌گردد
//    (production: پیام عمومی «اگر حساب وجود داشته باشد…»)
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const email = str(body.email).toLowerCase()
  const mobileRaw = str(body.mobile)

  if (mobileRaw) {
    const mobile = normalizeMobile(mobileRaw)
    if (!isValidMobile(mobile)) bad('شماره موبایل معتبر نیست.', 'mobile')
    const user = findUserByMobile(mobile)
    if (!user) bad('کاربری با این شماره پیدا نشد.', 'mobile')

    const isDev = process.env.NODE_ENV !== 'production'
    const code = isDev ? '1111' : String(Math.floor(1000 + Math.random() * 9000))
    store.data.otps[mobile] = {
      code,
      purpose: 'reset',
      exp: Date.now() + 2 * 60 * 1000,
      attempts: 0,
      lastSent: Date.now(),
    }
    await sendOtpCode(mobile, code)
    store.save()
    return { ok: true, via: 'mobile', ttl: 120 }
  }

  if (email) {
    if (!isValidEmail(email)) bad('ایمیل معتبر نیست.', 'email')
    const user = findUserByEmail(email)
    const isDev = process.env.NODE_ENV !== 'production'
    if (user && isDev) {
      // DEV-ONLY: بدون سرویس ایمیل، توکن بازیابی مستقیم برمی‌گردد
      const token = `dev-${user.id}-${Date.now().toString(36)}`
      store.data.resets[token] = { userId: user.id, exp: Date.now() + RESET_TTL_MS }
      store.save()
      return { ok: true, via: 'email', devToken: token }
    }
    // production: پیام عمومی — لو دادن وجود/عدم وجود حساب نداریم
    return { ok: true, via: 'email' }
  }

  bad('ایمیل یا شماره موبایل را وارد کن.')
})
