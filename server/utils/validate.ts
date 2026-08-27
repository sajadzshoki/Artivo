import type { H3Event } from 'h3'

// ─────────────────────────────────────────────────────────────
// validate · کمکی‌های اعتبارسنجی ورودی APIها
// خطا همیشه با فیلد مشخص برمی‌گردد تا فرم‌ها بتوانند زیر فیلد
// پیام بگذارند: { statusCode:400, data: { field, message } }
// ─────────────────────────────────────────────────────────────

export function bad(message: string, field?: string): never {
  throw createError({ statusCode: 400, message, data: { field } })
}

export function str(v: unknown): string {
  return typeof v === 'string' ? v.trim() : ''
}

export function num(v: unknown): number {
  const n = typeof v === 'number' ? v : Number(String(v ?? '').replace(/[^\d.-]/g, ''))
  return Number.isFinite(n) ? n : Number.NaN
}

export function bool(v: unknown): boolean {
  return v === true || v === 'true' || v === 1
}

export function strArray(v: unknown, max = 20): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string').map(s => s.trim()).filter(Boolean).slice(0, max)
}

export async function readJson(event: H3Event): Promise<Record<string, unknown>> {
  try {
    const body = await readBody(event)
    return (body && typeof body === 'object') ? body as Record<string, unknown> : {}
  }
  catch {
    return {}
  }
}

/** رمز عبور: حداقل ۸ کاراکتر، شامل حرف و رقم */
export function passwordError(pw: string): string | null {
  if (pw.length < 8) return 'رمز عبور حداقل ۸ کاراکتر باشد.'
  if (!/[A-Za-z]/.test(pw) || !/\d/.test(pw)) return 'رمز عبور باید هم حرف و هم رقم داشته باشد.'
  return null
}
