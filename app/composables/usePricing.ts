import { calculateEstimate, pricingConfig } from '#shared/services/pricing'

// ─────────────────────────────────────────────────────────────
// usePricing · خواندن برآورد قیمت از سرویس مرکزی
// هیچ کامپوننتی مستقیماً قیمت محاسبه نمی‌کند.
// ─────────────────────────────────────────────────────────────
export function usePricing() {
  const { state } = useProjectRequest()
  const estimate = computed(() => calculateEstimate(state.value))
  return { estimate, config: pricingConfig }
}
