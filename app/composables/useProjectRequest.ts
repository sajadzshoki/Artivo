import type { ProjectRequestState, ProjectTypeId, SubmittedRequest } from '#shared/types'
import { isValidMobile, isValidEmail } from '#shared/utils/format'
import { sizeConfigs } from '#shared/config/project-types'

// ─────────────────────────────────────────────────────────────
// useProjectRequest · وضعیت ویزارد درخواست پروژه
// داده‌ی خام + اعتبارسنجی هر گام + رفت‌وبرگشت بدون از دست دادن
// اطلاعات. پیش‌نویس در localStorage ذخیره می‌شود (بعد از mount،
// تا hydration مخدوش نشود).
// ─────────────────────────────────────────────────────────────

const DRAFT_KEY = 'artivo:draft:v1'
export const wizardSteps = [
  { key: 'type', label: 'نوع پروژه' },
  { key: 'size', label: 'اندازه و فرمت' },
  { key: 'visual', label: 'جهت بصری' },
  { key: 'font', label: 'تایپوگرافی' },
  { key: 'brief', label: 'محتوا و بریف' },
  { key: 'budget', label: 'بودجه و تحویل' },
  { key: 'client', label: 'اطلاعات تماس' },
  { key: 'review', label: 'بازبینی' },
] as const

function initialState(): ProjectRequestState {
  return {
    type: null,
    size: { presetId: null, medium: null, custom: { width: null, height: null, unit: 'cm' } },
    visual: { paletteId: null, customPrimary: '#FF5A3C', customSecondary: '#211C15', isCustom: false },
    fontPairingId: null,
    brief: { mainText: '', description: '', requirements: '', files: [], links: {} },
    budget: { min: null, max: null, deadlineId: null, urgencyId: 'normal', complexityId: 'standard', addOnIds: [] },
    client: { fullName: '', mobile: '', email: '', telegram: '' },
    confirmed: false,
  }
}

export function useProjectRequest() {
  const state = useState<ProjectRequestState>('artivo-request', initialState)
  const step = useState<number>('artivo-request-step', () => 0)
  const hydrated = useState<boolean>('artivo-request-hydrated', () => false)

  // بازیابی پیش‌نویس پس از mount — بدون به‌هم‌خوردن hydration
  if (import.meta.client) {
    onMounted(() => {
      if (hydrated.value) return
      hydrated.value = true
      try {
        const raw = localStorage.getItem(DRAFT_KEY)
        if (raw) {
          const saved = JSON.parse(raw) as ProjectRequestState
          Object.assign(state.value, { ...saved, confirmed: false })
        }
      }
      catch { /* پیش‌نویس خراب — نادیده بگیر */ }
    })
    watch(state, (s) => {
      try { localStorage.setItem(DRAFT_KEY, JSON.stringify(s)) }
      catch { /* حافظه پر — مهم نیست */ }
    }, { deep: true })
  }

  // ── اعتبارسنجی گام‌ها ──
  const validity = computed<boolean[]>(() => {
    const s = state.value
    const customOk = !!(s.size.custom.width && s.size.custom.height
      && s.size.custom.width > 0 && s.size.custom.height > 0)
    return [
      s.type !== null,
      s.size.presetId !== null || customOk,
      s.visual.paletteId !== null || s.visual.isCustom,
      s.fontPairingId !== null,
      s.brief.mainText.trim().length >= 2 && s.brief.description.trim().length >= 20,
      s.budget.deadlineId !== null,
      s.client.fullName.trim().length >= 3 && isValidMobile(s.client.mobile)
        && (s.client.email === '' || isValidEmail(s.client.email)),
      s.confirmed,
    ]
  })

  const firstInvalidStep = computed(() => validity.value.findIndex(v => !v))
  const progress = computed(() => validity.value.filter(Boolean).length)

  // ── اکشن‌ها ──
  function setType(id: ProjectTypeId) {
    if (state.value.type !== id) {
      state.value.size = { presetId: null, medium: sizeConfigs[id].hasMedium ? state.value.size.medium : null, custom: { width: null, height: null, unit: 'cm' } }
    }
    state.value.type = id
  }

  function reset() {
    state.value = initialState()
    step.value = 0
    if (import.meta.client) localStorage.removeItem(DRAFT_KEY)
  }

  const canGoNext = computed(() => validity.value[step.value] !== false)
  function next() { if (canGoNext.value && step.value < wizardSteps.length - 1) step.value++ }
  function back() { if (step.value > 0) step.value-- }

  return { state, step, validity, firstInvalidStep, progress, setType, reset, next, back, canGoNext }
}
