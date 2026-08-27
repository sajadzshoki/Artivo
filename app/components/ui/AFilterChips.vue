<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AFilterChips · ردیف چیپ تک‌انتخابی برای فیلترها
// ─────────────────────────────────────────────────────────────
defineProps<{
  options: { value: string; label: string; icon?: string }[]
  label?: string
}>()
const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="a-filters" role="group" :aria-label="label">
    <button
      v-for="o in options"
      :key="o.value"
      type="button"
      class="a-filters__chip"
      :class="{ 'a-filters__chip--on': model === o.value }"
      :aria-pressed="model === o.value"
      @click="model = o.value"
    >
      <AIcon v-if="o.icon" :name="o.icon" :size="14" />
      {{ o.label }}
    </button>
  </div>
</template>

<style scoped>
.a-filters {
  display: flex;
  gap: 0.45rem;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  margin-inline: calc(var(--gutter) * -1);
  padding-inline: var(--gutter);
  padding-block: 0.3rem 0.5rem;
}
.a-filters::-webkit-scrollbar { display: none; }

.a-filters__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
  border-radius: var(--r-pill);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  color: var(--ink-soft);
  font-size: var(--fs-small);
  font-weight: 700;
  padding: 0.42rem 0.9rem;
  white-space: nowrap;
  transition: all 0.2s;
}
.a-filters__chip:hover { border-color: var(--ink); color: var(--ink); }
.a-filters__chip--on {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--bg);
}
</style>
