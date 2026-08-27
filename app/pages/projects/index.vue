<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// پروژه‌های من — دو تب: کارفرما / خلاق + فیلتر وضعیت
// ─────────────────────────────────────────────────────────────
useHead({ title: 'پروژه‌های من — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()
const { user } = useAuth()
const { asClient, asCreative, ready, error, refresh } = useProjects()
const fa = new Intl.NumberFormat('fa-IR')

const availableRoles = computed(() => {
  const roles = user.value?.roles ?? []
  const out: ('client' | 'creative')[] = []
  if (roles.includes('client') || roles.includes('admin')) out.push('client')
  if (roles.includes('creative') || roles.includes('admin')) out.push('creative')
  return out.length ? out : ['client' as const]
})
const tab = ref<'client' | 'creative'>(
  route.query.tab === 'creative' && availableRoles.value.includes('creative') ? 'creative' : availableRoles.value[0] ?? 'client',
)
watch(tab, (t) => {
  router.replace({ query: { ...route.query, tab: t } })
})

const statusFilter = ref<string>('all')
const statusOptions = computed(() => [
  { value: 'all', label: 'همه' },
  { value: 'active', label: 'در جریان' },
  { value: 'completed', label: 'تکمیل‌شده' },
  { value: 'cancelled', label: 'لغوشده' },
])

const list = computed(() => {
  const src = tab.value === 'client' ? asClient.value : asCreative.value
  let out = src
  if (statusFilter.value === 'active') out = out.filter(p => !['completed', 'cancelled'].includes(p.status))
  else if (statusFilter.value !== 'all') out = out.filter(p => p.status === statusFilter.value)
  return out
})

onMounted(refresh)
</script>

<template>
  <div class="container pl">
    <header class="page-head" v-reveal>
      <p class="overline">Projects</p>
      <h1 class="t-h1 page-head__title">پروژه‌های من</h1>
      <div class="pl__bar">
        <ASegmented
          v-model="tab"
          :options="availableRoles.map(r => ({ value: r, label: r === 'client' ? 'کارفرما' : 'خلاق' }))"
          class="pl__seg"
        />
        <AButton to="/projects/new" size="sm" icon="plus" class="pl__new">پروژه‌ی جدید</AButton>
      </div>
      <AFilterChips v-model="statusFilter" :options="statusOptions" label="فیلتر وضعیت" class="pl__chips" />
    </header>

    <AEmptyState
          v-if="error && !ready"
          icon="zap"
          title="پروژه‌ها بارگذاری نشدند"
          description="ارتباط برقرار نشد؛ دوباره تلاش کن."
        >
          <AButton size="sm" @click="refresh()">تلاش دوباره</AButton>
        </AEmptyState>
        <div v-else-if="!ready" class="pl__list">
      <div v-for="i in 4" :key="i" class="panel" style="padding:1rem">
        <ASkeleton h="3.2rem" radius="12px" />
      </div>
    </div>

    <template v-else>
      <div class="pl__list" v-reveal>
        <ProjectCard v-for="p in list" :key="p.id" :project="p" />
        <AEmptyState
          v-if="!list.length"
          icon="briefcase"
          :title="statusFilter === 'all' ? 'هنوز پروژه‌ای در این نقش نداری' : 'با این فیلتر پروژه‌ای نیست'"
          :description="tab === 'client'
            ? 'اولین پروژه را بساز و منتشر کن تا خلاق‌ها پیشنهاد بدهند.'
            : 'از داشبورد خلاق، فرصت‌های باز را ببین و پیشنهاد بده.'"
        >
          <AButton v-if="tab === 'client'" to="/projects/new" size="sm" icon-end="arrow-left">ساخت پروژه</AButton>
          <AButton v-else to="/dashboard" size="sm">داشبورد خلاق</AButton>
        </AEmptyState>
        <p v-else class="t-caption pl__count">{{ fa.format(list.length) }} پروژه</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.7rem; }
.pl__bar { display: flex; align-items: center; justify-content: space-between; gap: 0.7rem; }
.pl__seg { max-width: 15rem; }
.pl__chips { overflow-x: auto; scrollbar-width: none; }
.pl__chips::-webkit-scrollbar { display: none; }

.pl__list { display: grid; gap: 0.55rem; }
.pl__count { color: var(--faint); }
</style>
