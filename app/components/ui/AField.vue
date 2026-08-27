<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AField · قاب فیلد (برچسب + راهنما + خطا) برای محتوای دلخواه
// ─────────────────────────────────────────────────────────────
withDefaults(defineProps<{
  label?: string
  hint?: string
  error?: string
  required?: boolean
}>(), {})
const id = useId()
</script>

<template>
  <div class="a-field" :class="{ 'a-field--error': error }">
    <label v-if="label" :for="id" class="a-field__label">
      {{ label }}
      <span v-if="required" class="a-field__req" aria-hidden="true">*</span>
    </label>
    <slot :id="id" />
    <p v-if="error" class="a-field__error">{{ error }}</p>
    <p v-else-if="hint" class="a-field__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.a-field { display: grid; gap: 0.45rem; }
.a-field__label { font-size: var(--fs-small); font-weight: 800; color: var(--ink); }
.a-field__req { color: var(--coral); }
.a-field__hint { font-size: var(--fs-caption); color: var(--muted); }
.a-field__error { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
</style>
