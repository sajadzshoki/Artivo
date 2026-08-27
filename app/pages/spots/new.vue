<script setup lang="ts">
import type { SpotCategoryId } from '#shared/types'
import { bestTimePresets, spotCategories, spotCategoryLabels } from '#shared/config/spot-categories'
import { useSpots } from '~/composables/useSpots'

// ─────────────────────────────────────────────────────────────
// افزودن لوکیشن عکاسی — نقشه‌ی انتخاب نقطه + فرم میدانی
// موبایل: تک‌ستونه · دسکتاپ: نقشه‌ی چسبان کنار فرم
// ─────────────────────────────────────────────────────────────
useHead({ title: 'افزودن لوکیشن عکاسی — آرتیوو' })

const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')
const { addSpot } = useSpots()

// ── فرم ──
const name = ref('')
const city = ref('')
const address = ref('')
const description = ref('')
const tip = ref('')
const bestTime = ref('ساعت طلایی غروب')
const customTime = ref('')
const categories = ref<SpotCategoryId[]>([])
const tags = ref<string[]>([])
const tagInput = ref('')
const photos = ref<{ url: string; author: string }[]>([])
const authorName = ref('')

const lat = ref<number | null>(35.7219)
const lng = ref<number | null>(51.389)
const mapCenter = computed(() => ({ lat: lat.value ?? 35.7219, lng: lng.value ?? 51.389 }))

const latText = computed({
  get: () => (lat.value == null ? '' : String(lat.value)),
  set: (v: string) => { lat.value = v.trim() === '' ? null : Number(v) },
})
const lngText = computed({
  get: () => (lng.value == null ? '' : String(lng.value)),
  set: (v: string) => { lng.value = v.trim() === '' ? null : Number(v) },
})

function onMapPick(p: { lat: number; lng: number }) {
  lat.value = Number(p.lat.toFixed(6))
  lng.value = Number(p.lng.toFixed(6))
}

// ── دسته‌بندی‌ها ──
function toggleCategory(id: SpotCategoryId) {
  categories.value = categories.value.includes(id)
    ? categories.value.filter(c => c !== id)
    : [...categories.value, id]
}

