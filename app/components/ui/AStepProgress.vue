<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AStepProgress · نشانگر گام‌های ویزارد (شماره فارسی + خط پیشرفت)
// ─────────────────────────────────────────────────────────────
const props = defineProps<{
  steps: { key: string; label: string }[]
  current: number
}>()

const fa = (n: number) => new Intl.NumberFormat('fa-IR').format(n)
</script>

<template>
  <div class="a-steps">
    <div class="a-steps__row" role="list">
      <template v-for="(s, i) in steps" :key="s.key">
        <div class="a-steps__item" role="listitem" :aria-current="i === current ? 'step' : undefined">
          <span
            class="a-steps__circle"
            :class="{
              'a-steps__circle--done': i < current,
              'a-steps__circle--current': i === current,
            }"
          >
            <AIcon v-if="i < current" name="check" :size="13" />
            <template v-else>{{ fa(i + 1) }}</template>
          </span>
          <span class="a-steps__label" :class="{ 'a-steps__label--current': i === current }">{{ s.label }}</span>
        </div>
        <span v-if="i < steps.length - 1" class="a-steps__line" :class="{ 'a-steps__line--done': i < current }" aria-hidden="true" />
      </template>
    </div>
    <p class="a-steps__counter">
      گام <strong>{{ fa(current + 1) }}</strong> از {{ fa(steps.length) }} · <span class="a-steps__name">{{ steps[current]?.label }}</span>
    </p>
  </div>
</template>

<style scoped>
.a-steps { display: grid; gap: 0.7rem; }

.a-steps__row {
  display: flex;
  align-items: flex-start;
}

.a-steps__item {
  display: grid;
  justify-items: center;
  gap: 0.4rem;
  min-width: 1.9rem;
}
.a-steps__circle {
  width: 1.9rem;
  height: 1.9rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  font-size: var(--fs-caption);
  font-weight: 800;
  background: var(--paper);
  border: 1.4px solid var(--line-strong);
  color: var(--faint);
  transition: all 0.3s var(--ease-out);
}
.a-steps__circle--done { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.a-steps__circle--current {
  background: var(--coral);
  border-color: var(--coral);
  color: #fff;
  animation: pulse-soft 2.4s ease-out infinite;
}

.a-steps__label {
  display: none;
  font-size: 0.66rem;
  font-weight: 700;
  color: var(--muted);
  white-space: nowrap;
}
.a-steps__label--current { color: var(--ink); }

.a-steps__line {
  flex: 1;
  height: 1.4px;
  margin-top: 0.95rem;
  background: var(--line-strong);
  min-width: 0.5rem;
  transition: background 0.3s;
}
.a-steps__line--done { background: var(--ink); }

.a-steps__counter {
  font-size: var(--fs-caption);
  color: var(--muted);
}
.a-steps__counter strong { color: var(--coral); }
.a-steps__name { color: var(--ink-soft); font-weight: 700; }

@media (min-width: 768px) {
  .a-steps__label { display: block; }
  .a-steps__counter { display: none; }
}
</style>
