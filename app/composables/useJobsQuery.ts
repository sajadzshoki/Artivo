import type { CreativeKind, Job, JobCategoryId } from '#shared/types'
import { jobs } from '#shared/data/jobs'
import { budgetPresets, deliveryPresets, jobCategoryLabels } from '#shared/config/job-categories'
import { useSavedJobs } from './useSavedJobs'
import { useOverlay } from './useOverlay'

// ─────────────────────────────────────────────────────────────
// useJobsQuery · موتور کشف پروژه‌ها
// لایه‌ی query از UI جداست و امضای async دارد؛ در فاز بعد فقط
// بدنه‌ی fetchJobsPage با API واقعی جایگزین می‌شود.
// ─────────────────────────────────────────────────────────────

export interface JobsQueryFilters {
  search: string
  category: JobCategoryId | 'all'
  kind: CreativeKind | 'all'
  budget: string
  delivery: string
  city: string
  workplace: 'all' | 'remote' | 'onsite' | 'hybrid'
  urgentOnly: boolean
  savedOnly: boolean
  sort: 'newest' | 'budget-desc' | 'budget-asc' | 'deadline'
}

export const jobsPageSize = 6

export function defaultJobsFilters(): JobsQueryFilters {
  return {
    search: '',
    category: 'all',
    kind: 'all',
    budget: 'all',
    delivery: 'all',
    city: 'all',
    workplace: 'all',
    urgentOnly: false,
    savedOnly: false,
    sort: 'newest',
  }
}

export interface JobsOverlay {
  closedIds: string[]
  deletedIds: string[]
  jobOverrides: Record<string, { title?: string; urgent?: boolean }>
}

export function filterJobs(f: JobsQueryFilters, savedIds: string[], overlay?: JobsOverlay): Job[] {
  // وضعیت ادمین (بسته/متوقف/حذف‌شده) + وصله‌های عنوان/فوریت
  let list = jobs.filter((j) => {
    if (overlay && (overlay.deletedIds.includes(j.id) || overlay.closedIds.includes(j.id))) return false
    return true
  })
  if (overlay) list = list.map(j => ({ ...j, ...(overlay.jobOverrides[j.id] ?? {}) }))

  const q = f.search.trim()
  if (q) {
    list = list.filter(j =>
      j.title.includes(q)
      || j.description.includes(q)
      || j.client.name.includes(q)
      || j.brief.paragraphs.some(p => p.includes(q)))
  }

  if (f.category !== 'all') list = list.filter(j => j.categoryId === f.category)
  if (f.kind !== 'all') list = list.filter(j => j.kinds.includes(f.kind as CreativeKind))
  if (f.city !== 'all') list = list.filter(j => j.location.startsWith(f.city))
  if (f.workplace !== 'all') list = list.filter(j => j.workplace === f.workplace)
  if (f.urgentOnly) list = list.filter(j => j.urgent)
  if (f.savedOnly) list = list.filter(j => savedIds.includes(j.id))

  if (f.budget !== 'all') {
    const preset = budgetPresets.find(b => b.id === f.budget)
    if (preset) {
      // تقاطع بازه‌ی بودجه‌ی پروژه با بازه‌ی انتخابی
      list = list.filter(j => j.budgetMin <= preset.max && j.budgetMax >= preset.min)
    }
  }

  if (f.delivery !== 'all') {
    const preset = deliveryPresets.find(d => d.id === f.delivery)
    if (preset) list = list.filter(j => j.deadlineDays <= preset.max)
  }

  switch (f.sort) {
    case 'budget-desc': list.sort((a, b) => b.budgetMax - a.budgetMax); break
    case 'budget-asc': list.sort((a, b) => a.budgetMin - b.budgetMin); break
    case 'deadline': list.sort((a, b) => a.deadlineDays - b.deadlineDays); break
    default: list.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo)
  }

  return list
}

/** لایه‌ی API — فعلاً ماک با تأخیر؛ در فاز بعد با fetch واقعی عوض می‌شود */
export function fetchJobsPage(
  f: JobsQueryFilters,
  page: number,
  savedIds: string[],
  pageSize = jobsPageSize,
  overlay?: JobsOverlay,
): Promise<{ items: Job[]; total: number; hasMore: boolean }> {
  const all = filterJobs(f, savedIds, overlay)
  const start = page * pageSize
  const items = all.slice(start, start + pageSize)
  return new Promise(resolve => setTimeout(() => resolve({
    items,
    total: all.length,
    hasMore: start + pageSize < all.length,
  }), 350))
}

