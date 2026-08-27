import type { PricingConfig } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// کانفیگ مرکزی قیمت‌گذاری
// ⚠️ هیچ کامپوننتی قیمت هاردکد ندارد؛ همه از این فایل و از
// shared/services/pricing.ts می‌خوانند. در فازهای بعد این آبجکت
// از پنل ادمین تغذیه می‌شود (شکل دیتا عمداً شبیه داکیومنت دیتابیس است).
// ─────────────────────────────────────────────────────────────

export const pricingConfig: PricingConfig = {
  currency: 'تومان',
  minimumPrice: 500_000,

  // قیمت پایه‌ی هر نوع پروژه (تومان)
  basePrices: {
    poster: 1_800_000,
    social: 900_000,
    menu: 1_400_000,
    ad: 1_200_000,
    logo: 3_500_000,
    branding: 8_000_000,
    packaging: 4_500_000,
    ui: 12_000_000,
    photoEdit: 600_000,
    other: 1_500_000,
  },

  defaultComplexityId: 'standard',
  complexityOptions: [
    { id: 'simple', label: 'ساده', hint: 'یک کانسپت، اصلاحات کم', multiplier: 0.85 },
    { id: 'standard', label: 'استاندارد', hint: 'تعادل کیفیت و هزینه', multiplier: 1 },
    { id: 'complex', label: 'پیچیده', hint: 'کانسپت‌های متعدد و جزئیات زیاد', multiplier: 1.35 },
  ],
  complexityMultipliers: {
    simple: 0.85,
    standard: 1,
    complex: 1.35,
  },

  defaultUrgencyId: 'normal',
  urgencyOptions: [
    { id: 'normal', label: 'عادی', hint: '۱۰ تا ۱۴ روز کاری', multiplier: 1 },
    { id: 'fast', label: 'سریع', hint: '۳ تا ۷ روز کاری', multiplier: 1.25 },
    { id: 'rush', label: 'فوری', hint: 'تا ۴۸ ساعت', multiplier: 1.6 },
  ],

  addOns: [
    { id: 'source-file', label: 'فایل باز و لایه‌بندی‌شده', description: 'تحویل فایل قابل‌ویرایش پروژه', price: 400_000 },
    { id: 'copywriting', label: 'کپی‌رایتینگ متن', description: 'نوشتن متن تبلیغاتی توسط متخصص', price: 350_000 },
    { id: 'icon-set', label: 'ست آیکون اختصاصی', description: 'تا ۱۲ آیکون هم‌خانواده با پروژه', price: 600_000 },
    { id: 'social-pack', label: 'برش‌های شبکه‌های اجتماعی', description: 'خروجی برای استوری، پست و کاور', price: 500_000 },
    { id: 'extra-revisions', label: '۲ نوبت اصلاحیه‌ی اضافه', description: 'پروژه شامل ۲ نوبت اصلاحیه است', price: 500_000 },
    { id: 'print-ready', label: 'آماده‌سازی چاپ', description: 'CMYK، خط برش و هماهنگی با چاپخانه', price: 250_000 },
  ],

  customMaxRatio: 5,
}

/** پله‌های ضریب ابعاد سفارشی بر اساس مساحت (سانتی‌متر مربع) */
export const customAreaTiers: { maxArea: number; multiplier: number }[] = [
  { maxArea: 625, multiplier: 1 },
  { maxArea: 2500, multiplier: 1.3 },
  { maxArea: 6500, multiplier: 1.7 },
  { maxArea: 15000, multiplier: 2.2 },
  { maxArea: Infinity, multiplier: 2.8 },
]

/** تعداد نوبت اصلاحیه‌ی پیش‌فرض هر پروژه (فقط برای نمایش) */
export const includedRevisions = 2
