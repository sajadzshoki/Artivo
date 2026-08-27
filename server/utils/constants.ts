// ─────────────────────────────────────────────────────────────
// constants · مقادیر مشترک لایه‌ی سرور
// ─────────────────────────────────────────────────────────────

export const SESSION_COOKIE = 'artivo_session'
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000 // ۳۰ روز

/** مهلت اعتبار کد OTP */
export const OTP_TTL_MS = 2 * 60 * 1000
/** حداقل فاصله بین دو ارسال */
export const OTP_RESEND_MS = 45 * 1000
/** حداکثر تلاش برای هر کد */
export const OTP_MAX_ATTEMPTS = 5

/** مهلت توکن بازیابی رمز */
export const RESET_TTL_MS = 10 * 60 * 1000
