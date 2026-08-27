import type { ColorPalette } from '#shared/types'
import { colorPalettes } from '#shared/config/palettes'
import { fontPairings } from '#shared/config/font-pairings'
import { projectTypeMap, sizeConfigs } from '#shared/config/project-types'
import { pricingConfig } from '#shared/services/pricing'
import { creativesById as creativesByIdMap } from '#shared/data/portfolio'

// ─────────────────────────────────────────────────────────────
// useRequestSummary · ساخت خلاصه‌ی بخش‌بخششده از وضعیت ویزارد
// هم در پنل خلاصه (دسکتاپ/کشو) و هم در گام بازبینی استفاده می‌شود.
// ─────────────────────────────────────────────────────────────

export interface SummarySection {
  step: number
  title: string
  icon: string
  lines: string[]
  swatches?: string[]
  paletteName?: string
}

export function useRequestSummary() {
  const { state } = useProjectRequest()
  const { estimate } = usePricing()
  const creativeIndex = creativesByIdMap()

  const sections = computed<SummarySection[]>(() => {
    const s = state.value
    const out: SummarySection[] = []

    // ۰ — خلاق منتخب (اختیاری؛ بدون گام ویرایش)
    if (s.creativeId) {
      const sel = creativeIndex.get(s.creativeId)
      if (sel) out.push({ step: -1, title: 'خلاق منتخب', icon: 'user', lines: [sel.name, sel.role] })
    }

    // ۱ — نوع پروژه
    out.push({
      step: 0,
      title: 'نوع پروژه',
      icon: 'shape',
      lines: s.type ? [projectTypeMap[s.type].label, projectTypeMap[s.type].tagline] : ['انتخاب نشده'],
    })

    // ۲ — اندازه و فرمت
    const sizeLines: string[] = []
    const cfg = s.type ? sizeConfigs[s.type] : null
    if (cfg?.hasMedium && s.size.medium) sizeLines.push(s.size.medium === 'print' ? 'چاپ' : 'دیجیتال')
    if (s.size.presetId && cfg) {
      const p = cfg.presets.find(x => x.id === s.size.presetId)
      if (p) sizeLines.push(p.dims ? `${p.label} (${p.dims})` : p.label)
    }
    else if (s.size.custom.width && s.size.custom.height) {
      const unit = s.size.custom.unit === 'cm' ? 'سانتی‌متر' : 'پیکسل'
      sizeLines.push(`سفارشی: ${new Intl.NumberFormat('fa-IR').format(s.size.custom.width)} × ${new Intl.NumberFormat('fa-IR').format(s.size.custom.height)} ${unit}`)
    }
    out.push({ step: 1, title: 'اندازه و فرمت', icon: 'ruler', lines: sizeLines.length ? sizeLines : ['انتخاب نشده'] })

    // ۳ — جهت بصری
    let swatches: string[] | undefined
    let paletteName: string | undefined
    if (s.visual.isCustom) {
      swatches = [s.visual.customPrimary, s.visual.customSecondary]
      paletteName = 'رنگ‌های دلخواه'
    }
    else if (s.visual.paletteId) {
      const p = colorPalettes.find((x: ColorPalette) => x.id === s.visual.paletteId)
      if (p) { swatches = p.colors; paletteName = p.name }
    }
    out.push({
      step: 2,
      title: 'جهت بصری',
      icon: 'palette',
      lines: [paletteName ?? 'انتخاب نشده'],
      swatches,
      paletteName,
    })

    // ۴ — تایپوگرافی
    const fp = fontPairings.find(f => f.id === s.fontPairingId)
    out.push({ step: 3, title: 'تایپوگرافی', icon: 'type', lines: fp ? [fp.name, `حس ${fp.tone}`] : ['انتخاب نشده'] })

    // ۵ — محتوا و بریف
    const briefLines: string[] = []
    if (s.brief.mainText) briefLines.push(`«${s.brief.mainText}»`)
    if (s.brief.description) briefLines.push(s.brief.description.length > 90 ? `${s.brief.description.slice(0, 90)}…` : s.brief.description)
    const extra: string[] = []
    if (s.brief.files.length) extra.push(`${new Intl.NumberFormat('fa-IR').format(s.brief.files.length)} فایل مرجع`)
    const linkCount = Object.values(s.brief.links).filter(Boolean).length
    if (linkCount) extra.push(`${new Intl.NumberFormat('fa-IR').format(linkCount)} لینک مرجع`)
    if (extra.length) briefLines.push(extra.join(' · '))
    out.push({ step: 4, title: 'محتوا و بریف', icon: 'pen', lines: briefLines.length ? briefLines : ['نوشته نشده'] })

    // ۶ — بودجه و تحویل
    const budgetLines: string[] = []
    const u = pricingConfig.urgencyOptions.find(o => o.id === s.budget.urgencyId)
    const c = pricingConfig.complexityOptions.find(o => o.id === s.budget.complexityId)
    if (u) budgetLines.push(`تحویل ${u.label} (${u.hint})`)
    if (c) budgetLines.push(`پیچیدگی ${c.label}`)
    if (s.budget.addOnIds.length) budgetLines.push(`${new Intl.NumberFormat('fa-IR').format(s.budget.addOnIds.length)} سرویس اختیاری`)
    if (s.budget.min || s.budget.max) {
      const f = (n: number | null) => (n ? formatTomanCompact(n) : '—')
      budgetLines.push(`بودجه: ${f(s.budget.min)} تا ${f(s.budget.max)}`)
    }
    out.push({ step: 5, title: 'بودجه و تحویل', icon: 'wallet', lines: budgetLines.length ? budgetLines : ['مشخص نشده'] })

    // ۷ — اطلاعات تماس
    const clientLines = [
      s.client.fullName || undefined,
      s.client.mobile ? new Intl.NumberFormat('fa-IR').format(Number(normalizeMobileLocal(s.client.mobile))) : undefined,
      s.client.email || undefined,
      s.client.telegram ? `تلگرام: ${s.client.telegram}` : undefined,
    ].filter(Boolean) as string[]
    out.push({ step: 6, title: 'اطلاعات تماس', icon: 'user', lines: clientLines.length ? clientLines : ['تکمیل نشده'] })

    return out
  })

  return { sections, estimate }
}

function normalizeMobileLocal(v: string): string {
  const fa = '۰۱۲۳۴۵۶۷۸۹'
  let x = v.replace(/[۰-۹]/g, d => String(fa.indexOf(d))).replace(/\D/g, '')
  if (x.startsWith('98') && x.length === 12) x = `0${x.slice(2)}`
  if (x.startsWith('9') && x.length === 10) x = `0${x}`
  return x
}
