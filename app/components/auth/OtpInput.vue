<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// OtpInput · ورودی کد ۴ رقمی — جعبه‌های جدا با پرش خودکار
// ─────────────────────────────────────────────────────────────
const model = defineModel<string>({ default: '' })

const digits = ref<string[]>(['', '', '', ''])
const boxes = ref<(HTMLInputElement | null)[]>([])

watch(() => model.value, (v) => {
  const s = (v ?? '').replace(/\D/g, '').slice(0, 4)
  if (s !== digits.value.join('')) {
    digits.value = [s[0] ?? '', s[1] ?? '', s[2] ?? '', s[3] ?? '']
  }
}, { immediate: true })

function emitModel() {
  model.value = digits.value.join('')
}

function onInput(i: number, e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '')
  if (raw.length > 1) {
    // پیست چندرقمی
    const chars = raw.slice(0, 4 - i).split('')
    chars.forEach((c, k) => { digits.value[i + k] = c })
    emitModel()
    boxes.value[Math.min(3, i + chars.length)]?.focus()
    return
  }
  digits.value[i] = raw
  emitModel()
  if (raw && i < 3) boxes.value[i + 1]?.focus()
}

function onKeydown(i: number, e: KeyboardEvent) {
  if (e.key === 'Backspace' && !digits.value[i] && i > 0) {
    boxes.value[i - 1]?.focus()
  }
}
</script>

<template>
  <div class="otp" dir="ltr">
    <input
      v-for="i in 4"
      :key="i"
      :ref="el => (boxes[i - 1] = el as HTMLInputElement)"
      class="otp__box"
      type="text"
      inputmode="numeric"
      autocomplete="one-time-code"
      maxlength="4"
      :value="digits[i - 1]"
      :aria-label="`رقم ${i} کد`"
      @input="onInput(i - 1, $event)"
      @keydown="onKeydown(i - 1, $event)"
    >
  </div>
</template>

<style scoped>
.otp { display: flex; gap: 0.6rem; justify-content: center; }
.otp__box {
  width: 3.4rem;
  height: 4rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 900;
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--line-strong);
  border-radius: var(--r-md);
  transition: border-color 0.2s, box-shadow 0.2s;
}
.otp__box:focus {
  outline: none;
  border-color: var(--coral);
  box-shadow: 0 0 0 3px var(--coral-soft);
}
</style>
