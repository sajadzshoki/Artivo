// ─────────────────────────────────────────────────────────────
// ابزارهای فرمت فارسی (اعداد، تاریخ، ارز)
// ─────────────────────────────────────────────────────────────

const faNumber = new Intl.NumberFormat('fa-IR')

/** ۱۲۳۴۵۶۷ */
export function faDigits(value: number | string): string {
  if (typeof value === 'number') return faNumber.format(value)
  return value.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)] ?? d)
}

/** ۳٬۵۰۰٬۰۰۰ تومان */
export function formatToman(value: number): string {
  return `${faNumber.format(value)} تومان`
}

/** ۳٫۵ میلیون تومان — برای فضاهای کم */
export function formatTomanCompact(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000
    const text = Number.isInteger(m) ? faNumber.format(m) : new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(m)
    return `${text} میلیون تومان`
  }
  if (value >= 1_000) return `${faNumber.format(Math.round(value / 1000))} هزار تومان`
  return formatToman(value)
}

/** تاریخ شمسی خوانا */
export function formatFaDate(date: Date): string {
  return new Intl.DateTimeFormat('fa-IR', { dateStyle: 'long' }).format(date)
}

/** «۳ روز دیگر — ۵ شهریور ۱۴۰۵» */
export function deadlineLabel(days: number | null): string {
  if (days == null) return 'انعطاف‌پذیر'
  const d = new Date(Date.now() + days * 86_400_000)
  return `تا ${faDigits(days)} روز دیگر · ${formatFaDate(d)}`
}

export function fileSizeLabel(bytes: number): string {
  if (bytes >= 1_048_576) return `${new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 1 }).format(bytes / 1_048_576)} مگابایت`
  return `${faDigits(Math.max(1, Math.round(bytes / 1024)))} کیلوبایت`
}

const faToEn = (s: string) => s.replace(/[۰-۹]/g, d => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d))).replace(/[٠-٩]/g, d => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

/** تبدیل ارقام فارسی/عربی به لاتین — برای فیلدهای عددی */
export function toEnDigits(s: string): string {
  return faToEn(s)
}

/** نرمال‌سازی موبایل ایران به شکل 09xxxxxxxxx */
export function normalizeMobile(input: string): string {
  let v = faToEn(input).replace(/[\s-()]/g, '')
  if (v.startsWith('+98')) v = `0${v.slice(3)}`
  else if (v.startsWith('0098')) v = `0${v.slice(4)}`
  else if (v.startsWith('98') && v.length === 12) v = `0${v.slice(2)}`
  else if (v.startsWith('9') && v.length === 10) v = `0${v}`
  return v
}

export function isValidMobile(input: string): boolean {
  return /^09\d{9}$/.test(normalizeMobile(input))
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim())
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}
