<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ACheck · ردیف چک‌باکس (سرویس‌های اختیاری، تایید نهایی و…)
// ─────────────────────────────────────────────────────────────
defineProps<{
  label: string
  description?: string
  trailing?: string
  icon?: string
}>()
const model = defineModel<boolean>({ default: false })
const id = useId()
</script>

<template>
  <label :for="id" class="a-check" :class="{ 'a-check--on': model }">
    <input :id="id" v-model="model" type="checkbox" class="a-check__native">
    <span class="a-check__box" aria-hidden="true">
      <AIcon name="check" :size="13" />
    </span>
    <AIcon v-if="icon" :name="icon" :size="18" class="a-check__icon" />
    <span class="a-check__body">
      <span class="a-check__label">{{ label }}</span>
      <span v-if="description" class="a-check__desc">{{ description }}</span>
    </span>
    <span v-if="trailing" class="a-check__trailing">{{ trailing }}</span>
  </label>
</template>

<style scoped>
.a-check {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.75rem 0.9rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
}
.a-check:hover { border-color: var(--line-strong); }
.a-check--on { border-color: var(--ink); box-shadow: var(--shadow-soft); }

.a-check__native { position: absolute; opacity: 0; pointer-events: none; }

.a-check__box {
  flex-shrink: 0;
  width: 1.35rem;
  height: 1.35rem;
  display: grid;
  place-items: center;
  border-radius: 7px;
  border: 1.6px solid var(--line-strong);
  background: var(--paper);
  color: transparent;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.a-check--on .a-check__box { background: var(--coral); border-color: var(--coral); color: #fff; }
.a-check__native:focus-visible + .a-check__box { outline: 2px solid var(--coral); outline-offset: 2px; }

.a-check__icon { color: var(--faint); flex-shrink: 0; }
.a-check--on .a-check__icon { color: var(--coral); }

.a-check__body { display: grid; gap: 0.05rem; min-width: 0; }
.a-check__label { font-size: var(--fs-small); font-weight: 800; }
.a-check__desc { font-size: var(--fs-caption); color: var(--muted); }

.a-check__trailing { margin-inline-start: auto; font-size: var(--fs-caption); font-weight: 800; color: var(--ink); white-space: nowrap; }
</style>
