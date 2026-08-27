import type { ProjectTypeId, ServiceCategory } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// تاکسونومی سرویس‌ها — برچسب، آیکون و نگاشت به نوع پروژه‌ی ویزارد
// ─────────────────────────────────────────────────────────────

export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  poster: 'پوستر',
  logo: 'لوگو',
  social: 'سوشال مدیا',
  branding: 'برندینگ',
  packaging: 'بسته‌بندی',
  menu: 'منو و چاپ',
  ui: 'رابط کاربری',
  photoEdit: 'رتوش و ادیت',
  portrait: 'پرتره',
  product: 'عکاسی محصول',
  event: 'عکاسی مراسم',
  architecture: 'معماری و فضا',
}

export const serviceCategoryIcons: Record<ServiceCategory, string> = {
  poster: 'image',
  logo: 'pen',
  social: 'instagram',
  branding: 'layers',
  packaging: 'package',
  menu: 'coffee',
  ui: 'smartphone',
  photoEdit: 'sliders',
  portrait: 'user',
  product: 'aperture',
  event: 'calendar',
  architecture: 'compass',
}

/** نگاشت دسته‌ی سرویس به نوع پروژه در ویزارد درخواست */
export const serviceCategoryToProjectType: Record<ServiceCategory, ProjectTypeId> = {
  poster: 'poster',
  logo: 'logo',
  social: 'social',
  branding: 'branding',
  packaging: 'packaging',
  menu: 'menu',
  ui: 'ui',
  photoEdit: 'photoEdit',
  portrait: 'other',
  product: 'other',
  event: 'other',
  architecture: 'other',
}
