import type { ChatMessage, ConversationSummary, Creative, CreativeService, NotificationItem, Project, ProjectSummary, PublicOverlay } from '#shared/types'
import type { AdminPricingRules, CatalogProjectType } from '#shared/config/catalog'
import { defaultPricingBundle, defaultAdminPricingRules, rulesToPricingConfig } from '#shared/config/catalog'
import { fontPairings } from '#shared/config/font-pairings'
import { colorPalettes } from '#shared/config/palettes'
import { serviceCategoryLabels, serviceCategoryIcons } from '#shared/config/service-categories'
import { spotCategories } from '#shared/config/spot-categories'
import { creativeServices } from '#shared/data/services'
import { hashPassword } from './crypto'
import { loadJson, saveJson } from './persist'

// ─────────────────────────────────────────────────────────────
// store · لایه‌ی داده‌ی فاندیشن (توسعه) — users, sessions, OTP،
// کالکشن‌های ادمین و هم‌پوشانی داده‌ی استاتیک.
// ⚠️ نقطه‌ی تعویض با دیتابیس واقعی: فقط همین فایل عوض می‌شود؛
// قرارداد APIها ثابت می‌ماند.
// ─────────────────────────────────────────────────────────────

export interface StoredUser {
  id: string
  name: string
  email: string
  mobile: string
  passwordHash: string | null
  roles: ('client' | 'creative' | 'admin')[]
  mobileVerified: boolean
  active: boolean
  clientProfile: {
    brandName: string
    city: string
    website: string
    bio: string
    preferredCategories: string[]
  }
  creativeId: string | null
  createdAt: string
}

export interface OtpRecord {
  code: string
  purpose: 'login' | 'reset' | 'verify'
  exp: number
  attempts: number
  lastSent: number
}

export interface StoreData {
  seededAt: string
  users: StoredUser[]
  sessions: Record<string, { userId: string; exp: number }>
  otps: Record<string, OtpRecord>
  resets: Record<string, { userId: string; exp: number }>
  adminPricing: AdminPricingRules | null
  collections: Record<string, Record<string, unknown>[]>
  overrides: {
    jobs: Record<string, Record<string, unknown>>
    spots: Record<string, Record<string, unknown>>
    services: Record<string, Record<string, unknown>>
    creatives: Record<string, Record<string, unknown>>
  }
  deleted: { jobs: string[]; spots: string[]; services: string[] }
  communityCreatives: Creative[]
  projects: Project[]
  threads: StoredThread[]
  notifications: NotificationItem[]
}

/** گفتگوی داخلی — پیوند به پروژه (اختیاری) + وضعیت تایپ هم‌صحبت‌ها */
export interface StoredThread {
  id: string
  projectId: string | null
  members: string[]
  messages: ChatMessage[]
  typing: Record<string, number>
  createdAt: string
}

function now() {
  return new Date().toISOString()
}

function seedUsers(): StoredUser[] {
  const base = {
    mobileVerified: true,
    active: true,
    clientProfile: { brandName: '', city: '', website: '', bio: '', preferredCategories: [] as string[] },
    creativeId: null as string | null,
    createdAt: now(),
  }
  return [
    {
      ...base,
      id: 'u-admin',
      name: 'مدیر آرتیوو',
      email: 'admin@artivo.ir',
      mobile: '09120000000',
      passwordHash: hashPassword('artivo1234'),
      roles: ['admin'],
    },
    {
      ...base,
      id: 'u-demo-client',
      name: 'سارا محمدی',
      email: 'client@artivo.ir',
      mobile: '09120000001',
      passwordHash: hashPassword('artivo1234'),
      roles: ['client'],
      clientProfile: {
        brandName: 'کافه لوکا',
        city: 'تهران',
        website: 'https://cafeluca.ir',
        bio: 'کافه‌ای تخصصی در قلب تهران؛ عاشق طراحی تمیز و منوهای خوانا.',
        preferredCategories: ['menu', 'branding'],
      },
    },
    {
      ...base,
      id: 'u-demo-creative',
      name: 'لیلا فرهمند',
      email: 'leila@artivo.ir',
      mobile: '09120000002',
      passwordHash: hashPassword('artivo1234'),
      roles: ['creative', 'client'],
      creativeId: 'leila-farhmand',
    },
  ]
}

