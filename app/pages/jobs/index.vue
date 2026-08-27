<script setup lang="ts">
import { jobCategoryLabels, jobCategories, budgetPresets, deliveryPresets, jobSortOptions } from '#shared/config/job-categories'
import { jobCities } from '#shared/data/jobs'
import { useJobsQuery } from '~/composables/useJobsQuery'
import { useSavedJobs } from '~/composables/useSavedJobs'

// ─────────────────────────────────────────────────────────────
// کشف پروژه‌ها — جست‌وجو، فیلترها، مرتب‌سازی، بارگذاری تدریجی
// ─────────────────────────────────────────────────────────────
useHead({ title: 'پروژه‌های باز — آرتیوو' })

const {
  filters, items, total, loading, loadingMore, loaded, hasMore, shownCount,
  apply, loadMore, reset, activeChips, clearChip,
} = useJobsQuery()

const saved = useSavedJobs()
const showFilters = ref(false)
const fa = new Intl.NumberFormat('fa-IR')

const categoryOptions = [
  { value: 'all', label: 'همه' },
  ...jobCategories.map(c => ({ value: c.id as string, label: c.label })),
]

const kindOptions = [
  { value: 'all', label: 'همه' },
  { value: 'designer', label: 'طراح گرافیک' },
  { value: 'photographer', label: 'عکاس' },
]

const workplaceOptions = [
  { value: 'all', label: 'همه' },
  { value: 'remote', label: 'دورکاری' },
  { value: 'onsite', label: 'حضوری' },
  { value: 'hybrid', label: 'ترکیبی' },
]

const cityOptions = [
  { value: 'all', label: 'همه‌ی شهرها' },
  ...jobCities.map(c => ({ value: c, label: c })),
]

// اگر حالت «ذخیره‌شده‌ها» فعال است، تغییر ذخیره‌ها → کوئری مجدد
watch(saved.ids, () => {
  if (filters.savedOnly) apply()
})
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Open Briefs</p>
      <h1 class="t-h1 page-head__title">پروژه‌های باز</h1>
      <p class="t-body page-head__desc">
        بریف‌های کامل کارفرماها — بودجه و مهلت شفاف، متن کامل پروژه و ارسال پیشنهاد در دو دقیقه.
      </p>
    </header>

    <!-- جست‌وجو -->
    <div class="search" v-reveal>
      <AInput v-model="filters.search" icon="search" placeholder="جست‌وجو در پروژه‌ها و کارفرماها…" />
    </div>

    <!-- نوار کنترل: دسته‌ها + مرتب‌سازی + دکمه‌ی فیلتر -->
    <div class="controls" v-reveal>
      <AFilterChips v-model="filters.category" :options="categoryOptions" label="فیلتر دسته" class="controls__cats" />

      <div class="controls__side">
        <button type="button" class="controls__filter" :class="{ 'controls__filter--on': activeChips.length }" @click="showFilters = true">
          <AIcon name="sliders" :size="16" />
          فیلترها
          <span v-if="activeChips.length" class="controls__badge">{{ fa.format(activeChips.length) }}</span>
        </button>
        <ASelect v-model="filters.sort" :options="jobSortOptions.map(o => ({ value: o.value, label: o.label }))" class="controls__sort" />
      </div>
    </div>

    <!-- چیپ‌های فعال -->
    <Transition name="fold">
      <div v-if="activeChips.length" class="active">
        <button v-for="c in activeChips" :key="c.key" type="button" class="active__chip" @click="clearChip(c.key)">
          {{ c.label }}
          <AIcon name="x" :size="12" />
        </button>
        <button type="button" class="active__clear" @click="reset">پاک کردن همه</button>
      </div>
    </Transition>

    <p class="count t-caption" aria-live="polite">
      {{ loading ? '…' : `${fa.format(total)} پروژه‌ی باز` }}
    </p>

    <!-- فهرست -->
    <section class="list" aria-label="فهرست پروژه‌های باز">
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="panel skel">
          <div class="skel__top">
            <ASkeleton w="6rem" h="0.8rem" />
            <ASkeleton w="2rem" h="0.8rem" />
          </div>
          <ASkeleton w="70%" h="1.2rem" />
          <ASkeleton w="90%" h="0.8rem" />
          <ASkeleton w="60%" h="0.8rem" />
          <div class="skel__foot">
            <ASkeleton w="2.1rem" h="2.1rem" radius="99px" />
            <ASkeleton w="8rem" h="0.8rem" />
          </div>
        </div>
      </template>

      <template v-else>
        <TransitionGroup name="list" tag="div" class="list__wrap">
          <JobCard v-for="j in items" :key="j.id" :job="j" />
          <AEmptyState
            v-if="loaded && items.length === 0"
            key="empty"
            icon="briefcase"
            title="پروژه‌ای با این فیلترها نیست"
            description="جست‌وجو را کوتاه‌تر کن، فیلترها را بردار یا کمی بعد سر بزن؛ هر روز بریف‌های تازه می‌آید."
          >
            <AButton variant="outline" size="sm" @click="reset">پاک کردن همه‌ی فیلترها</AButton>
          </AEmptyState>
        </TransitionGroup>

        <!-- بارگذاری تدریجی -->
        <div v-if="hasMore || loadingMore" class="more">
          <button v-if="!loadingMore" type="button" class="more__btn" @click="loadMore">
            نمایش پروژه‌های بیشتر
            <AIcon name="chevron-down" :size="16" />
          </button>
          <div v-else class="more__loading">
            <ASpinner :size="18" />
            در حال بارگذاری…
          </div>
          <p class="t-caption">{{ fa.format(shownCount) }} از {{ fa.format(total) }} پروژه</p>
        </div>
      </template>
    </section>

    <section class="post-cta panel" v-reveal>
      <div>
        <h2 class="t-h2">کارفرما هستی؟</h2>
        <p class="t-small">بریف پروژه‌ات را منتشر کن تا خلاق‌های آرتیوو پیشنهاد بدهند.</p>
      </div>
      <AButton to="/create" size="sm" icon-end="arrow-left">ثبت پروژه</AButton>
    </section>

    <!-- کشوی فیلترها -->
    <ADrawer v-model="showFilters" title="فیلتر پروژه‌ها">
      <div class="flt">
        <ASegmented v-model="filters.kind" :options="kindOptions" label="نوع خلاق" />
        <ASegmented v-model="filters.workplace" :options="workplaceOptions" label="نوع همکاری" />

        <div>
          <p class="flt__label">بازه‌ی بودجه</p>
          <AFilterChips v-model="filters.budget" :options="[{ value: 'all', label: 'همه' }, ...budgetPresets.map(b => ({ value: b.id, label: b.label }))]" label="بازه بودجه" class="flt__chips" />
        </div>

        <div>
          <p class="flt__label">مهلت تحویل</p>
          <AFilterChips v-model="filters.delivery" :options="[{ value: 'all', label: 'همه' }, ...deliveryPresets.map(d => ({ value: d.id, label: d.label }))]" label="مهلت تحویل" class="flt__chips" />
        </div>

        <ASelect v-model="filters.city" :options="cityOptions" label="شهر" />

        <div class="flt__toggles">
          <button type="button" class="flt__toggle" :class="{ 'flt__toggle--on': filters.urgentOnly }" @click="filters.urgentOnly = !filters.urgentOnly">
            <AIcon name="clock" :size="15" />
            فقط فوری‌ها
          </button>
          <button type="button" class="flt__toggle" :class="{ 'flt__toggle--on': filters.savedOnly }" @click="filters.savedOnly = !filters.savedOnly">
            <AIcon name="bookmark" :size="15" :fill="filters.savedOnly" />
            ذخیره‌شده‌ها ({{ fa.format(saved.ids.value.length) }})
          </button>
        </div>
      </div>

      <template #footer>
        <AButton variant="outline" block @click="reset">پاک کردن</AButton>
        <AButton block @click="showFilters = false">
          مشاهده‌ی {{ fa.format(total) }} پروژه
        </AButton>
      </template>
    </ADrawer>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 30rem; }

