<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ASelect · انتخابگر بومی استایل‌شده
// ─────────────────────────────────────────────────────────────
defineProps<{
  label?: string
  options: { value: string; label: string }[]
  placeholder?: string
  hint?: string
}>()
const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="a-select">
    <label v-if="label" :for="id" class="a-select__label">{{ label }}</label>
    <div class="a-select__box">
      <select :id="id" v-model="model">
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option v-for="o in options" :key="o.value" :value="o.value">{{ o.label }}</option>
      </select>
      <AIcon name="chevron-down" :size="16" class="a-select__chev" />
    </div>
    <p v-if="hint" class="a-select__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.a-select { display: grid; gap: 0.45rem; }
.a-select__label { font-size: var(--fs-small); font-weight: 800; }

.a-select__box { position: relative; }
select {
  width: 100%;
  appearance: none;
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding: 0.65rem 0.9rem;
  padding-inline-end: 2.4rem;
  font-size: var(--fs-body);
  min-height: 2.9rem;
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s;
}
select:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(33, 28, 21, 0.07); }
select:invalid { color: var(--faint); }

.a-select__chev {
  position: absolute;
  inset-inline-end: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
.a-select__hint { font-size: var(--fs-caption); color: var(--muted); }
</style>
