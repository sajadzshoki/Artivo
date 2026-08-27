<script setup lang="ts">
import type { ProjectSummary } from '#shared/types'
import { formatTomanCompact } from '#shared/utils/format'
import { deadlineLabel } from '#shared/utils/format'

// کارت پروژه — فهرست‌های داشبورد و «پروژه‌های من»
const props = defineProps<{ project: ProjectSummary }>()

const fa = new Intl.NumberFormat('fa-IR')
const dateFmt = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short' })

const other = computed(() => props.project.myRole === 'client' ? props.project.creativeName : props.project.clientName)
const roleLabel = computed(() => props.project.myRole === 'client' ? 'کارفرما' : 'خلاق')
</script>

<template>
  <NuxtLink :to="`/projects/${project.id}`" class="pj panel">
    <div class="pj__main">
      <div class="pj__head">
        <strong class="pj__title">{{ project.title }}</strong>
        <StatusTag :status="project.status" />
      </div>
      <span class="pj__meta">
        {{ project.typeLabel }} · نقش تو: {{ roleLabel }}
        <template v-if="other"> · {{ other }}</template>
      </span>
      <div class="pj__facts">
        <span v-if="project.budgetMax" class="pj__fact"><AIcon name="wallet" :size="13" /> تا {{ formatTomanCompact(project.budgetMax) }}</span>
        <span v-if="project.deadlineDays" class="pj__fact"><AIcon name="clock" :size="13" /> {{ deadlineLabel(project.deadlineDays) }}</span>
        <span v-if="project.myRole === 'client' && (project.status === 'receiving' || project.status === 'published')" class="pj__fact pj__fact--accent">
          <AIcon name="send" :size="13" /> {{ fa.format(project.proposalsCount) }} پیشنهاد
        </span>
        <span v-if="project.revisionCount > 0" class="pj__fact"><AIcon name="pen" :size="13" /> {{ fa.format(project.revisionCount) }} اصلاحیه</span>
      </div>
    </div>
    <div class="pj__side">
      <span class="pj__code latin">{{ project.code }}</span>
      <span class="pj__date">{{ dateFmt.format(new Date(project.updatedAt)) }}</span>
      <AIcon name="arrow-left" :size="15" class="pj__arrow" />
    </div>
  </NuxtLink>
</template>

<style scoped>
.pj {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.95rem 1.05rem;
  transition: transform 0.25s var(--ease-out), box-shadow 0.25s;
}
.pj:hover { transform: translateY(-2px); box-shadow: var(--shadow-soft); }

.pj__main { display: grid; gap: 0.3rem; min-width: 0; flex: 1; }
.pj__head { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
.pj__title { font-size: var(--fs-md); font-weight: 900; min-width: 0; overflow-wrap: anywhere; }
.pj__meta { font-size: var(--fs-caption); color: var(--muted); }
.pj__facts { display: flex; flex-wrap: wrap; gap: 0.3rem 0.9rem; margin-top: 0.1rem; }
.pj__fact {
  display: inline-flex;
  align-items: center;
  gap: 0.28rem;
  font-size: 0.68rem;
  font-weight: 800;
  color: var(--ink-soft);
}
.pj__fact--accent { color: var(--coral-deep); }

.pj__side {
  display: grid;
  gap: 0.15rem;
  justify-items: end;
  flex-shrink: 0;
}
.pj__code {
  font-size: 0.62rem;
  font-weight: 700;
  color: var(--faint);
  background: var(--bg-deep);
  border-radius: var(--r-xs);
  padding: 0.2rem 0.4rem;
}
.pj__date { font-size: 0.62rem; color: var(--faint); }
.pj__arrow { color: var(--faint); }

@media (max-width: 480px) {
  .pj__code { display: none; }
}
</style>
