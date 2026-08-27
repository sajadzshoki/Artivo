<script setup lang="ts">
// گام ۱ — انتخاب نوع پروژه
import { projectTypes } from '#shared/config/project-types'

const { state, setType } = useProjectRequest()
</script>

<template>
  <div>
    <header class="s-head">
      <h2 class="t-h1">چه می‌خواهی بسازیم؟</h2>
      <p class="t-body">نوع پروژه‌ات را انتخاب کن؛ قیمت پایه و فرمت‌ها بر همین اساس تنظیم می‌شود.</p>
    </header>

    <div class="types">
      <button
        v-for="t in projectTypes"
        :key="t.id"
        type="button"
        class="tt"
        :class="{ 'tt--on': state.type === t.id }"
        :aria-pressed="state.type === t.id"
        @click="setType(t.id)"
      >
        <span class="tt__icon"><AIcon :name="t.icon" :size="22" /></span>
        <span class="tt__label">{{ t.label }}</span>
        <span class="tt__tag">{{ t.tagline }}</span>
        <span class="tt__check" aria-hidden="true"><AIcon name="check" :size="13" /></span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.s-head { display: grid; gap: 0.4rem; margin-bottom: 1.6rem; }

.types {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
@media (min-width: 640px) { .types { grid-template-columns: repeat(3, 1fr); } }

.tt {
  position: relative;
  display: grid;
  gap: 0.15rem;
  align-content: start;
  justify-items: start;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.95rem 0.85rem;
  transition: border-color 0.2s, transform 0.2s var(--ease-out), box-shadow 0.25s;
}
.tt:hover { border-color: var(--line-strong); transform: translateY(-2px); box-shadow: var(--shadow-soft); }
.tt--on { border-color: var(--coral); box-shadow: 0 0 0 1px var(--coral), var(--shadow-soft); }

.tt__icon {
  width: 2.7rem; height: 2.7rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  background: var(--bg-deep);
  color: var(--ink-soft);
  margin-bottom: 0.6rem;
  transition: background 0.2s, color 0.2s;
}
.tt--on .tt__icon { background: var(--coral-soft); color: var(--coral-deep); }

.tt__label { font-size: var(--fs-small); font-weight: 900; }
.tt__tag { font-size: var(--fs-caption); color: var(--muted); line-height: 1.6; }

.tt__check {
  position: absolute;
  top: 0.65rem;
  inset-inline-end: 0.65rem;
  width: 1.35rem; height: 1.35rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.25s var(--ease-out);
}
.tt--on .tt__check { opacity: 1; transform: scale(1); }
</style>
