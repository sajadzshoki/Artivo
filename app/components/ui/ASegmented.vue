<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ASegmented · انتخابگر بخشی (تغییر حالت سریع)
// ─────────────────────────────────────────────────────────────
defineProps<{
  options: { value: string; label: string; hint?: string }[]
  label?: string
}>()
const model = defineModel<string>()
</script>

<template>
  <div class="a-seg">
    <span v-if="label" class="a-seg__label">{{ label }}</span>
    <div class="a-seg__track" role="radiogroup">
      <button
        v-for="o in options"
        :key="o.value"
        type="button"
        role="radio"
        :aria-checked="model === o.value"
        class="a-seg__item"
        :class="{ 'a-seg__item--active': model === o.value }"
        @click="model = o.value"
      >
        <span class="a-seg__text">{{ o.label }}</span>
        <span v-if="o.hint" class="a-seg__hint">{{ o.hint }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.a-seg { display: grid; gap: 0.5rem; }
.a-seg__label { font-size: var(--fs-small); font-weight: 800; }

.a-seg__track {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.25rem;
  background: var(--bg-deep);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  padding: 0.3rem;
}
.a-seg__item {
  display: grid;
  justify-items: center;
  gap: 0.05rem;
  border-radius: var(--r-pill);
  padding: 0.45rem 0.6rem;
  text-align: center;
  color: var(--muted);
  transition: background 0.25s, color 0.25s, box-shadow 0.25s;
}
.a-seg__text { font-size: var(--fs-small); font-weight: 800; white-space: nowrap; }
.a-seg__hint { font-size: 0.66rem; color: inherit; opacity: 0.75; white-space: nowrap; }

.a-seg__item--active {
  background: var(--paper);
  color: var(--ink);
  box-shadow: var(--shadow-soft);
}
</style>