function seedCollections(): Record<string, Record<string, unknown>[]> {
  return {
    'font-packs': structuredClone(fontPairings) as unknown as Record<string, unknown>[],
    'color-palettes': structuredClone(colorPalettes) as unknown as Record<string, unknown>[],
    'project-categories': (Object.keys(serviceCategoryLabels) as (keyof typeof serviceCategoryLabels)[]).map(id => ({
      id, label: serviceCategoryLabels[id], icon: serviceCategoryIcons[id] ?? 'shape',
    })),
    'creative-categories': [
      { id: 'designer', label: 'طراح', roleLabel: 'طراح گرافیک' },
      { id: 'photographer', label: 'عکاس', roleLabel: 'عکاس' },
    ],
    'photography-categories': spotCategories.map(c => ({ id: c.id, label: c.label })) as unknown as Record<string, unknown>[],
    'services-created': [],
  }
}

function createStore() {
  const fallback: StoreData = {
    seededAt: now(),
    users: seedUsers(),
    sessions: {},
    otps: {},
    resets: {},
    adminPricing: null,
    collections: seedCollections(),
    overrides: { jobs: {}, spots: {}, services: {}, creatives: {} },
    deleted: { jobs: [], spots: [], services: [] },
    communityCreatives: [],
    projects: [],
    threads: [],
    notifications: [],
  }
  const data: StoreData = { ...fallback, ...loadJson<Partial<StoreData>>({}) }
  // فیلدهای اضافه‌شده در نسخه‌های بعدی + سیدِ کالکشن‌های تازه
  data.overrides ??= fallback.overrides
  data.deleted ??= fallback.deleted
  data.communityCreatives ??= []
  data.projects ??= []
  data.threads ??= []
  data.notifications ??= []
  data.collections = { ...seedCollections(), ...data.collections }

  const purge = () => {
    const t = Date.now()
    for (const [k, v] of Object.entries(data.sessions)) if (v.exp < t) delete data.sessions[k]
    for (const [k, v] of Object.entries(data.otps)) if (v.exp < t) delete data.otps[k]
    for (const [k, v] of Object.entries(data.resets)) if (v.exp < t) delete data.resets[k]
  }

  return {
    data,
    save: () => { purge(); saveJson(data) },
    now,
  }
}

// برای بقا در برابر HMR
const g = globalThis as unknown as { __artivoStore?: ReturnType<typeof createStore> }
g.__artivoStore ??= createStore()
export const store = g.__artivoStore

// ── Pricing ──

export function getPricingBundle() {
  const defaults = defaultPricingBundle()
  if (!store.data.adminPricing) return defaults
  const cfg: PricingConfig = rulesToPricingConfig(store.data.adminPricing)
  const catalogProjectTypes: CatalogProjectType[] = store.data.adminPricing.projectTypes
  return {
    pricing: cfg,
    catalog: {
      projectTypes: catalogProjectTypes,
      palettes: (store.data.collections['color-palettes'] ?? defaults.catalog.palettes) as typeof defaults.catalog.palettes,
      fontPairings: (store.data.collections['font-packs'] ?? defaults.catalog.fontPairings) as typeof defaults.catalog.fontPairings,
    },
  }
}

export function getAdminPricingRules(): AdminPricingRules {
  if (store.data.adminPricing) return store.data.adminPricing
  return defaultAdminPricingRules()
}

// ── Collections helpers ──

export function collectionItems(name: string): Record<string, unknown>[] {
  return store.data.collections[name] ?? []
}

/** سرویس‌های ادغام‌شده: ساخته‌شده‌های ادمین + استاتیکِ وصله‌خورده، بدون حذف‌شده‌ها */
export function mergedServices(): CreativeService[] {
  const statics = (creativeServices as CreativeService[])
    .filter(s => !store.data.deleted.services.includes(s.id))
    .map(s => ({ ...s, ...(store.data.overrides.services[s.id] ?? {}) }))
  const created = (collectionItems('services-created') as unknown as CreativeService[])
    .filter(s => !store.data.deleted.services.includes(s.id))
    .map(s => ({ ...s, ...(store.data.overrides.services[s.id] ?? {}) }))
  return [...created, ...statics]
}

