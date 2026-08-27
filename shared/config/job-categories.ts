import type { CreativeKind, JobCategoryId } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// تاکسونومی دسته‌بندی پروژه‌های باز + نگاشت به نوع خلاق
// ─────────────────────────────────────────────────────────────

export const jobCategoryLabels: Record<JobCategoryId, string> = {
  'graphic-design': 'طراحی گرافیک',
  logo: 'لوگو',
  poster: 'پوستر',
  social: 'سوشال مدیا',
  branding: 'برندینگ',
  packaging: 'بسته‌بندی',
  ui: 'رابط کاربری',
  illustration: 'تصویرسازی',
  'photo-editing': 'ادیت عکس',
  'product-photo': 'عکاسی محصول',
  'portrait-photo': 'پرتره',
  'event-photo': 'عکاسی مراسم',
  'commercial-photo': 'عکاسی تبلیغاتی',
  other: 'سایر',
}

export const jobCategoryIcons: Record<JobCategoryId, string> = {
  'graphic-design': 'shape',
  logo: 'pen',
  poster: 'image',
  social: 'instagram',
  branding: 'layers',
  packaging: 'package',
  ui: 'smartphone',
  illustration: 'palette',
  'photo-editing': 'sliders',
  'product-photo': 'aperture',
  'portrait-photo': 'user',
  'event-photo': 'calendar',
  'commercial-photo': 'camera',
  other: 'sparkles',
}

/** نوع خلاقِ هدف هر دسته — دسته‌های خاص در دیتای هر پروژه override می‌شوند */
export const jobCategoryKinds: Record<JobCategoryId, CreativeKind[]> = {
  'graphic-design': ['designer'],
  logo: ['designer'],
  poster: ['designer'],
  social: ['designer'],
  branding: ['designer'],
  packaging: ['designer'],
  ui: ['designer'],
  illustration: ['designer'],
  'photo-editing': ['photographer'],
  'product-photo': ['photographer'],
  'portrait-photo': ['photographer'],
  'event-photo': ['photographer'],
  'commercial-photo': ['photographer'],
  other: ['designer', 'photographer'],
}

export const workplaceLabels: Record<'remote' | 'onsite' | 'hybrid', string> = {
  remote: 'دورکاری',
  onsite: 'حضوری',
  hybrid: 'ترکیبی',
}

/** فهرست کامل دسته‌ها برای فیلترها */
export const jobCategories = (Object.keys(jobCategoryLabels) as JobCategoryId[])
  .map(id => ({ id, label: jobCategoryLabels[id] }))

/** پریست‌های بازه‌ی بودجه برای فیلتر */
export const budgetPresets = [
  { id: 'b1', label: 'تا ۳ میلیون', min: 0, max: 3_000_000 },
  { id: 'b2', label: '۳ تا ۱۰ میلیون', min: 3_000_000, max: 10_000_000 },
  { id: 'b3', label: '۱۰ تا ۲۵ میلیون', min: 10_000_000, max: 25_000_000 },
  { id: 'b4', label: 'بالای ۲۵ میلیون', min: 25_000_000, max: Number.POSITIVE_INFINITY },
] as const

/** پریست‌های مهلت تحویل برای فیلتر (روز) */
export const deliveryPresets = [
  { id: 'd1', label: 'تا ۳ روز', max: 3 },
  { id: 'd2', label: 'تا ۱ هفته', max: 7 },
  { id: 'd3', label: 'تا ۲ هفته', max: 14 },
  { id: 'd4', label: 'تا ۱ ماه', max: 30 },
] as const

export const jobSortOptions = [
  { value: 'newest', label: 'جدیدترین' },
  { value: 'budget-desc', label: 'بودجه: بیشترین' },
  { value: 'budget-asc', label: 'بودجه: کمترین' },
  { value: 'deadline', label: 'مهلت: نزدیک‌ترین' },
] as const
