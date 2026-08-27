<script setup lang="ts">
import type { Creative } from '#shared/types'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// ─────────────────────────────────────────────────────────────
// پروفایل خلاق — پیوند به پروفایل ادیتوریال موجود (seed) یا ساخت
// پروفایل عمومی تازه؛ هر دو از این صفحه مدیریت می‌شوند.
// ─────────────────────────────────────────────────────────────
useHead({ title: 'پروفایل خلاق — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const toast = useToast()
const { user, setUser } = useAuth()

const profile = ref<Creative | null>(null)
const source = ref<'seed' | 'community' | null>(null)
const loading = ref(true)

async function load() {
  loading.value = true
  try {
    const res = await $fetch<{ profile: Creative | null; source: 'seed' | 'community' | null }>('/api/profile/creative')
    profile.value = res.profile
    source.value = res.source
  }
  finally {
    loading.value = false
  }
}
onMounted(load)

// ── فرم مشترک ──
const form = reactive({
  kind: 'designer' as 'designer' | 'photographer',
  role: '',
  city: '',
  bio: '',
  startingPrice: '',
  experienceYears: '',
  skills: [] as string[],
  categories: [] as string[],
})
const skillInput = ref('')
const errors = ref<Record<string, string>>({})
const saving = ref(false)

function fillForm(p: Creative) {
  form.kind = p.kind
  form.role = p.role
  form.city = p.city
  form.bio = p.bio
  form.startingPrice = p.startingPrice ? String(p.startingPrice) : ''
  form.experienceYears = String(p.experienceYears ?? 0)
  form.skills = [...(p.skills ?? [])]
  form.categories = [...(p.categories ?? [])]
}

watch(profile, (p) => {
  if (p && !dirty.value) fillForm(p)
})

const dirty = ref(false)
function markDirty() { dirty.value = true }

function addSkill() {
  const s = skillInput.value.trim()
  if (s && !form.skills.includes(s) && form.skills.length < 10) {
    form.skills.push(s)
    markDirty()
  }
  skillInput.value = ''
}
function removeSkill(s: string) {
  form.skills = form.skills.filter(x => x !== s)
  markDirty()
}
function toggleCat(c: string) {
  form.categories = form.categories.includes(c)
    ? form.categories.filter(x => x !== c)
    : [...form.categories, c]
  markDirty()
}

function validate(): boolean {
  errors.value = {}
  if (form.role.trim().length < 2) errors.value.role = 'عنوان نقش را بنویس.'
  if (!form.city.trim()) errors.value.city = 'شهر لازم است.'
  if (!form.categories.length) errors.value.categories = 'حداقل یک دسته انتخاب کن.'
  if (form.bio.trim().length < 30) errors.value.bio = 'بیو حداقل ۳۰ کاراکتر باشد.'
  const price = Number(form.startingPrice || '0')
  if (!Number.isFinite(price) || price < 0) errors.value.startingPrice = 'قیمت معتبر نیست.'
  return Object.keys(errors.value).length === 0
}

async function submit() {
  if (!validate()) return
  saving.value = true
  const body = {
    kind: form.kind,
    role: form.role.trim(),
    city: form.city.trim(),
    bio: form.bio.trim(),
    startingPrice: Number(form.startingPrice || '0'),
    experienceYears: Number(form.experienceYears || '0'),
    skills: form.skills,
    categories: form.categories,
  }
  try {
    const res = await $fetch<{ profile: Creative; user?: import('#shared/types').PublicUser }>(
      source.value ? '/api/profile/creative' : '/api/profile/creative',
      { method: source.value ? 'PUT' : 'POST', body },
    )
    profile.value = res.profile
    source.value = source.value ?? 'community'
    if (res.user) setUser(res.user)
    dirty.value = false
    toast.success(source.value === 'seed' ? 'پروفایل به‌روز شد' : 'پروفایل خلاقت ساخته شد', 'در فهرست خلاق‌های آرتیوو دیده می‌شود.')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    if (e?.data?.data?.field) errors.value[e.data.data.field] = e?.data?.message ?? ''
    else toast.error('ذخیره نشد', e?.data?.message)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container pcr">
    <header class="page-head" v-reveal>
      <NuxtLink to="/profile" class="crumbs">
        <AIcon name="arrow-right" :size="14" />
        پروفایل
      </NuxtLink>
      <h1 class="t-h1 page-head__title">پروفایل خلاق</h1>
      <p class="t-body page-head__desc">
        <template v-if="source === 'seed'">
          پروفایل ادیتوریال تو در آرتیوو ثبت است؛ همین‌جا می‌توانی مشخصاتش را به‌روز کنی.
        </template>
        <template v-else>
          پروفایل عمومی خلاق بساز تا کارفرماها در فهرست خلاق‌ها ببینندت.
        </template>
      </p>
    </header>

    <div v-if="loading" class="panel" style="padding:1rem;max-width:40rem">
      <ASkeleton h="6rem" radius="16px" />
    </div>

    <form v-else class="pcr__form" novalidate @submit.prevent="submit">
      <section class="panel block" v-reveal>
        <h2 class="block__h">معرفی</h2>
        <div class="kindrow">
          <button type="button" class="kind" :class="{ 'kind--on': form.kind === 'designer' }" @click="form.kind = 'designer'; markDirty()">
            <AIcon name="pen" :size="17" />
            طراح
          </button>
          <button type="button" class="kind" :class="{ 'kind--on': form.kind === 'photographer' }" @click="form.kind = 'photographer'; markDirty()">
            <AIcon name="camera" :size="17" />
            عکاس
          </button>
        </div>
        <div class="block__grid">
          <AInput v-model="form.role" label="عنوان نقش" placeholder="مثلاً طراح پوستر و هویت بصری" :error="errors.role" @update:model-value="markDirty" />
          <AInput v-model="form.city" label="شهر" placeholder="مثلاً تهران" :error="errors.city" @update:model-value="markDirty" />
          <AInput v-model="form.startingPrice" label="قیمت شروع (تومان)" placeholder="1500000" dir="ltr" inputmode="numeric" :error="errors.startingPrice" @update:model-value="markDirty" />
          <AInput v-model="form.experienceYears" label="سابقه (سال)" placeholder="5" dir="ltr" inputmode="numeric" @update:model-value="markDirty" />
        </div>
        <ATextarea v-model="form.bio" label="بیو" placeholder="چه کاری بلدی و چه حسی در کارت می‌گذاری؟" :rows="3" :maxlength="600" counter :error="errors.bio" @update:model-value="markDirty" />
      </section>

      <section class="panel block" v-reveal>
        <h2 class="block__h">دسته‌ها و مهارت‌ها</h2>
        <div class="cats" :class="{ 'cats--error': errors.categories }" role="group" aria-label="دسته‌ها">
          <button
            v-for="(label, id) in serviceCategoryLabels"
            :key="id"
            type="button"
            class="cat"
            :class="{ 'cat--on': form.categories.includes(id) }"
            :aria-pressed="form.categories.includes(id)"
            @click="toggleCat(id)"
          >
            <AIcon :name="form.categories.includes(id) ? 'check' : 'plus'" :size="13" />
            {{ label }}
          </button>
        </div>
        <p v-if="errors.categories" class="err">{{ errors.categories }}</p>

        <div class="skillin">
          <AInput v-model="skillInput" label="مهارت‌ها" placeholder="مثلاً طراحی لوگو — Enter" @keydown.enter.prevent="addSkill" @update:model-value="markDirty" />
        </div>
        <div v-if="form.skills.length" class="skills">
          <span v-for="s in form.skills" :key="s" class="skill">
            {{ s }}
            <button type="button" class="skill__x" :aria-label="`حذف ${s}`" @click="removeSkill(s)">
              <AIcon name="x" :size="11" />
            </button>
          </span>
        </div>
      </section>

      <div class="pcr__actions" v-reveal>
        <p class="t-caption pcr__hint">
          <template v-if="source === 'seed'">ویرایش‌ها بعد از ذخیره در صفحه‌ی عمومی‌ات هم دیده می‌شوند.</template>
          <template v-else>{{ dirty ? 'تغییرهای ذخیره‌نشده داری.' : 'همه‌چیز ذخیره است.' }}</template>
        </p>
        <AButton type="submit" :loading="saving">
          {{ source ? 'ذخیره‌ی تغییرها' : 'ساخت پروفایل خلاق' }}
        </AButton>
      </div>

      <NuxtLink v-if="profile" :to="`/creatives/${profile.id}`" class="pcr__view">
        دیدن پروفایل عمومی
        <AIcon name="arrow-left" :size="14" />
      </NuxtLink>
    </form>
  </div>
</template>

<style scoped>
.crumbs {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--muted);
}
.crumbs:hover { color: var(--ink); }
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.5rem; }
.page-head__desc { max-width: 30rem; color: var(--muted); }

.pcr__form { display: grid; gap: 1rem; max-width: 40rem; }
.block { display: grid; gap: 0.9rem; padding: 1.3rem; }
.block__h { font-size: var(--fs-md); font-weight: 900; }
.block__grid { display: grid; gap: 0.9rem; }
@media (min-width: 640px) { .block__grid { grid-template-columns: 1fr 1fr; } }

.kindrow { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; max-width: 20rem; }
.kind {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: 1.5px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-md);
  padding: 0.6rem;
  font-weight: 800;
  font-size: var(--fs-small);
  transition: all 0.15s;
}
.kind--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

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

.skills { display: flex; flex-wrap: wrap; gap: 0.4rem; }
.skill {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  font-size: var(--fs-caption);
  font-weight: 800;
  border-radius: var(--r-pill);
  padding: 0.25rem 0.45rem 0.25rem 0.7rem;
}
.skill__x {
  width: 1.2rem; height: 1.2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: color-mix(in srgb, var(--indigo-deep) 12%, transparent);
}

.pcr__actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.pcr__hint { color: var(--faint); }
.pcr__view {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  width: fit-content;
}
</style>
