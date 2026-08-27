<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AChip · چیپ قابل‌انتخاب / نمایشی
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  label: string
  icon?: string
  interactive?: boolean
  tone?: 'neutral' | 'coral' | 'indigo' | 'green'
  size?: 'sm' | 'md'
}>(), { interactive: true, tone: 'neutral', size: 'md' })

const model = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    v-if="interactive"
    type="button"
    class="a-chip"
    :class="[`a-chip--${tone}`, `a-chip--${size}`, { 'a-chip--on': model }]"
    :aria-pressed="model"
    @click="model = !model"
  >
    <AIcon v-if="icon" :name="icon" :size="size === 'sm' ? 13 : 15" />
    <span>{{ label }}</span>
    <AIcon v-if="model" name="check" :size="size === 'sm' ? 12 : 14" />
  </button>
  <span v-else class="a-chip" :class="[`a-chip--${tone}`, `a-chip--${size}`, 'a-chip--static']">
    <AIcon v-if="icon" :name="icon" :size="size === 'sm' ? 13 : 15" />
    <span>{{ label }}</span>
  </span>
</template>

<style scoped>
.a-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: var(--r-pill);
  font-weight: 700;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  color: var(--ink-soft);
  transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.15s;
}
.a-chip--md { padding: 0.42rem 0.85rem; font-size: var(--fs-small); }
.a-chip--sm { padding: 0.28rem 0.65rem; font-size: var(--fs-caption); }

button.a-chip:hover { border-color: var(--ink); color: var(--ink); }
button.a-chip:active { transform: scale(0.97); }

.a-chip--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.a-chip--coral.a-chip--on { background: var(--coral); border-color: var(--coral); color: #fff; }
.a-chip--indigo.a-chip--on { background: var(--indigo); border-color: var(--indigo); color: #fff; }
.a-chip--green.a-chip--on { background: var(--green); border-color: var(--green); color: #fff; }

.a-chip--static { cursor: default; }
</style>
