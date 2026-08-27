<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AInput · ورودی متنی
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  label?: string
  type?: string
  placeholder?: string
  hint?: string
  error?: string
  dir?: 'rtl' | 'ltr'
  icon?: string
  required?: boolean
  inputmode?: 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal'
  maxlength?: number
  disabled?: boolean
  suffix?: string
}>(), { type: 'text', dir: 'rtl' })

const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ blur: [e: FocusEvent] }>()
const id = useId()
</script>

<template>
  <div class="a-input" :class="{ 'a-input--error': error, 'a-input--ltr': dir === 'ltr' }">
    <label v-if="label" :for="id" class="a-input__label">
      {{ label }}
      <span v-if="required" class="a-input__req" aria-hidden="true">*</span>
    </label>
    <div class="a-input__box">
      <AIcon v-if="icon" :name="icon" :size="18" class="a-input__icon" />
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :maxlength="maxlength"
        :disabled="disabled"
        :dir="dir"
        @blur="emit('blur', $event)"
      >
      <span v-if="suffix" class="a-input__suffix">{{ suffix }}</span>
      <slot name="end" />
    </div>
    <p v-if="error" class="a-input__error">{{ error }}</p>
    <p v-else-if="hint" class="a-input__hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.a-input { display: grid; gap: 0.45rem; }
.a-input__label { font-size: var(--fs-small); font-weight: 800; }
.a-input__req { color: var(--coral); }

.a-input__box {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  background: var(--paper);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding-inline: 0.9rem;
  min-height: 2.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.a-input__box:focus-within {
  border-color: var(--ink);
  box-shadow: 0 0 0 3px rgba(33, 28, 21, 0.07);
}
.a-input--error .a-input__box { border-color: var(--coral); }
.a-input--error .a-input__box:focus-within { box-shadow: 0 0 0 3px rgba(255, 90, 60, 0.14); }

.a-input__icon { color: var(--faint); flex-shrink: 0; }
.a-input__box:focus-within .a-input__icon { color: var(--ink); }

input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--fs-body);
  padding-block: 0.6rem;
}
input::placeholder { color: var(--faint); }
.a-input--ltr input { text-align: left; font-family: var(--font-fa); }

.a-input__suffix { font-size: var(--fs-small); color: var(--muted); flex-shrink: 0; }
.a-input__hint { font-size: var(--fs-caption); color: var(--muted); }
.a-input__error { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
</style>
