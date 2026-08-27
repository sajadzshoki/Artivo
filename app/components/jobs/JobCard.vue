<script setup lang="ts">
import type { Job } from '#shared/types'
import { jobCategoryLabels, jobCategoryIcons, workplaceLabels } from '#shared/config/job-categories'
import { postedLabel } from '~/composables/useJobsQuery'
import { useSavedJobs } from '~/composables/useSavedJobs'

// ─────────────────────────────────────────────────────────────
// JobCard · ردیف ادیتوریال پروژه‌ی باز
// الگوی stretched-link: کل کارت کلیک‌پذیر، دکمه‌ی ذخیره مستقل
// ─────────────────────────────────────────────────────────────
const props = defineProps<{ job: Job }>()

const fa = new Intl.NumberFormat('fa-IR')
const { isSaved, toggle } = useSavedJobs()
const toast = useToast()

function onSave() {
  const now = toggle(props.job.id)
  toast.success(now ? 'ذخیره شد' : 'از ذخیره‌شده‌ها حذف شد', props.job.title)
}

const initials = computed(() => props.job.client.name.split(' ').map(w => w[0]).slice(0, 2).join(''))
</script>

<template>
  <article class="jb" :class="{ 'jb--urgent': job.urgent }">
    <NuxtLink :to="`/jobs/${job.id}`" class="jb__link">
      <span class="visually-hidden">{{ job.title }}</span>
    </NuxtLink>

    <header class="jb__top">
      <span class="jb__cat">
        <AIcon :name="jobCategoryIcons[job.categoryId]" :size="14" />
        {{ jobCategoryLabels[job.categoryId] }}
      </span>
      <ATag v-if="job.urgent" label="فوری" tone="coral" dot />
      <ATag v-else-if="job.status === 'closed'" label="بسته شده" tone="neutral" dot />
      <span class="jb__posted">{{ postedLabel(job.postedDaysAgo) }}</span>

      <button
        type="button"
        class="jb__save"
        :class="{ 'jb__save--on': isSaved(job.id) }"
        :aria-label="isSaved(job.id) ? 'حذف از ذخیره‌شده‌ها' : 'ذخیره پروژه'"
        @click.stop.prevent="onSave"
      >
        <AIcon name="bookmark" :size="17" :fill="isSaved(job.id)" />
      </button>
    </header>

    <h3 class="jb__title">{{ job.title }}</h3>
    <p class="jb__desc">{{ job.description }}</p>

    <dl class="jb__meta">
      <div class="jb__meta-item jb__meta-item--budget">
        <dt>بودجه</dt>
        <dd>{{ formatTomanCompact(job.budgetMin) }} <em>تا</em> {{ formatTomanCompact(job.budgetMax) }}</dd>
      </div>
      <div class="jb__meta-item">
        <dt>مهلت</dt>
        <dd>{{ fa.format(job.deadlineDays) }} روز</dd>
      </div>
      <div class="jb__meta-item">
        <dt>محل</dt>
        <dd>{{ job.location === 'دورکاری' ? 'دورکاری' : `${workplaceLabels[job.workplace]} · ${job.location.split('·')[0]?.trim()}` }}</dd>
      </div>
      <div class="jb__meta-item">
        <dt>پیشنهادها</dt>
        <dd>{{ fa.format(job.proposalsCount) }}</dd>
      </div>
    </dl>

    <footer class="jb__foot">
      <span class="jb__client-avatar latin" aria-hidden="true">{{ initials }}</span>
      <span class="jb__client">
        <strong>{{ job.client.name }}</strong>
        <span>{{ job.client.type }}<template v-if="job.client.verified"> · تأییدشده</template></span>
      </span>
      <span class="jb__go"><AIcon name="arrow-left" :size="15" /></span>
    </footer>
  </article>
</template>

<style scoped>
.jb {
  position: relative;
  display: grid;
  gap: 0.45rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 1.1rem 1.15rem 1rem;
  transition: border-color 0.25s, box-shadow 0.3s, transform 0.25s var(--ease-out);
}
.jb:hover {
  border-color: var(--line-strong);
  box-shadow: var(--shadow-pop);
  transform: translateY(-2px);
}
.jb--urgent { border-inline-start: 3px solid var(--coral); }

.jb__link::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: inherit;
}

.jb__top {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.jb__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.32rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--indigo-deep);
}
.jb__posted { font-size: var(--fs-caption); color: var(--faint); margin-inline-start: auto; }

.jb__save {
  position: relative;
  z-index: 2;
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  color: var(--faint);
  transition: color 0.2s, background 0.2s, transform 0.15s;
}
.jb__save:hover { color: var(--ink); background: var(--bg-deep); }
.jb__save:active { transform: scale(0.88); }
.jb__save--on { color: var(--coral); }

.jb__title { font-size: var(--fs-lg); font-weight: 900; line-height: 1.5; }
.jb:hover .jb__title { color: var(--coral-deep); }

.jb__desc {
  font-size: var(--fs-small);
  color: var(--muted);
  line-height: 1.9;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.jb__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 1.6rem;
  padding-block: 0.55rem;
  margin-top: 0.2rem;
  border-block: 1px dashed var(--line);
}
.jb__meta-item { display: grid; gap: 0; }
.jb__meta-item dt { font-size: 0.64rem; color: var(--faint); font-weight: 700; }
.jb__meta-item dd { font-size: var(--fs-caption); font-weight: 800; color: var(--ink); }
.jb__meta-item dd em { font-style: normal; font-size: 0.64rem; color: var(--faint); font-weight: 600; }
.jb__meta-item--budget dd { color: var(--ink); font-size: var(--fs-small); }

.jb__foot { display: flex; align-items: center; gap: 0.6rem; margin-top: 0.15rem; }
.jb__client-avatar {
  width: 2.1rem;
  height: 2.1rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  font-size: var(--fs-caption);
  font-weight: 700;
  font-style: italic;
  flex-shrink: 0;
}
.jb__client { display: grid; min-width: 0; }
.jb__client strong { font-size: var(--fs-caption); font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.jb__client span { font-size: 0.66rem; color: var(--faint); }

.jb__go {
  margin-inline-start: auto;
  width: 2.2rem;
  height: 2.2rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  color: var(--ink);
  transition: all 0.25s var(--ease-out);
}
.jb:hover .jb__go { background: var(--coral); border-color: var(--coral); color: #fff; transform: translateX(-3px); }
</style>
