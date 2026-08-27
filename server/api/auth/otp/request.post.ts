import { randomInt } from 'node:crypto'
import { isValidMobile, normalizeMobile } from '#shared/utils/format'
import { findUserByMobile } from '../../../utils/auth'
import { OTP_RESEND_MS, OTP_TTL_MS } from '../../../utils/constants'
import { sendOtpCode } from '../../../utils/kavenegar'
import { store, type OtpRecord } from '../../../utils/store'
import { bad, readJson, str } from '../../../utils/validate'

// POST /api/auth/otp/request — ارسال کد یک‌بارمصرف
// production: کاوه‌نگار · development: کد ثابت 1111 (فقط dev)
export default defineEventHandler(async (event) => {
  const body = await readJson(event)
  const mobile = normalizeMobile(str(body.mobile))
  const purpose = str(body.purpose) as OtpRecord['purpose']

  if (!isValidMobile(mobile)) bad('شماره موبایل معتبر نیست.', 'mobile')
  if (!['login', 'reset', 'verify'].includes(purpose)) bad('هدف درخواست نامعتبر است.')
  if (purpose === 'reset' && !findUserByMobile(mobile)) {
    bad('کاربری با این شماره پیدا نشد؛ ثبت‌نام کن یا با شماره دیگری وارد شو.', 'mobile')
  }

  const existing = store.data.otps[mobile]
  if (existing && Date.now() - existing.lastSent < OTP_RESEND_MS) {
    const wait = Math.ceil((existing.lastSent + OTP_RESEND_MS - Date.now()) / 1000)
    throw createError({ statusCode: 429, message: `کمی صبر کن؛ ${wait} ثانیه بعد دوباره تلاش کن.`, data: { wait } })
  }

  // ⚠️ DEV-ONLY: کد ثابت ۱۱۱۱ فقط در توسعه. production از مسیر
  // randomInt می‌رود و ارسال واقعی با کاوه‌نگار انجام می‌شود.
  const isDev = process.env.NODE_ENV !== 'production'
  const code = isDev ? '1111' : String(randomInt(1000, 10000))

  store.data.otps[mobile] = {
    code,
    purpose,
    exp: Date.now() + OTP_TTL_MS,
    attempts: 0,
    lastSent: Date.now(),
  }

  const { dev } = await sendOtpCode(mobile, code)
  store.save()
  return { ok: true, ttl: OTP_TTL_MS / 1000, dev }
})
