// ─────────────────────────────────────────────────────────────
// Artivo · Shared domain types
// همه‌ی تایپ‌های دامنه‌ی محصول اینجا تعریف می‌شوند تا هم اپ و هم
// سرویس‌ها (مثل موتور قیمت‌گذاری) به یک منبع واحد وابسته باشند.
// ─────────────────────────────────────────────────────────────

export type ProjectTypeId =
  | 'poster'
  | 'social'
  | 'menu'
  | 'ad'
  | 'logo'
  | 'branding'
  | 'packaging'
  | 'ui'
  | 'photoEdit'
  | 'other'

export interface ProjectType {
  id: ProjectTypeId
  label: string
  tagline: string
  icon: string
}

export type MediumKind = 'print' | 'digital'

export interface SizePreset {
  id: string
  label: string
  dims?: string
  multiplier: number
  medium?: MediumKind
}

export interface SizeConfig {
  /** آیا انتخاب «چاپ یا دیجیتال» برای این نوع پروژه معنا دارد؟ */
  hasMedium: boolean
  /** آیا ابعاد سفارشی پذیرفته می‌شود؟ */
  supportsCustom: boolean
  presets: SizePreset[]
}

export type PaletteCategoryId =
  | 'minimal'
  | 'luxury'
  | 'warm'
  | 'corporate'
  | 'editorial'
  | 'playful'
  | 'neon'
  | 'earthy'
  | 'monochrome'

export interface PaletteCategory {
  id: PaletteCategoryId
  label: string
}

export interface ColorPalette {
  id: string
  name: string
  category: PaletteCategoryId
  description: string
  /** [پس‌زمینه، مکمل، تأکیدی، جوهر] */
  colors: [string, string, string, string]
}

export interface FontPairing {
  id: string
  name: string
  latinName: string
  tone: string
  description: string
  headingFamily: string
  headingWeight: number
  bodyFamily: string
  latinFamily: string
}

export interface UrgencyOption {
  id: string
  label: string
  hint: string
  multiplier: number
}

export interface AddOnService {
  id: string
  label: string
  description: string
  price: number
}

export interface ComplexityOption {
  id: string
  label: string
  hint: string
  multiplier: number
}

// ─── Pricing ──────────────────────────────────────────────────

export type EstimateLineKind = 'base' | 'multiplier' | 'addon' | 'minimum'

export interface EstimateLine {
  id: string
  label: string
  detail?: string
  /** مبلغ به تومان؛ برای خطوط ضریب مقدار ندارد */
  amount?: number
  factor?: number
  kind: EstimateLineKind
}

export interface PriceEstimate {
  total: number
  base: number
  lines: EstimateLine[]
  minimumApplied: boolean
}

export interface PricingConfig {
  currency: string
  minimumPrice: number
  basePrices: Record<ProjectTypeId, number>
  complexityMultipliers: Record<string, number>
  defaultUrgencyId: string
  urgencyOptions: UrgencyOption[]
  defaultComplexityId: string
  complexityOptions: ComplexityOption[]
  addOns: AddOnService[]
  /** سقف نسبت ابعاد سفارشی (عرض ÷ ارتفاع) برای جلوگیری از مقادیر بی‌معنا */
  customMaxRatio: number
}

// ─── Wizard state ─────────────────────────────────────────────

export interface BriefFile {
  id: string
  name: string
  size: number
}

export interface ReferenceLinks {
  instagram?: string
  pinterest?: string
  website?: string
}

export interface ProjectRequestState {
  type: ProjectTypeId | null
  size: {
    presetId: string | null
    medium: MediumKind | null
    custom: { width: number | null; height: number | null; unit: 'cm' | 'px' }
  }
  visual: {
    paletteId: string | null
    customPrimary: string
    customSecondary: string
    isCustom: boolean
  }
  fontPairingId: string | null
  brief: {
    mainText: string
    description: string
    requirements: string
    files: BriefFile[]
    links: ReferenceLinks
  }
  budget: {
    min: number | null
    max: number | null
    deadlineId: string | null
    urgencyId: string
    complexityId: string
    addOnIds: string[]
  }
  client: {
    fullName: string
    mobile: string
    email: string
    telegram: string
  }
  confirmed: boolean
}

export interface SubmittedRequest {
  code: string
  createdAt: string
  typeLabel: string
  total: number
  clientName: string
  status: string
}

// ─── Mock content ─────────────────────────────────────────────

export interface Creative {
  id: string
  name: string
  role: string
  city: string
  rating: number
  projectsDone: number
  startingPrice: number
  skills: string[]
  bio: string
  image?: string
  accent: string
  featured?: boolean
}

export interface Job {
  id: string
  title: string
  client: string
  typeId: ProjectTypeId
  budgetMin: number
  budgetMax: number
  deadlineDays: number
  proposals: number
  postedAt: string
  location: string
}

export interface PhotoSpot {
  id: string
  name: string
  city: string
  bestTime: string
  tip: string
  tags: string[]
  image?: string
  accent: string
}

export interface HomeCategory {
  id: string
  label: string
  icon: string
  count: number
}
