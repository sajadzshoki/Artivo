import type { SpotCategoryId } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// دسته‌بندی لوکیشن‌های عکاسی (نوع عکاسی)
// ─────────────────────────────────────────────────────────────

export const spotCategoryLabels: Record<SpotCategoryId, string> = {
  portrait: 'پرتره',
  landscape: 'منظره',
  street: 'خیابانی',
  architecture: 'معماری',
  nature: 'طبیعت',
  sunset: 'غروب',
  night: 'شب',
  product: 'محصول',
  fashion: 'مد و فشن',
  wedding: 'عروسی',
}

export const spotCategoryIcons: Record<SpotCategoryId, string> = {
  portrait: 'user',
  landscape: 'map',
  street: 'compass',
  architecture: 'layers',
  nature: 'sparkles',
  sunset: 'clock',
  night: 'eye',
  product: 'package',
  fashion: 'palette',
  wedding: 'heart',
}

export const spotCategories = (Object.keys(spotCategoryLabels) as SpotCategoryId[])
  .map(id => ({ id, label: spotCategoryLabels[id] }))

/** پریست‌های «بهترین زمان نور» */
export const bestTimePresets = [
  'ساعت طلایی صبح',
  'ساعت طلایی غروب',
  'صبح زود',
  'غروب',
  'شب',
  'بعد از باران',
]
