<script setup lang="ts">
import type { Job } from '#shared/types'
import { projectTypeMap } from '#shared/config/project-types'

// کارت پروژه‌ی باز — بریف‌های منتشرشده توسط کارفرماها
const props = defineProps<{ job: Job }>()
const emit = defineEmits<{ propose: [job: Job] }>()

const fa = new Intl.NumberFormat('fa-IR')
const type = computed(() => projectTypeMap[props.job.typeId])
</script>

<template>
  <article class="jc">
    <span class="jc__icon"><AIcon :name="type.icon" :size="22" /></span>

    <div class="jc__main">
      <div class="jc__head">
        <h3 class="jc__title">{{ job.title }}</h3>
        <ATag :label="type.label" tone="indigo" />
      </div>
      <p class="jc__client">{{ job.client }} · {{ job.location }}</p>

      <div class="jc__meta">
        <span class="jc__meta-item"><AIcon name="clock" :size="14" /> مهلت {{ fa.format(job.deadlineDays) }} روز</span>
        <span class="jc__meta-item"><AIcon name="users" :size="14" /> {{ fa.format(job.proposals) }} پیشنهاد</span>
        <span class="jc__meta-item">{{ job.postedAt }}</span>
      </div>
    </div>

    <div class="jc__side">
      <span class="jc__budget">
        {{ formatTomanCompact(job.budgetMin) }} <em>تا</em> {{ formatTomanCompact(job.budgetMax) }}
      </span>
      <AButton size="sm" variant="soft" icon-end="arrow-left" @click="emit('propose', job)">ارسال پیشنهاد</AButton>
    </div>
  </article>
</template>

<style scoped>
.jc {
  display: flex;
  gap: 0.9rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 1rem;
  transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s var(--ease-out);
}
.jc:hover { border-color: var(--line-strong); box-shadow: var(--shadow-soft); transform: translateY(-2px); }

.jc__icon {
  width: 3rem; height: 3rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--bg-deep);
  color: var(--indigo-deep);
  flex-shrink: 0;
}

.jc__main { display: grid; gap: 0.3rem; min-width: 0; }
.jc__head { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.jc__title { font-size: var(--fs-md); font-weight: 900; }
.jc__client { font-size: var(--fs-caption); color: var(--muted); }
.jc__meta { display: flex; flex-wrap: wrap; gap: 0.85rem; margin-top: 0.25rem; }
.jc__meta-item {
  display: inline-flex; align-items: center; gap: 0.25rem;
  font-size: var(--fs-caption); color: var(--faint);
}

.jc__side {
  display: grid;
  justify-items: end;
  align-content: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-inline-start: auto;
}
.jc__budget { font-size: var(--fs-small); font-weight: 900; text-align: end; }
.jc__budget em { font-style: normal; font-size: var(--fs-caption); color: var(--muted); font-weight: 600; }

@media (max-width: 560px) {
  .jc { flex-wrap: wrap; }
  .jc__side { grid-auto-flow: column; align-items: center; width: 100%; justify-content: space-between; }
  .jc__budget { text-align: start; }
}
</style>