/** هم‌پوشانی عمومی برای کلاینت */
export function publicOverlay(): PublicOverlay {
  const jobHidden = Object.entries(store.data.overrides.jobs)
    .filter(([, v]) => v.status === 'closed' || v.status === 'paused').map(([k]) => k)
  const serviceHidden = [
    ...store.data.deleted.services,
    ...Object.entries(store.data.overrides.services)
      .filter(([, v]) => v.visible === false).map(([k]) => k),
  ]
  return {
    closedJobIds: jobHidden,
    deletedJobIds: store.data.deleted.jobs,
    hiddenSpotIds: [
      ...store.data.deleted.spots,
      ...Object.entries(store.data.overrides.spots).filter(([, v]) => v.hidden === true).map(([k]) => k),
    ],
    featuredSpotIds: Object.entries(store.data.overrides.spots)
      .filter(([, v]) => v.featured === true).map(([k]) => k),
    hiddenServiceIds: serviceHidden,
    serviceOverrides: store.data.overrides.services as PublicOverlay['serviceOverrides'],
    createdServices: collectionItems('services-created') as unknown as CreativeService[],
    communityCreatives: store.data.communityCreatives,
    creativeOverrides: store.data.overrides.creatives as PublicOverlay['creativeOverrides'],
    jobOverrides: buildJobOverrides(),
    spotOverrides: buildSpotOverrides(),
    taxonomies: {
      serviceCategories: collectionItems('project-categories') as unknown as PublicOverlay['taxonomies']['serviceCategories'],
      photoCategories: collectionItems('photography-categories') as unknown as PublicOverlay['taxonomies']['photoCategories'],
      creativeKinds: collectionItems('creative-categories') as unknown as PublicOverlay['taxonomies']['creativeKinds'],
    },
  }
}


function buildJobOverrides(): PublicOverlay['jobOverrides'] {
  const out: PublicOverlay['jobOverrides'] = {}
  for (const [k, v] of Object.entries(store.data.overrides.jobs)) {
    const title = typeof v.title === 'string' ? v.title : undefined
    const urgent = typeof v.urgent === 'boolean' ? v.urgent : undefined
    if (title !== undefined || urgent !== undefined) out[k] = { title, urgent }
  }
  return out
}

function buildSpotOverrides(): PublicOverlay['spotOverrides'] {
  const out: PublicOverlay['spotOverrides'] = {}
  for (const [k, v] of Object.entries(store.data.overrides.spots)) {
    const name = typeof v.name === 'string' ? v.name : undefined
    const city = typeof v.city === 'string' ? v.city : undefined
    const bestTime = typeof v.bestTime === 'string' ? v.bestTime : undefined
    if (name !== undefined || city !== undefined || bestTime !== undefined) out[k] = { name, city, bestTime }
  }
  return out
}


// ── Projects & Chat helpers ──

export function findProject(id: string): Project | undefined {
  return store.data.projects.find(p => p.id === id)
}

export function isParticipant(project: Project, userId: string): boolean {
  return project.clientId === userId || project.creativeId === userId
}

export function findThreadForProject(projectId: string, a: string, b: string): StoredThread | undefined {
  return store.data.threads.find(t =>
    t.projectId === projectId && t.members.includes(a) && t.members.includes(b))
}

export function pushNotification(userId: string, kind: NotificationItem['kind'], title: string, body: string, link: string): void {
  store.data.notifications.unshift({
    id: `n-${Math.random().toString(36).slice(2, 10)}`,
    userId,
    kind,
    title,
    body,
    link,
    readAt: null,
    createdAt: store.now(),
  })
}

/** خلاصه‌ی پروژه از دید یک کاربر */
export function toProjectSummary(p: Project, userId: string): ProjectSummary {
  return {
    id: p.id,
    title: p.title,
    typeLabel: p.typeLabel,
    status: p.status,
    clientName: p.clientName,
    creativeName: p.creativeName,
    budgetMax: p.budgetMax,
    deadlineDays: p.deadlineDays,
    proposalsCount: p.proposals.length,
    revisionCount: p.revisionCount,
    code: p.code,
    updatedAt: p.updatedAt,
    myRole: p.clientId === userId ? 'client' : 'creative',
  }
}