export function useJobsQuery() {
  const saved = useSavedJobs()
  const { overlay } = useOverlay()
  const jobsOverlay = computed<JobsOverlay>(() => ({
    closedIds: overlay.value.closedJobIds,
    deletedIds: overlay.value.deletedJobIds,
    jobOverrides: overlay.value.jobOverrides,
  }))

  const filters = reactive<JobsQueryFilters>(defaultJobsFilters())
  const items = ref<Job[]>([])
  const total = ref(0)
  const page = ref(0)
  const loading = ref(true)
  const loadingMore = ref(false)
  const loaded = ref(false)

  const hasMore = computed(() => items.value.length < total.value)
  const shownCount = computed(() => items.value.length)

  async function apply() {
    loading.value = true
    const res = await fetchJobsPage(filters, 0, saved.ids.value, jobsPageSize, jobsOverlay.value)
    items.value = res.items
    total.value = res.total
    page.value = 0
    loading.value = false
    loaded.value = true
  }

  async function loadMore() {
    if (loadingMore.value || !hasMore.value) return
    loadingMore.value = true
    const res = await fetchJobsPage(filters, page.value + 1, saved.ids.value, jobsPageSize, jobsOverlay.value)
    items.value = [...items.value, ...res.items]
    total.value = res.total
    page.value += 1
    loadingMore.value = false
  }

  // تغییر فیلترها → کوئری مجدد با debounce (جست‌وجوی روان)
  let timer: ReturnType<typeof setTimeout> | null = null
  watch(filters, () => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(apply, 250)
  })

  onMounted(apply)

  function reset() {
    Object.assign(filters, defaultJobsFilters())
  }

  /** خلاصه‌ی فیلترهای فعال برای چیپ‌های قابل‌حذف */
  const activeChips = computed(() => {
    const chips: { key: keyof JobsQueryFilters; label: string }[] = []
    if (filters.category !== 'all') chips.push({ key: 'category', label: labelOfCategory(filters.category) })
    if (filters.kind !== 'all') chips.push({ key: 'kind', label: filters.kind === 'designer' ? 'طراح گرافیک' : 'عکاس' })
    if (filters.budget !== 'all') chips.push({ key: 'budget', label: budgetPresets.find(b => b.id === filters.budget)?.label ?? '' })
    if (filters.delivery !== 'all') chips.push({ key: 'delivery', label: deliveryPresets.find(d => d.id === filters.delivery)?.label ?? '' })
    if (filters.city !== 'all') chips.push({ key: 'city', label: filters.city })
    if (filters.workplace !== 'all') chips.push({ key: 'workplace', label: filters.workplace === 'remote' ? 'دورکاری' : filters.workplace === 'onsite' ? 'حضوری' : 'ترکیبی' })
    if (filters.urgentOnly) chips.push({ key: 'urgentOnly', label: 'فوری' })
    if (filters.savedOnly) chips.push({ key: 'savedOnly', label: 'ذخیره‌شده‌ها' })
    return chips.filter(c => c.label)
  })

  function clearChip(key: keyof JobsQueryFilters) {
    switch (key) {
      case 'category': filters.category = 'all'; break
      case 'kind': filters.kind = 'all'; break
      case 'budget': filters.budget = 'all'; break
      case 'delivery': filters.delivery = 'all'; break
      case 'city': filters.city = 'all'; break
      case 'workplace': filters.workplace = 'all'; break
      case 'urgentOnly': filters.urgentOnly = false; break
      case 'savedOnly': filters.savedOnly = false; break
    }
  }

  return { filters, items, total, loading, loadingMore, loaded, hasMore, shownCount, apply, loadMore, reset, activeChips, clearChip }
}

function labelOfCategory(id: string): string {
  return jobCategoryLabels[id as JobCategoryId] ?? id
}

/** «۲ روز پیش» / «دیروز» / «امروز» */
export function postedLabel(daysAgo: number): string {
  const fa = new Intl.NumberFormat('fa-IR')
  if (daysAgo <= 0) return 'امروز'
  if (daysAgo === 1) return 'دیروز'
  return `${fa.format(daysAgo)} روز پیش`
}
