<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ATextarea · ورودی چندخطی
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  label?: string
  placeholder?: string
  hint?: string
  error?: string
  required?: boolean
  rows?: number
  maxlength?: number
  counter?: boolean
}>(), { rows: 4 })

const model = defineModel<string>({ default: '' })
const id = useId()
</script>

<template>
  <div class="a-textarea" :class="{ 'a-textarea--error': error }">
    <div class="a-textarea__head">
      <label v-if="label" :for="id" class="a-textarea__label">
        {{ label }}
        <span v-if="required" class="a-textarea__req" aria-hidden="true">*</span>
      </label>
      <span v-if="counter && maxlength" class="a-textarea__count">
        {{ new Intl.NumberFormat('fa-IR').format(model.length) }} / {{ new Intl.NumberFormat('fa-IR').format(maxlength) }}
      </span>
    </div>
    <textarea :id="id" v-model="model" :placeholder="placeholder" :rows="rows" :maxlength="maxlength" />
    <p v-if="error" class="a-textarea__error">{{ error }}</p>
    <p v-else-if="hint" class="a-textarea__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.a-textarea { display: grid; gap: 0.45rem; }
.a-textarea__head { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; }
.a-textarea__label { font-size: var(--fs-small); font-weight: 800; }
.a-textarea__req { color: var(--coral); }
.a-textarea__count { font-size: var(--fs-caption); color: var(--faint); font-variant-numeric: tabular-nums; }

textarea {
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding: 0.75rem 0.9rem;
  font-size: var(--fs-body);
  line-height: 1.9;
  resize: vertical;
  min-height: 6rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
textarea:focus { outline: none; border-color: var(--ink); box-shadow: 0 0 0 3px rgba(33, 28, 21, 0.07); }
textarea::placeholder { color: var(--faint); }
.a-textarea--error textarea { border-color: var(--coral); }

.a-textarea__hint { font-size: var(--fs-caption); color: var(--muted); }
.a-textarea__error { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
</style>
