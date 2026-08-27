<script setup lang="ts">
import type { Job, ProjectTypeId } from '#shared/types'
import { projectTypes } from '#shared/config/project-types'
import { jobs } from '#shared/data/content'

// پروژه‌های باز — بریف‌هایی که خلاق‌ها می‌توانند پیشنهاد بدهند
useHead({ title: 'پروژه‌های باز — آرتیوو' })

const toast = useToast()
const loading = ref(true)
const filter = ref('all')

onMounted(() => { setTimeout(() => { loading.value = false }, 650) })

const filtered = computed<Job[]>(() => {
  if (filter.value === 'all') return jobs
  return jobs.filter(j => j.typeId === (filter.value as ProjectTypeId))
})

const filterOptions = [
  { value: 'all', label: 'همه' },
  ...projectTypes
    .filter(t => jobs.some(j => j.typeId === t.id))
    .map(t => ({ value: t.id, label: t.label })),
]

function propose(job: Job) {
  toast.info('به‌زودی', `ارسال پیشنهاد برای «${job.title}» در فاز بعدی فعال می‌شود.`)
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Open Briefs</p>
      <h1 class="t-h1 page-head__title">پروژه‌های باز</h1>
      <p class="t-body page-head__desc">
        بریف‌هایی که کارفرماها منتشر کرده‌اند؛ اگر خلاق هستی، پیشنهادت را ثبت کن.
      </p>
    </header>

    <AFilterChips v-model="filter" :options="filterOptions" label="فیلتر نوع پروژه" />

    <section class="job-list" aria-label="فهرست پروژه‌های باز">
      <template v-if="loading">
        <div v-for="i in 5" :key="i" class="panel job-skel">
          <ASkeleton w="3rem" h="3rem" radius="12px" />
          <div class="job-skel__lines">
            <ASkeleton w="55%" h="1.05rem" />
            <ASkeleton w="80%" h="0.8rem" />
            <ASkeleton w="40%" h="0.8rem" />
          </div>
          <ASkeleton w="6.5rem" h="2.1rem" radius="99px" />
        </div>
      </template>

      <TransitionGroup v-else name="list" tag="div" class="job-list__wrap">
        <JobCard v-for="j in filtered" :key="j.id" :job="j" @propose="propose" />
        <AEmptyState
          v-if="filtered.length === 0"
          key="empty"
          icon="search"
          title="پروژه‌ای با این فیلتر نیست"
          description="فیلتر دیگری را امتحان کن یا کمی بعد سر بزن؛ هر روز بریف‌های تازه اضافه می‌شود."
        >
          <AButton variant="outline" size="sm" @click="filter = 'all'">نمایش همه</AButton>
        </AEmptyState>
      </TransitionGroup>
    </section>

    <section class="post-cta panel" v-reveal>
      <div>
        <h2 class="t-h2">کارفرما هستی؟</h2>
        <p class="t-small">بریف پروژه‌ات را منتشر کن تا خلاق‌های آرتیوو پیشنهاد بدهند.</p>
      </div>
      <AButton to="/create" size="sm" icon-end="arrow-left">ثبت پروژه</AButton>
    </section>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 30rem; }

.job-list { margin-top: 1rem; display: grid; gap: 0.7rem; }
.job-skel { display: flex; align-items: center; gap: 0.9rem; padding: 1rem; }
.job-skel__lines { flex: 1; display: grid; gap: 0.55rem; }

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
