<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// PhotoUploader · آپلود عکس (Phase 4: پیش‌نمایش Data URL محلی)
// در فاز بعد آپلود واقعی به storage جایگزین می‌شود؛ امضای
// update:modelValue ثابت می‌ماند.
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  max?: number
  maxTotalKb?: number
}>(), { max: 4, maxTotalKb: 1600 })

const model = defineModel<{ url: string; author: string }[]>({ default: () => [] })

const input = ref<HTMLInputElement | null>(null)
const error = ref('')

function pick() { input.value?.click() }

function onFiles(e: Event) {
  error.value = ''
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    if (model.value.length >= props.max) {
      error.value = `حداکثر ${props.max} عکس در این مرحله.`
      break
    }
    if (!file.type.startsWith('image/')) {
      error.value = 'فقط فایل تصویری پذیرفته می‌شود.'
      continue
    }
    if (file.size > 700_000) {
      error.value = 'هر عکس حداکثر ۷۰۰ کیلوبایت (در نسخه‌ی نهایی فشرده‌سازی خودکار دارد).'
      continue
    }
    const reader = new FileReader()
    reader.onload = () => {
      model.value = [...model.value, { url: String(reader.result), author: 'مهمان' }]
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}

function removeAt(i: number) {
  model.value = model.value.filter((_, idx) => idx !== i)
}
</script>

<template>
  <div class="pu">
    <div class="pu__grid">
      <button
        v-for="(ph, i) in model"
        :key="i"
        type="button"
        class="pu__item"
        :aria-label="`حذف عکس ${i + 1}`"
        @click="removeAt(i)"
      >
        <img :src="ph.url" alt="">
        <span class="pu__del"><AIcon name="x" :size="14" /></span>
      </button>

      <button
        v-if="model.length < max"
        type="button"
        class="pu__add"
        @click="pick"
      >
        <AIcon name="camera" :size="22" />
        <span>افزودن عکس</span>
        <span class="pu__hint">تا {{ max }} عکس</span>
      </button>
    </div>
    <input ref="input" type="file" accept="image/*" multiple class="visually-hidden" @change="onFiles">
    <p v-if="error" class="pu__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.pu__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.pu__item {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  padding: 0;
}
.pu__item img { width: 100%; height: 100%; object-fit: cover; }
.pu__del {
  position: absolute;
  top: 0.3rem;
  inset-inline-end: 0.3rem;
  width: 1.7rem;
  height: 1.7rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: rgba(26, 21, 14, 0.7);
  color: #fff;
}

.pu__add {
  aspect-ratio: 4 / 3;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.15rem;
  border: 1.5px dashed var(--line-strong);
  border-radius: var(--r-sm);
  background: var(--paper);
  color: var(--muted);
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}
.pu__add:hover { border-color: var(--coral); color: var(--coral-deep); background: var(--coral-soft); }
.pu__add span:first-of-type { font-size: var(--fs-caption); font-weight: 800; }
.pu__hint { font-size: 0.62rem; opacity: 0.7; }

.pu__error { margin-top: 0.5rem; font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
</style>
