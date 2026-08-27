import type { PublicOverlay } from '#shared/types'
import { creativeServices } from '#shared/data/services'
import { creatives } from '#shared/data/content'

// ─────────────────────────────────────────────────────────────
// useOverlay · هم‌پوشانی عمومی داده‌ی استاتیک
// تغییرات ادمین (وضعیت پروژه‌ها، مخفی/ویژه‌ی لوکیشن‌ها، سرویس‌ها)
// و پروفایل‌های جامعه‌ی خلاق‌ها از یک endpoint سبک می‌آید؛ یک بار
// fetch با کلید مشترک — هم SSR هم کلاینت.
// ─────────────────────────────────────────────────────────────

const emptyOverlay: PublicOverlay = {
  closedJobIds: [],
  deletedJobIds: [],
  hiddenSpotIds: [],
  featuredSpotIds: [],
  hiddenServiceIds: [],
  serviceOverrides: {},
  createdServices: [],
  communityCreatives: [],
  creativeOverrides: {},
  jobOverrides: {},
  spotOverrides: {},
  taxonomies: {},
}

export function useOverlay() {
  const { data: overlay } = useFetch<PublicOverlay>('/api/public/overlay', {
    key: 'artivo-overlay',
    default: () => emptyOverlay,
  })

  /** سرویس‌های ادغام‌شده: استاتیک وصله‌خورده + ساخته‌شده‌های ادمین، بدون مخفی‌ها */
  const services = computed(() => {
    const o = overlay.value
    const statics = creativeServices
      .filter(s => !o.hiddenServiceIds.includes(s.id))
      .map(s => ({ ...s, ...(o.serviceOverrides[s.id] ?? {}) }))
    const created = (o.createdServices ?? [])
      .filter(s => !o.hiddenServiceIds.includes(s.id))
      .map(s => ({ ...s, ...(o.serviceOverrides[s.id] ?? {}) }))
    return [...created, ...statics]
  })

  function serviceById(id: string) {
    return services.value.find(s => s.id === id)
  }

  /** خلاق‌ها: استاتیک با وصله + پروفایل‌های جامعه */
  const allCreatives = computed(() => {
    const o = overlay.value
    const patched = creatives.map(c => ({ ...c, ...(o.creativeOverrides[c.id] ?? {}) }))
    return [...o.communityCreatives, ...patched]
  })

  function creativeById(id: string) {
    return allCreatives.value.find(c => c.id === id)
  }

  return { overlay, services, serviceById, allCreatives, creativeById }
}
