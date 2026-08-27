import type { PricingConfig } from '#shared/types'
import type { ColorPalette, FontPairing } from '#shared/types'
import { pricingConfig } from './pricing'
import { projectTypes } from './project-types'
import { colorPalettes } from './palettes'
import { fontPairings } from './font-pairings'

// ─────────────────────────────────────────────────────────────
// کاتالوگ ویزارد — چیزی که سرور به کلاینت می‌فرستد تا ادمین
// بتواند گزینه‌ها را بدون تغییر کامپوننت‌ها مدیریت کند.
// پیش‌فرض = داده‌ی استاتیک repo؛ نسخه‌ی ذخیره‌شده‌ی ادمین بر آن
// برتری دارد (GET /api/pricing/config).
// ─────────────────────────────────────────────────────────────

export interface CatalogProjectType {
  id: string
  label: string
  tagline: string
  icon: string
  basePrice: number
}

export interface PricingBundle {
  pricing: PricingConfig
  catalog: {
    projectTypes: CatalogProjectType[]
    palettes: ColorPalette[]
    fontPairings: FontPairing[]
  }
}

export function defaultPricingBundle(): PricingBundle {
  return {
    pricing: pricingConfig,
    catalog: {
      projectTypes: projectTypes.map(t => ({
        id: t.id,
        label: t.label,
        tagline: t.tagline,
        icon: t.icon,
        basePrice: pricingConfig.basePrices[t.id],
      })),
      palettes: colorPalettes,
      fontPairings,
    },
  }
}

// ── قواعد قیمت‌گذاری — شکل دوستانه‌ی ادمین ──
// سرور این شکل را از ادمین می‌گیرد و به PricingConfig موتور تبدیل می‌کند.

export type AdminPricingRules = {
  projectTypes: CatalogProjectType[]
  minimumPrice: number
  complexityOptions: { id: string; label: string; hint: string; multiplier: number }[]
  urgencyOptions: { id: string; label: string; hint: string; multiplier: number }[]
  addOns: { id: string; label: string; description: string; price: number }[]
  sizePresetMultipliers: Record<string, number>
}

export function defaultAdminPricingRules(): AdminPricingRules {
  const bundle = defaultPricingBundle()
  return {
    projectTypes: bundle.catalog.projectTypes,
    minimumPrice: pricingConfig.minimumPrice,
    complexityOptions: pricingConfig.complexityOptions.map(o => ({
      id: o.id, label: o.label, hint: o.hint, multiplier: o.multiplier,
    })),
    urgencyOptions: pricingConfig.urgencyOptions.map(o => ({
      id: o.id, label: o.label, hint: o.hint, multiplier: o.multiplier,
    })),
    addOns: pricingConfig.addOns.map(a => ({
      id: a.id, label: a.label, description: a.description, price: a.price,
    })),
    sizePresetMultipliers: {},
  }
}

const clampFactor = (n: number) => Math.min(5, Math.max(0.1, n || 1))
const money10k = (n: number) => Math.max(0, Math.round((n || 0) / 10_000) * 10_000)

/** تبدیل قواعد ادمین → PricingConfig موتور قیمت */
export function rulesToPricingConfig(rules: AdminPricingRules): PricingConfig {
  const basePrices = { ...pricingConfig.basePrices } as PricingConfig['basePrices']
  for (const t of rules.projectTypes) {
    if (t.id in basePrices) basePrices[t.id as keyof typeof basePrices] = money10k(t.basePrice)
  }
  const complexityMultipliers: Record<string, number> = {}
  for (const o of rules.complexityOptions) complexityMultipliers[o.id] = clampFactor(o.multiplier)
  return {
    currency: pricingConfig.currency,
    minimumPrice: money10k(rules.minimumPrice),
    basePrices,
    complexityMultipliers,
    defaultUrgencyId: rules.urgencyOptions[0]?.id ?? pricingConfig.defaultUrgencyId,
    urgencyOptions: rules.urgencyOptions.map(o => ({
      id: o.id, label: o.label, hint: o.hint, multiplier: clampFactor(o.multiplier),
    })),
    defaultComplexityId: rules.complexityOptions.find(o => o.multiplier === 1)?.id
      ?? rules.complexityOptions[0]?.id
      ?? pricingConfig.defaultComplexityId,
    complexityOptions: rules.complexityOptions.map(o => ({
      id: o.id, label: o.label, hint: o.hint, multiplier: clampFactor(o.multiplier),
    })),
    addOns: rules.addOns.map(a => ({
      id: a.id, label: a.label, description: a.description, price: money10k(a.price),
    })),
    customMaxRatio: pricingConfig.customMaxRatio,
    sizePresetMultipliers: Object.fromEntries(
      Object.entries(rules.sizePresetMultipliers ?? {}).map(([k, v]) => [k, clampFactor(v)]),
    ),
  }
}

/** PricingConfig → شکل دوستانه‌ی ادمین (برای GET) */
export function pricingConfigToRules(cfg: PricingConfig, catalogTypes: CatalogProjectType[]): AdminPricingRules {
  return {
    projectTypes: catalogTypes.map(t => ({
      ...t,
      basePrice: cfg.basePrices[t.id as keyof typeof cfg.basePrices] ?? t.basePrice,
    })),
    minimumPrice: cfg.minimumPrice,
    complexityOptions: cfg.complexityOptions.map(o => ({ ...o })),
    urgencyOptions: cfg.urgencyOptions.map(o => ({ ...o })),
    addOns: cfg.addOns.map(a => ({ id: a.id, label: a.label, description: a.description, price: a.price })),
    sizePresetMultipliers: { ...(cfg.sizePresetMultipliers ?? {}) },
  }
}
