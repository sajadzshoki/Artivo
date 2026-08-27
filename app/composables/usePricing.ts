import type { PricingBundle } from '#shared/config/catalog'
import { defaultPricingBundle } from '#shared/config/catalog'
import { calculateEstimate } from '#shared/services/pricing'

// ─────────────────────────────────────────────────────────────
// usePricing · تنها منبع قیمت برای UI
// کانفیگ از سرور می‌آید (GET /api/pricing/config) تا ادمین بدون
// تغییر کامپوننت‌ها قیمت‌ها را عوض کند؛ تا رسیدن پاسخ، باندل
// پیش‌فرض repo پایه است (بدون پرش عدد در SSR).
// محاسبه فقط در موتور مرکزی calculateEstimate انجام می‌شود.
// ─────────────────────────────────────────────────────────────
export function usePricing() {
  const { state } = useProjectRequest()

  const { data: bundle } = useFetch<PricingBundle>('/api/pricing/config', {
    key: 'artivo-pricing-bundle',
    default: defaultPricingBundle,
  })

  const config = computed(() => bundle.value.pricing)
  const catalog = computed(() => bundle.value.catalog)
  const estimate = computed(() => calculateEstimate(state.value, config.value))

  return { estimate, config, catalog }
}
