import type { AdminPricingRules } from '#shared/config/catalog'
import { projectTypes } from '#shared/config/project-types'
import { requireAdmin } from '../../utils/auth'
import { store } from '../../utils/store'
import { bad, num, readJson, str, strArray } from '../../utils/validate'

// PUT /api/admin/pricing — ذخیره‌ی قواعد موتور قیمت
// ادمین قیمت‌ها/ضرایب را عوض می‌کند؛ هیچ کامپوننتی تغییر نمی‌کند.
const knownTypeIds = new Set(projectTypes.map(t => t.id))
const clampFactor = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) bad('ضریب باید عددی بزرگ‌تر از صفر باشد.')
  if (n < 0.1 || n > 5) bad('ضریب باید بین ۰٫۱ تا ۵ باشد.')
  return n
}
const money = (n: number, label: string) => {
  if (!Number.isFinite(n) || n < 0) bad(`${label} نامعتبر است.`)
  if (n > 5_000_000_000) bad(`${label} بیش از حد بزرگ است.`)
  return Math.round(n)
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const body = await readJson(event)
  const raw = (body.rules && typeof body.rules === 'object') ? body.rules as Record<string, unknown> : {}

  // انواع پروژه — شناسه‌ها عضو union تایپ‌شده هستند (افزودن نوع جدید = تغییر کد)
  const typesRaw = Array.isArray(raw.projectTypes) ? raw.projectTypes : []
  if (!typesRaw.length) bad('حداقل یک نوع پروژه لازم است.')
  const seenIds = new Set<string>()
  const projectTypesOut = typesRaw.map((t) => {
    const o = (t ?? {}) as Record<string, unknown>
    const id = str(o.id)
    if (!knownTypeIds.has(id as never)) bad(`نوع پروژه‌ی ناشناس: ${id || '—'}`)
    if (seenIds.has(id)) bad(`نوع پروژه تکراری: ${id}`)
    seenIds.add(id)
    return {
      id,
      label: str(o.label) || id,
      tagline: str(o.tagline),
      icon: str(o.icon) || 'sparkles',
      basePrice: money(num(o.basePrice), `قیمت پایه‌ی ${id}`),
    }
  })
  for (const t of projectTypes) {
    if (!seenIds.has(t.id)) bad(`نوع پروژه‌ی ${t.id} نباید حذف شود.`)
  }

  const minimumPrice = money(num(raw.minimumPrice), 'حداقل مبلغ پروژه')

  const readOptionRows = (v: unknown, label: string) => {
    if (!Array.isArray(v) || !v.length) bad(`${label} نمی‌تواند خالی باشد.`)
    const ids = new Set<string>()
    return (v as Record<string, unknown>[]).map((o) => {
      const id = str(o.id)
      if (!id) bad(`${label}: شناسه خالی.`)
      if (ids.has(id)) bad(`${label}: شناسه تکراری ${id}.`)
      ids.add(id)
      return {
        id,
        label: str(o.label) || id,
        hint: str(o.hint),
        multiplier: clampFactor(num(o.multiplier)),
      }
    })
  }

  const complexityOptions = readOptionRows(raw.complexityOptions, 'سطوح پیچیدگی')
  const urgencyOptions = readOptionRows(raw.urgencyOptions, 'سطوح فوریت')

  const addOnsRaw = Array.isArray(raw.addOns) ? raw.addOns : []
  const addOnIds = new Set<string>()
  const addOns = (addOnsRaw as Record<string, unknown>[]).map((o) => {
    const id = str(o.id) || strArray([o.label]).join('')
    if (!id) bad('سرویس اختیاری بدون شناسه.')
    if (addOnIds.has(id)) bad(`سرویس اختیاری تکراری: ${id}`)
    addOnIds.add(id)
    return {
      id,
      label: str(o.label) || id,
      description: str(o.description),
      price: money(num(o.price), `قیمت «${str(o.label) || id}»`),
    }
  })

  const sizeRaw = (raw.sizePresetMultipliers && typeof raw.sizePresetMultipliers === 'object')
    ? raw.sizePresetMultipliers as Record<string, unknown>
    : {}
  const sizePresetMultipliers: Record<string, number> = {}
  for (const [k, v] of Object.entries(sizeRaw)) {
    if (v === '' || v === null || v === undefined) continue
    sizePresetMultipliers[k] = clampFactor(num(v))
  }

  const rules: AdminPricingRules = {
    projectTypes: projectTypesOut,
    minimumPrice,
    complexityOptions,
    urgencyOptions,
    addOns,
    sizePresetMultipliers,
  }

  store.data.adminPricing = rules
  store.save()
  return { ok: true, rules }
})