// ── تگ‌ها ──
function addTag() {
  const t = tagInput.value.trim().replace(/^#/, '')
  if (t && !tags.value.includes(t) && tags.value.length < 6) tags.value.push(t)
  tagInput.value = ''
}
function removeTag(t: string) {
  tags.value = tags.value.filter(x => x !== t)
}

// ── نشانی خودکار از نشان (پروکسی سمت سرور) ──
const lookingUp = ref(false)
async function lookupAddress() {
  if (lat.value == null || lng.value == null) {
    toast.error('اول روی نقشه یک نقطه انتخاب کن')
    return
  }
  lookingUp.value = true
  try {
    const res = await $fetch<{ ok: boolean; address?: string; city?: string }>(`/api/neshan/reverse`, {
      params: { lat: lat.value, lng: lng.value },
    })
    if (res.ok && res.address) {
      address.value = res.address
      if (!city.value && res.city) city.value = res.city
      toast.success('نشانی از نقشه دریافت شد')
    }
    else {
      toast.info('سرویس نشانی در دسترس نیست', 'نشانی را دستی وارد کن.')
    }
  }
  catch {
    toast.info('سرویس نشانی در دسترس نیست', 'نشانی را دستی وارد کن.')
  }
  finally {
    lookingUp.value = false
  }
}

// ── اعتبارسنجی و ارسال ──
const tried = ref(false)
const errors = computed(() => {
  const e: Record<string, string> = {}
  if (!name.value.trim()) e.name = 'نام لوکیشن لازم است.'
  if (!city.value.trim()) e.city = 'شهر را بنویس.'
  if (lat.value == null || lng.value == null) e.location = 'موقعیت روی نقشه انتخاب نشده.'
  if (!categories.value.length) e.categories = 'حداقل یک نوع عکاسی انتخاب کن.'
  return e
})
const isValid = computed(() => Object.keys(errors.value).length === 0)

const saving = ref(false)
async function submit() {
  tried.value = true
  if (!isValid.value) {
    toast.error('چند جای فرم کم دارد', 'موارد مشخص‌شده را کامل کن.')
    return
  }
  saving.value = true
  try {
    const spot = addSpot({
      name: name.value,
      city: city.value,
      address: address.value,
      description: description.value || 'لوکیشن عکاسی که توسط جامعه‌ی آرتیوو اضافه شده است.',
      tip: tip.value,
      bestTime: customTime.value.trim() || bestTime.value,
      location: { lat: lat.value!, lng: lng.value! },
      categories: categories.value,
      tags: tags.value,
      photos: photos.value,
    })
    toast.success('لوکیشن ثبت شد', `«${spot.name}» به نقشه اضافه شد.`)
    await navigateTo(`/spots/${spot.id}`)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container">
    <header class="page-head" v-reveal>
      <p class="overline">Contribute</p>
      <h1 class="t-h1 page-head__title">افزودن لوکیشن عکاسی</h1>
      <p class="t-body page-head__desc">
        یک جای خوب برای عکاسی می‌شناسی که این‌جا نیست؟ روی نقشه انتخابش کن، نکته‌ی نورش را بنویس
        و بگذار بقیه هم از آن عکس بگیرند. در این مرحله لوکیشن روی همین دستگاه ذخیره می‌شود.
      </p>
    </header>

    <div class="form-layout">
      <!-- ── فرم ── -->
      <form class="form" novalidate @submit.prevent="submit">
        <section class="panel" v-reveal>
          <h2 class="panel__h">هویت لوکیشن</h2>
          <div class="grid2">
            <AInput v-model="name" label="نام لوکیشن" placeholder="مثلاً پله‌های کندوان" required :error="tried ? errors.name : ''" />
            <AInput v-model="city" label="شهر" placeholder="مثلاً تهران" required :error="tried ? errors.city : ''" />
          </div>
          <div class="addr">
            <AInput v-model="address" label="نشانی (اختیاری)" placeholder="خیوان، محله، نشانی دقیق…" />
            <AButton variant="outline" size="sm" :loading="lookingUp" icon="compass" @click="lookupAddress">
              از نقشه
            </AButton>
          </div>
          <ATextarea v-model="description" label="توضیحات" placeholder="چه چیزی این‌جا را برای عکاسی خاص می‌کند؟" :rows="3" :maxlength="600" counter />
          <ATextarea v-model="tip" label="نکته‌ی عکاسی" placeholder="مثلاً: بعد از باران، آسفالت بازتاب نور غروب را می‌گیرد." :rows="2" :maxlength="220" counter />
        </section>

        <section class="panel" v-reveal>
          <h2 class="panel__h">نوع عکاسی</h2>
          <div class="cats" :class="{ 'cats--error': tried && errors.categories }" role="group" aria-label="نوع عکاسی">
            <button
              v-for="c in spotCategories"
              :key="c.id"
              type="button"
              class="cat"
              :class="{ 'cat--on': categories.includes(c.id) }"
              :aria-pressed="categories.includes(c.id)"
              @click="toggleCategory(c.id)"
            >
              <AIcon :name="categories.includes(c.id) ? 'check' : 'plus'" :size="13" />
              {{ spotCategoryLabels[c.id] }}
            </button>
          </div>
          <p v-if="tried && errors.categories" class="err">{{ errors.categories }}</p>
        </section>

        <section class="panel" v-reveal>
          <h2 class="panel__h">بهترین زمان نور</h2>
          <AFilterChips v-model="bestTime" :options="bestTimePresets.map(t => ({ value: t, label: t }))" label="پریست‌های زمان" />
          <AInput v-model="customTime" label="یا زمان دلخواه" placeholder="مثلاً: ۷ تا ۹ صبح، شنبه‌ها کم‌رفت‌وآمد است" class="q-time" />
        </section>

        <section class="panel" v-reveal>
          <h2 class="panel__h">تگ‌ها</h2>
          <div class="tagin">
            <AInput v-model="tagInput" label="تگ (Enter برای افزودن)" placeholder="معماری، آجری، شب‌های بارانی…" :maxlength="24" @keydown.enter.prevent="addTag" />
            <AButton variant="soft" size="sm" icon="plus" @click="addTag">افزودن</AButton>
          </div>
          <div v-if="tags.length" class="taglist">
            <span v-for="t in tags" :key="t" class="tag">
              #{{ t }}
              <button type="button" class="tag__x" :aria-label="`حذف ${t}`" @click="removeTag(t)">
                <AIcon name="x" :size="12" />
              </button>
            </span>
          </div>
          <p class="t-caption hint">{{ fa.format(tags.length) }} از ۶ تگ</p>
        </section>

        <section class="panel" v-reveal>
          <h2 class="panel__h">عکس‌ها (اختیاری)</h2>
          <AInput v-model="authorName" label="نام عکاس" placeholder="نام خودت" class="q-author" />
          <PhotoUploader v-model="photos" :max="4" />
        </section>

        <!-- ارسال -->
        <div class="submit" v-reveal>
          <p class="t-caption hint">
            با ثبت لوکیشن، محتوای مفید و بدون تخلف اضافه می‌کنی. چیزهای اضافه‌شده پس از بررسی جامعه نمایش داده می‌شوند.
          </p>
          <AButton type="submit" size="lg" :loading="saving" icon-end="arrow-left" block>
            ثبت لوکیشن روی نقشه
          </AButton>
        </div>
      </form>

      <!-- ── نقشه‌ی انتخاب ── -->
      <aside class="pick" v-reveal>
        <div class="pick__sticky">
          <div class="pick__head">
            <h2 class="panel__h">انتخاب موقعیت روی نقشه</h2>
            <p class="t-caption hint">روی نقشه بزن؛ مختصات خودکار پر می‌شود.</p>
          </div>
          <SpotMap
            mode="pick"
            :center="mapCenter"
            :zoom="14"
            height="22rem"
            class="pick__map"
            @update:center="onMapPick"
          />
          <div class="coords">
            <AInput v-model="latText" label="عرض جغرافیایی" dir="ltr" inputmode="decimal" placeholder="35.7219" class="coords__in" />
            <AInput v-model="lngText" label="طول جغرافیایی" dir="ltr" inputmode="decimal" placeholder="51.3890" class="coords__in" />
          </div>
          <p v-if="tried && errors.location" class="err">{{ errors.location }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3.5rem) 1.2rem; display: grid; gap: 0.3rem; }
.page-head__title { margin-top: 0.2rem; }
.page-head__desc { max-width: 34rem; }

.form-layout { display: grid; gap: 1.2rem; margin-top: 0.5rem; }
@media (min-width: 900px) {
  .form-layout { grid-template-columns: 1fr 23rem; align-items: start; }
  .pick { position: sticky; top: 5rem; }
  .pick { order: 2; }
}

.form { display: grid; gap: 1rem; min-width: 0; }
.panel { display: grid; gap: 0.85rem; padding: 1.15rem; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-lg); }
.panel__h { font-size: var(--fs-md); font-weight: 900; }

.grid2 { display: grid; gap: 0.85rem; }
@media (min-width: 560px) { .grid2 { grid-template-columns: 1fr 1fr; } }

.addr { display: flex; align-items: flex-end; gap: 0.5rem; }
.addr > :first-child { flex: 1; }

.cats { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.cat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.42rem 0.85rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink-soft);
  transition: all 0.18s;
}
.cat:hover { border-color: var(--ink); }
.cat--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

.cats--error { outline: 1.5px solid var(--coral); outline-offset: 3px; border-radius: var(--r-sm); }
.err { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.q-time, .q-author { max-width: 26rem; }

.tagin { display: flex; align-items: flex-end; gap: 0.5rem; }
.tagin > :first-child { flex: 1; max-width: 22rem; }
.taglist { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.tag {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  font-size: var(--fs-caption);
  font-weight: 800;
  border-radius: var(--r-pill);
  padding: 0.28rem 0.45rem 0.28rem 0.7rem;
}
.tag__x {
  width: 1.25rem;
  height: 1.25rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: color-mix(in srgb, var(--indigo-deep) 12%, transparent);
}

.hint { color: var(--faint); }

.pick { display: grid; gap: 0.8rem; }
.pick__sticky { display: grid; gap: 0.8rem; }
.pick__head { display: grid; gap: 0.2rem; }
.pick__map { border-radius: var(--r-lg); }
.coords { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }

.submit { display: grid; gap: 0.7rem; padding: 1.1rem; border: 1px dashed var(--line-strong); border-radius: var(--r-lg); }
@media (min-width: 640px) {
  .submit { grid-template-columns: 1fr auto; align-items: center; }
  .submit :last-child { min-width: 14rem; }
}
</style>
