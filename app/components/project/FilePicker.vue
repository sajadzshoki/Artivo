<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// FilePicker · انتخاب فایل محلی (DataURL) — سقف حجم و تعداد
// فاز توسعه: فایل در .data ذخیره می‌شود؛ فاز بک‌اند: آپلود واقعی.
// ─────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  max?: number
  maxKb?: number
  accept?: string
  label?: string
}>(), {
  max: 4,
  maxKb: 500,
  accept: 'image/*,application/pdf,.ai,.psd,.fig,.zip',
  label: 'افزودن فایل',
})

const model = defineModel<{ name: string; url: string; size: number }[]>({ default: () => [] })
const input = ref<HTMLInputElement | null>(null)
const error = ref('')

function pick() { input.value?.click() }

function onFiles(e: Event) {
  error.value = ''
  const files = (e.target as HTMLInputElement).files
  if (!files) return
  for (const file of Array.from(files)) {
    if (model.value.length >= props.max) {
      error.value = `حداکثر ${props.max} فایل.`
      break
    }
    if (file.size > props.maxKb * 1024) {
      error.value = `«${file.name}» بزرگ‌تر از ${props.maxKb} کیلوبایت است.`
      continue
    }
    const reader = new FileReader()
    reader.onload = () => {
      model.value = [...model.value, { name: file.name, url: String(reader.result), size: file.size }]
    }
    reader.readAsDataURL(file)
  }
  ;(e.target as HTMLInputElement).value = ''
}

function remove(i: number) {
  model.value = model.value.filter((_, k) => k !== i)
}

const kb = (n: number) => new Intl.NumberFormat('fa-IR').format(Math.max(1, Math.round(n / 1024)))
</script>

<template>
  <div class="fp">
    <input ref="input" type="file" :accept="accept" multiple class="fp__input" aria-hidden="true" tabindex="-1" @change="onFiles">
    <button type="button" class="fp__add" @click="pick">
      <AIcon name="paperclip" :size="16" />
      {{ label }}
      <small>{{ model.length }}/{{ max }} · تا {{ maxKb }}KB</small>
    </button>
    <p v-if="error" class="fp__err" role="alert">{{ error }}</p>
    <ul v-if="model.length" class="fp__list">
      <li v-for="(f, i) in model" :key="f.url.slice(-12) + i" class="fp__item">
        <img v-if="f.url.startsWith('data:image')" :src="f.url" :alt="f.name" class="fp__thumb">
        <span v-else class="fp__thumb fp__thumb--file"><AIcon name="file" :size="18" /></span>
        <span class="fp__name">{{ f.name }}</span>
        <span class="fp__size">{{ kb(f.size) }}KB</span>
        <button type="button" class="fp__x" :aria-label="`حذف ${f.name}`" @click="remove(i)">
          <AIcon name="x" :size="11" />
        </button>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.fp { display: grid; gap: 0.5rem; }
.fp__input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.fp__add {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1.5px dashed var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-md);
  padding: 0.75rem 1rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink-soft);
  transition: border-color 0.2s;
  min-height: 44px;
}
.fp__add:hover { border-color: var(--ink); }
.fp__add small { color: var(--faint); font-weight: 600; margin-inline-start: auto; }
.fp__err { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }
.fp__list { display: grid; gap: 0.4rem; }
.fp__item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-deep);
  border-radius: var(--r-sm);
  padding: 0.4rem 0.55rem;
}
.fp__thumb {
  width: 2.2rem;
  height: 2.2rem;
  border-radius: var(--r-xs);
  object-fit: cover;
  background: var(--paper);
  display: grid;
  place-items: center;
  color: var(--muted);
  flex-shrink: 0;
}
.fp__name { font-size: var(--fs-caption); font-weight: 700; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
.fp__size { font-size: 0.62rem; color: var(--faint); flex-shrink: 0; }
.fp__x {
  width: 1.5rem; height: 1.5rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--paper);
  color: var(--coral-deep);
  flex-shrink: 0;
}
</style>
