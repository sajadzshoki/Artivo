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

// ─── Creatives · Marketplace ─────────────────────────────────

/** نوع خلاق — هر کاربر می‌تواند هم‌زمان کارفرما و خلاق باشد */
export type CreativeKind = 'designer' | 'photographer'

export const creativeKindLabels: Record<CreativeKind, string> = {
  designer: 'طراح گرافیک',
  photographer: 'عکاس',
}

/** دسته‌بندی سرویس‌ها/نمونه‌کارها (پوستر، پرتره، معماری و…) */
export type ServiceCategory =
  | 'poster'
  | 'logo'
  | 'social'
  | 'branding'
  | 'packaging'
  | 'menu'
  | 'ui'
  | 'photoEdit'
  | 'portrait'
  | 'product'
  | 'event'
  | 'architecture'

export interface Creative {
  id: string
  name: string
  kind: CreativeKind
  role: string
  city: string
  rating: number
  projectsDone: number
  startingPrice: number
  skills: string[]
  categories: ServiceCategory[]
  bio: string
  experienceYears: number
  /** سوابق — بندهای کوتاه ادیتوریال */
  experience: string[]
  languages: string[]
  avatar: string
  /** کاور کارت در فهرست‌ها — در نبودش از accent گرادیان می‌سازیم */
  image?: string
  accent: string
  featured?: boolean
  responseTime: string
  memberSince: string
}

export interface PortfolioItem {
  id: string
  creativeId: string
  title: string
  description: string
  category: ServiceCategory
  tags: string[]
  cover: string
  images: string[]
  year: string
  client?: string
}

export interface CreativeService {
  id: string
  creativeId: string
  title: string
  description: string
  category: ServiceCategory
  startingPrice: number
  /** مهلت تحویل به روز */
  deliveryDays: number
  revisions: number
  features: string[]
  portfolioItemIds: string[]
  popular?: boolean
}

export interface Review {
  id: string
  creativeId: string
  author: string
  /** عنوان پروژه‌ای که نظر مربوط به آن است */
  project: string
  rating: number
  date: string
  text: string
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
  /** خلاق منتخب (اختیاری — از پروفایل/سرویس پر می‌شود) */
  creativeId?: string | null
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

// ─── Jobs Marketplace ────────────────────────────────────────

/** اسلاید حداقلی برای لایت‌باکس — PortfolioItem و تصاویر مرجع هر دو سازگارند */
export interface LightboxSlide {
  id: string
  title: string
  description?: string
  year?: string
  client?: string
  tags?: string[]
  cover: string
  images?: string[]
}

/** دسته‌بندی پروژه‌های باز */
export type JobCategoryId =
  | 'graphic-design'
  | 'logo'
  | 'poster'
  | 'social'
  | 'branding'
  | 'packaging'
  | 'ui'
  | 'illustration'
  | 'photo-editing'
  | 'product-photo'
  | 'portrait-photo'
  | 'event-photo'
  | 'commercial-photo'
  | 'other'

/** محل اجرای پروژه */
export type Workplace = 'remote' | 'onsite' | 'hybrid'

export interface JobClient {
  name: string
  /** برند / آژانس / استارتاپ / سازمان / کافه */
  type: string
  about: string
  rating: number
  jobsPosted: number
  memberSince: string
  verified?: boolean
}

export interface JobBrief {
  paragraphs: string[]
  requirements: string[]
  deliverables: string[]
  referenceImages: string[]
  referenceLinks: { label: string; url: string }[]
}

export interface Job {
  id: string
  title: string
  categoryId: JobCategoryId
  /** این پروژه برای کدام نوع خلاق است */
  kinds: CreativeKind[]
  /** توضیح کوتاه — برای کارت */
  description: string
  budgetMin: number
  budgetMax: number
  deadlineDays: number
  urgent: boolean
  workplace: Workplace
  location: string
  /** چند روز پیش منتشر شده */
  postedDaysAgo: number
  proposalsCount: number
  status: 'open' | 'closed'
  client: JobClient
  brief: JobBrief
}

/** پیشنهادی که خلاق برای یک پروژه‌ی باز ثبت می‌کند */
export interface JobProposal {
  id: string
  jobId: string
  jobTitle: string
  price: number
  deliveryDays: number
  proposal: string
  portfolioItemIds: string[]
  serviceIds: string[]
  createdAt: string
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

// ─── Photography Locations ───────────────────────────────────

export type SpotCategoryId =
  | 'portrait'
  | 'landscape'
  | 'street'
  | 'architecture'
  | 'nature'
  | 'sunset'
  | 'night'
  | 'product'
  | 'fashion'
  | 'wedding'

/** یک عکس برای لوکیشن عکاسی (تیم آرتیوو یا کاربران) */
export interface SpotPhoto {
  id: string
  url: string
  author: string
  /** عکسِ افزوده‌ی کاربر */
  user?: boolean
}

export interface PhotoSpot {
  id: string
  name: string
  city: string
  address: string
  description: string
  tip: string
  bestTime: string
  location: { lat: number; lng: number }
  categories: SpotCategoryId[]
  tags: string[]
  photos: SpotPhoto[]
  rating: number
  ratingsCount: number
  accent: string
  /** کاور کارت — در نبودش از گرادیان accent استفاده می‌شود */
  image?: string
  featured?: boolean
  /** لوکیشن‌های افزوده‌ی کاربر (Phase 4: localStorage) */
  userAdded?: boolean
}

export interface HomeCategory {
  id: string
  label: string
  icon: string
  count: number
}