.search { max-width: 30rem; }

.controls {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  margin-top: 0.9rem;
}
.controls__cats { flex: 1; min-width: 0; }
.controls__side { display: flex; align-items: center; gap: 0.5rem; flex-shrink: 0; }

.controls__filter {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  height: 2.9rem;
  padding-inline: 1rem;
  border-radius: var(--r-sm);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--ink);
  white-space: nowrap;
  transition: border-color 0.2s, background 0.2s;
}
.controls__filter:hover { border-color: var(--ink); }
.controls__filter--on { border-color: var(--coral); color: var(--coral-deep); }
.controls__badge {
  min-width: 1.25rem;
  height: 1.25rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
  font-size: 0.66rem;
  font-weight: 800;
}

.controls__sort { width: 10.5rem; }

.active {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin-top: 0.8rem;
}
.active__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--r-pill);
  padding: 0.3rem 0.75rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  transition: background 0.2s;
}
.active__chip:hover { background: var(--coral); }
.active__clear {
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  margin-inline-start: 0.3rem;
}
.active__clear:hover { color: var(--coral-deep); }

.count { margin-top: 1.1rem; }

.list { margin-top: 0.4rem; display: grid; gap: 0.7rem; }

.skel { display: grid; gap: 0.7rem; padding: 1.1rem; }
.skel__top { display: flex; justify-content: space-between; }
.skel__foot { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.4rem; }

.list-enter-active { transition: all 0.35s var(--ease-out); }
.list-enter-from { opacity: 0; transform: translateY(10px); }

.more {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  padding-block: 1.6rem;
}
.more__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.65rem 1.4rem;
  font-size: var(--fs-small);
  font-weight: 800;
  transition: all 0.2s;
}
.more__btn:hover { border-color: var(--ink); transform: translateY(-1px); }
.more__loading { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--muted); font-size: var(--fs-small); }

.fold-enter-active, .fold-leave-active { transition: all 0.25s var(--ease-out); }
.fold-enter-from, .fold-leave-to { opacity: 0; transform: translateY(-4px); }

.post-cta {
  margin-block: 2.5rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.3rem 1.4rem;
}

/* کشوی فیلتر */
.flt { display: grid; gap: 1.3rem; }
.flt__label { font-size: var(--fs-small); font-weight: 800; margin-bottom: 0.1rem; }
.flt__chips { margin-inline: 0; padding-inline: 0; }
.flt__toggles { display: grid; gap: 0.5rem; }
.flt__toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-md);
  padding: 0.75rem 0.9rem;
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.flt__toggle--on { border-color: var(--coral); color: var(--coral-deep); background: var(--coral-soft); }

@media (max-width: 900px) {
  .controls { flex-wrap: wrap; }
  .controls__cats { order: 3; flex-basis: 100%; }
  .controls__side { order: 1; flex: 1; justify-content: space-between; }
  .controls__sort { width: 100%; max-width: 14rem; }
}
</style>
