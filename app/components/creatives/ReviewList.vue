<script setup lang="ts">
import { reviewsOf } from '#shared/data/reviews'

// ─────────────────────────────────────────────────────────────
// ReviewList · خلاصه‌ی امتیاز + فهرست نظرات کارفرماها
// ─────────────────────────────────────────────────────────────
const props = defineProps<{
  creativeId: string
  rating: number
  projectsDone: number
  limit?: number
}>()

const fa = new Intl.NumberFormat('fa-IR')
const all = reviewsOf(props.creativeId)
const list = computed(() => (props.limit ? all.slice(0, props.limit) : all))
</script>

<template>
  <div class="rvw">
    <div class="rvw__summary">
      <span class="rvw__big">{{ fa.format(rating) }}</span>
      <div class="rvw__sub">
        <ARating :rating="rating" :size="16" />
        <span>از {{ fa.format(all.length) }} نظر ثبت‌شده · {{ fa.format(projectsDone) }} پروژه‌ی موفق</span>
      </div>
    </div>

    <ul class="rvw__list">
      <li v-for="r in list" :key="r.id" class="rvw__item">
        <AIcon name="quote" :size="22" class="rvw__quote" />
        <div class="rvw__body">
          <div class="rvw__head">
            <ARating :rating="r.rating" :size="12" />
            <span class="rvw__date">{{ r.date }}</span>
          </div>
          <p class="rvw__text">{{ r.text }}</p>
          <div class="rvw__author">
            <strong>{{ r.author }}</strong>
            <span>{{ r.project }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.rvw { display: grid; gap: 1.4rem; }

.rvw__summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1rem 1.2rem;
}
.rvw__big { font-size: 2.4rem; font-weight: 900; line-height: 1; color: var(--ink); }
.rvw__sub { display: grid; gap: 0.25rem; font-size: var(--fs-caption); color: var(--muted); }

.rvw__list { display: grid; gap: 0.8rem; }

.rvw__item {
  position: relative;
  display: flex;
  gap: 0.8rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1rem 1.1rem;
}
.rvw__quote { color: var(--line-strong); flex-shrink: 0; margin-top: 0.1rem; }

.rvw__body { display: grid; gap: 0.45rem; min-width: 0; }
.rvw__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.rvw__date { font-size: 0.66rem; color: var(--faint); }
.rvw__text { font-size: var(--fs-small); color: var(--ink-soft); line-height: 1.95; }

.rvw__author { display: flex; flex-wrap: wrap; align-items: baseline; gap: 0.5rem; font-size: var(--fs-caption); }
.rvw__author strong { font-weight: 900; }
.rvw__author span { color: var(--muted); }
.rvw__author span::before { content: '· '; color: var(--faint); }
</style>
