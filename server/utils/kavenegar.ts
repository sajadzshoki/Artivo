// ─────────────────────────────────────────────────────────────
// kavenegar · سرویس پیامک OTP
// تولید:  https://api.kavenegar.com/v1/{API-KEY}/verify/lookup.json
// پیکربندی کامل از env — هرگز کلید در کد هاردکد نمی‌شود:
//   NUXT_KAVENEGAR_API_KEY       (required در production)
//   NUXT_KAVENEGAR_OTP_TEMPLATE  (نام قالب تاییدشده در پنل کاوه‌نگار)
//   NUXT_KAVENEGAR_SENDER        (اختیاری — خط ارسال)
//
// ⚠️ حالت توسعه (NODE_ENV !== 'production'): کد همیشه «1111» است و
// هیچ تماسی به سرویس پیامک زده نمی‌شود. این مسیر فقط با `nuxt dev`
// فعال است؛ خروجی production (nuxt build) همیشه از کاوه‌نگار می‌گذرد.
// ─────────────────────────────────────────────────────────────

interface KavenegarResult {
  return: { status: number; message: string }
}

export async function sendOtpCode(mobile: string, code: string): Promise<{ dev: boolean }> {
  const isDev = process.env.NODE_ENV !== 'production'

  // ⚠️ DEV-ONLY — در build تولیدی هرگز اجرا نمی‌شود (شرط صریح بالا).
  if (isDev) {
    console.info(`[OTP] حالت توسعه — کد ${mobile}: ${code} (بدون ارسال واقعی)`)
    return { dev: true }
  }

  const config = useRuntimeConfig()
  const apiKey = config.kavenegarApiKey as string
  const template = config.kavenegarOtpTemplate as string
  const sender = config.kavenegarSender as string

  if (!apiKey || !template) {
    console.error('[OTP] production بدون NUXT_KAVENEGAR_API_KEY/TEMPLATE اجرا شده است.')
    throw createError({ statusCode: 500, message: 'سرویس پیامک پیکربندی نشده است؛ با پشتیبانی تماس بگیرید.' })
  }

  const params = new URLSearchParams({ receptor: mobile, token: code, template })
  if (sender) params.set('sender', sender)

  try {
    const res = await $fetch<KavenegarResult>(
      `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json?${params.toString()}`,
      { method: 'GET', timeout: 10_000 },
    )
    if (res?.return?.status !== 200) {
      throw new Error(res?.return?.message ?? 'unknown kavenegar error')
    }
    return { dev: false }
  }
  catch (err) {
    console.error('[OTP] kavenegar failed:', err)
    throw createError({ statusCode: 502, message: 'ارسال پیامک موفق نبود؛ چند لحظه بعد دوباره تلاش کن.' })
  }
}
