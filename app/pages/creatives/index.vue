<script setup lang="ts">
import type { Creative, CreativeKind, ServiceCategory } from '#shared/types'
import { creatives } from '#shared/data/content'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// ─────────────────────────────────────────────────────────────
// خلاق‌ها — جست‌وجو + فیلتر نوع / دسته / شهر
// ─────────────────────────────────────────────────────────────
useHead({ title: 'خلاق‌ها — آرتیوو' })

const loading = ref(true)
const query = ref('')
const kind = ref<'all' | CreativeKind>('all')
const category = ref('all')
const city = ref('all')

onMounted(() => { setTimeout(() => { loading.value = false }, 550) })

const kindOptions = [
  { value: 'all', label: 'همه' },
  { value: 'designer', label: 'طراحان گرافیک' },
  { value: 'photographer', label: 'عکاس‌ها' },
]

const categoryOptions = computed(() => {
  const set = new Map<string, string>()
  const pool = kind.value === 'all' ? creatives : creatives.filter(c => c.kind === kind.value)
  for (const c of pool) for (const cat of c.categories) if (!set.has(cat)) set.set(cat, serviceCategoryLabels[cat as ServiceCategory])
  return [{ value: 'all', label: 'همه‌ی دسته‌ها' }, ...[...set.entries()].map(([value, label]) => ({ value, label }))]
})

const cityOptions = computed(() => {
  const set = new Set<string>()
  for (const c of creatives) set.add(c.city)
  return [{ value: 'all', label: 'همه‌ی شهرها' }, ...[...set].map(c => ({ value: c, label: c }))]
})

const filtered = computed<Creative[]>(() => {
  let list = creatives
  if (kind.value !== 'all') list = list.filter(c => c.kind === kind.value)
  if (category.value !== 'all') list = list.filter(c => c.categories.includes(category.value as ServiceCategory))
  if (city.value !== 'all') list = list.filter(c => c.city === city.value)
  const q = query.value.trim()
  if (q) {
    list = list.filter(c =>
      c.name.includes(q) || c.role.includes(q) || c.bio.includes(q) || c.skills.some(s => s.includes(q)))
  }
  return list
})

// تغییر نوع، دسته‌ی ناموجود را پاک می‌کند
watch(kind, () => {
  if (category.value !== 'all' && !categoryOptions.value.some(o => o.value === category.value)) category.value = 'all'
})

function reset() {
  query.value = ''
  kind.value = 'all'
  category.value = 'all'
  city.value = 'all'
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">The Talents</p>
      <h1 class="t-h1 page-head__title">خلاق‌های آرتیوو</h1>
      <p class="t-body page-head__desc">
        طراحان گرافیک و عکاسانی که هر کدام امضای خودشان را دارند؛ پروفایل ببین، سرویس انتخاب کن، پروژه بسپار.
      </p>
    </header>

    <!-- جست‌وجو -->
    <div class="search" v-reveal>
      <AInput v-model="query" icon="search" placeholder="جست‌وجو در نام، تخصص یا مهارت…" />
    </div>

    <!-- فیلترها -->
    <div class="filters" v-reveal>
      <ASegmented v-model="kind" :options="kindOptions" />
      <AFilterChips v-model="category" :options="categoryOptions" label="فیلتر دسته" class="filters__chips" />
      <ASelect v-model="city" :options="cityOptions" class="filters__city" />
    </div>

    <p class="count t-caption" aria-live="polite">
      {{ new Intl.NumberFormat('fa-IR').format(filtered.length) }} خلاق
    </p>

    <section aria-label="فهرست خلاق‌ها">
      <div v-if="loading" class="grid">
        <div v-for="i in 6" :key="i" class="panel skel-card">
          <ASkeleton h="9.5rem" radius="0" />
          <div class="skel-card__body">
            <ASkeleton w="60%" h="1rem" />
            <ASkeleton w="40%" h="0.8rem" />
            <ASkeleton w="75%" h="0.8rem" />
          </div>
        </div>
      </div>

      <template v-else>
        <TransitionGroup name="list" tag="div" class="grid">
          <CreativeCard v-for="c in filtered" :key="c.id" :creative="c" />
          <AEmptyState
            v-if="filtered.length === 0"
            key="empty"
            icon="users"
            title="خلاقی با این فیلترها پیدا نشد"
            description="جست‌وجو را کوتاه‌تر کن یا فیلترها را بردار."
          >
            <AButton variant="outline" size="sm" @click="reset">پاک کردن همه‌ی فیلترها</AButton>
          </AEmptyState>
        </TransitionGroup>
      </template>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 30rem; }

.search { max-width: 30rem; }

.filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.9rem;
}
.filters__chips { flex: 1; min-width: 0; }
.filters__city { width: 10.5rem; flex-shrink: 0; }

.count { margin-top: 1.1rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(15.5rem, 1fr));
  gap: 0.8rem;
  margin-top: 0.6rem;
}
.skel-card { overflow: hidden; }
.skel-card__body { display: grid; gap: 0.6rem; padding: 1rem; }

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }
</style>
