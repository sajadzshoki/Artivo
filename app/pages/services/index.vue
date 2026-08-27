<script setup lang="ts">
import type { CreativeKind, ServiceCategory } from '#shared/types'
import { creativeServices } from '#shared/data/services'
import { creativesById } from '#shared/data/portfolio'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// ─────────────────────────────────────────────────────────────
// مارکت‌پلیس سرویس‌ها — خدمات قابل‌سفارش خلاق‌ها
// ─────────────────────────────────────────────────────────────
useHead({ title: 'سرویس‌های خلاق‌ها — آرتیوو' })

const loading = ref(true)
const query = ref('')
const kind = ref<'all' | CreativeKind>('all')
const category = ref('all')

onMounted(() => setTimeout(() => { loading.value = false }, 500))

const kindOptions = [
  { value: 'all', label: 'همه' },
  { value: 'designer', label: 'خدمات طراحان' },
  { value: 'photographer', label: 'خدمات عکاس‌ها' },
]

const categoryOptions = computed(() => {
  const set = new Map<string, string>()
  const pool = kind.value === 'all'
    ? creativeServices
    : creativeServices.filter(s => creativesById().get(s.creativeId)?.kind === kind.value)
  for (const s of pool) if (!set.has(s.category)) set.set(s.category, serviceCategoryLabels[s.category as ServiceCategory])
  return [{ value: 'all', label: 'همه‌ی دسته‌ها' }, ...[...set.entries()].map(([value, label]) => ({ value, label }))]
})

const filtered = computed(() => {
  let list = creativeServices
  if (kind.value !== 'all') {
    list = list.filter(s => creativesById().get(s.creativeId)?.kind === kind.value)
  }
  if (category.value !== 'all') list = list.filter(s => s.category === category.value)
  const q = query.value.trim()
  if (q) list = list.filter(s => s.title.includes(q) || s.description.includes(q))
  // پرتقالاب‌ها اول
  return [...list].sort((a, b) => Number(b.popular ?? false) - Number(a.popular ?? false))
})

watch(kind, () => {
  if (category.value !== 'all' && !categoryOptions.value.some(o => o.value === category.value)) category.value = 'all'
})

function reset() {
  query.value = ''
  kind.value = 'all'
  category.value = 'all'
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Services</p>
      <h1 class="t-h1 page-head__title">سرویس‌های خلاق‌ها</h1>
      <p class="t-body page-head__desc">
        خدمات مشخص با قیمت شروع، مهلت تحویل و تعداد اصلاحیه؛ سفارش از مسیر همان ویزارد شفاف آرتیوو.
      </p>
    </header>

    <div class="search" v-reveal>
      <AInput v-model="query" icon="search" placeholder="جست‌وجوی سرویس… مثلاً «منو» یا «پرتره»" />
    </div>

    <div class="filters" v-reveal>
      <ASegmented v-model="kind" :options="kindOptions" />
      <AFilterChips v-model="category" :options="categoryOptions" label="فیلتر دسته سرویس" class="filters__chips" />
    </div>

    <p class="count t-caption" aria-live="polite">
      {{ new Intl.NumberFormat('fa-IR').format(filtered.length) }} سرویس فعال
    </p>

    <section aria-label="فهرست سرویس‌ها">
      <div v-if="loading" class="grid">
        <div v-for="i in 6" :key="i" class="panel skel-card">
          <ASkeleton h="8.5rem" radius="0" />
          <div class="skel-card__body">
            <ASkeleton w="70%" h="1rem" />
            <ASkeleton w="45%" h="0.8rem" />
            <ASkeleton w="60%" h="0.8rem" />
          </div>
        </div>
      </div>

      <template v-else>
        <TransitionGroup name="list" tag="div" class="grid">
          <ServiceCard v-for="s in filtered" :key="s.id" :service="s" />
          <AEmptyState
            v-if="filtered.length === 0"
            key="empty"
            icon="briefcase"
            title="سرویسی با این فیلترها نیست"
            description="واژه‌ی دیگری را امتحان کن یا فیلترها را بردار."
          >
            <AButton variant="outline" size="sm" @click="reset">پاک کردن فیلترها</AButton>
          </AEmptyState>
        </TransitionGroup>
      </template>
    </section>

    <section class="panel post-cta" v-reveal>
      <div>
        <h2 class="t-h2">سرویس مشابهی پیدا نکردی؟</h2>
        <p class="t-small">بریف آزاد بده؛ خلاق‌های مناسب پیشنهاد می‌دهند.</p>
      </div>
      <AButton to="/create" size="sm" icon-end="arrow-left">ثبت پروژه‌ی آزاد</AButton>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 32rem; }

.search { max-width: 30rem; }

.filters { display: flex; flex-wrap: wrap; align-items: center; gap: 0.7rem; margin-top: 0.9rem; }
.filters__chips { flex: 1; min-width: 0; }

.count { margin-top: 1.1rem; }

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
  gap: 0.9rem;
  margin-top: 0.6rem;
}
.skel-card { overflow: hidden; }
.skel-card__body { display: grid; gap: 0.6rem; padding: 1rem; }

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }

.post-cta {
  margin-block: 2.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.3rem 1.4rem;
}
</style>
