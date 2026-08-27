import type {
  EstimateLine,
  PriceEstimate,
  PricingConfig,
  ProjectTypeId,
  ProjectRequestState,
} from '#shared/types'
import { customAreaTiers, pricingConfig } from '#shared/config/pricing'

// Re-export برای راحتی مصرف‌کننده‌ها
export { pricingConfig, customAreaTiers }
import { sizeConfigs } from '#shared/config/project-types'

// ─────────────────────────────────────────────────────────────
// موتور برآورد قیمت — تنها نقطه‌ی محاسبه‌ی قیمت در کل اپلیکیشن.
// کامپوننت‌ها فقط خروجی این سرویس را نمایش می‌دهند؛ قواعد قیمت
// کاملاً از PricingConfig (به‌زودی از پنل ادمین) تغذیه می‌شود.
// ─────────────────────────────────────────────────────────────

const PM = (n: number) => Math.max(10_000, Math.round(n / 10_000) * 10_000)

/** ضریب ابعاد سفارشی بر اساس مساحت */
export function customAreaMultiplier(width: number, height: number, unit: 'cm' | 'px'): number {
  const w = unit === 'px' ? width / 37.8 : width
  const h = unit === 'px' ? height / 37.8 : height
  const area = Math.max(0, w * h)
  return customAreaTiers.find(t => area <= t.maxArea)?.multiplier ?? 1
}

export function getSizeMultiplier(
  state: ProjectRequestState['size'],
  typeId: ProjectTypeId,
  sizeOverrides?: Record<string, number>,
): { factor: number; detail: string } {
  const cfg = sizeConfigs[typeId]
  if (state.presetId) {
    const preset = cfg.presets.find(p => p.id === state.presetId)
    if (preset) {
      // ضریبِ ادمین (در صورت وجود) بر پریست استاتیک برتری دارد
      const factor = sizeOverrides?.[preset.id] ?? preset.multiplier
      return { factor, detail: preset.label }
    }
  }
  if (state.custom.width && state.custom.height) {
    const f = customAreaMultiplier(state.custom.width, state.custom.height, state.custom.unit)
    return { factor: f, detail: `ابعاد سفارشی ${state.custom.width}×${state.custom.height}` }
  }
  return { factor: 1, detail: 'پیش‌فرض' }
}

/** پریست‌های سایز با اعمال ضرایب ادمین — برای نمایش در گام اندازه */
export function effectiveSizePresets(typeId: ProjectTypeId, sizeOverrides?: Record<string, number>) {
  return sizeConfigs[typeId].presets.map(p => ({
    ...p,
    multiplier: sizeOverrides?.[p.id] ?? p.multiplier,
  }))
}

export function calculateEstimate(
  state: ProjectRequestState,
  config: PricingConfig = pricingConfig,
): PriceEstimate {
  const lines: EstimateLine[] = []
  if (!state.type) {
    return { total: 0, base: 0, lines, minimumApplied: false }
  }

  const base = config.basePrices[state.type]
  lines.push({ id: 'base', label: 'قیمت پایه', detail: 'طبق نوع پروژه', amount: base, kind: 'base' })

  const size = getSizeMultiplier(state.size, state.type, config.sizePresetMultipliers)
  if (size.factor !== 1) {
    lines.push({ id: 'size', label: 'اندازه و فرمت', detail: `${size.detail} · ضریب`, factor: size.factor, kind: 'multiplier' })
  }

  const complexity = config.complexityMultipliers[state.budget.complexityId] ?? 1
  if (complexity !== 1) {
    const opt = config.complexityOptions.find(o => o.id === state.budget.complexityId)
    lines.push({ id: 'complexity', label: 'سطح پیچیدگی', detail: `${opt?.label ?? ''} · ضریب`, factor: complexity, kind: 'multiplier' })
  }

  const urgency = config.urgencyOptions.find(o => o.id === state.budget.urgencyId)
    ?? config.urgencyOptions.find(o => o.id === config.defaultUrgencyId)!
  if (urgency.multiplier !== 1) {
    lines.push({ id: 'urgency', label: 'تحویل فوری', detail: `${urgency.label} · ضریب`, factor: urgency.multiplier, kind: 'multiplier' })
  }

  let subtotal = base * size.factor * complexity * urgency.multiplier

  for (const id of state.budget.addOnIds) {
    const addOn = config.addOns.find(a => a.id === id)
    if (addOn) {
      subtotal += addOn.price
      lines.push({ id: `addon-${addOn.id}`, label: addOn.label, amount: addOn.price, kind: 'addon' })
    }
  }

  let minimumApplied = false
  if (subtotal < config.minimumPrice) {
    lines.push({ id: 'minimum', label: 'حداقل مبلغ پروژه', amount: config.minimumPrice - subtotal, kind: 'minimum' })
    subtotal = config.minimumPrice
    minimumApplied = true
  }

  return { total: PM(subtotal), base, lines, minimumApplied }
}
