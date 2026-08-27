<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// پروفایل کارفرما — برند، شهر، حوزه‌های موردعلاقه
// این فیلدها به‌عنوان پیش‌فرض ویزارد و نمایش به خلاق‌ها استفاده می‌شوند.
// ─────────────────────────────────────────────────────────────
useHead({ title: 'پروفایل کارفرما — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const { user, patchProfile } = useAuth()
const toast = useToast()
const { catalog } = usePricing()

const form = reactive({
  brandName: '',
  city: '',
  website: '',
  bio: '',
  preferredCategories: [] as string[],
})
const errors = ref<Record<string, string>>({})
const saving = ref(false)
const dirty = ref(false)

watch(() => user.value, (u) => {
  if (u && !dirty.value) {
    form.brandName = u.clientProfile.brandName
    form.city = u.clientProfile.city
    form.website = u.clientProfile.website
    form.bio = u.clientProfile.bio
    form.preferredCategories = [...u.clientProfile.preferredCategories]
  }
}, { immediate: true })

function toggleCat(id: string) {
  dirty.value = true
  form.preferredCategories = form.preferredCategories.includes(id)
    ? form.preferredCategories.filter(c => c !== id)
    : [...form.preferredCategories, id]
}

async function save() {
  errors.value = {}
  if (form.website && !/^https?:\/\/.+\..+/.test(form.website)) {
    errors.value.website = 'لینک باید با https:// شروع شود.'
    return
  }
  saving.value = true
  try {
    await patchProfile({ clientProfile: { ...form } })
    dirty.value = false
    toast.success('پروفایل کارفرما ذخیره شد')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    toast.error('ذخیره نشد', e?.data?.message)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container pc" v-if="user">
    <header class="page-head" v-reveal>
      <NuxtLink to="/profile" class="crumbs">
        <AIcon name="arrow-right" :size="14" />
        پروفایل
      </NuxtLink>
      <h1 class="t-h1 page-head__title">پروفایل کارفرما</h1>
      <p class="t-body page-head__desc">
        این اطلاعات به خلاق‌ها کمک می‌کند پروژه‌ی تو را بهتر بفهمند و در ویزارد به‌عنوان پیش‌فرض استفاده می‌شود.
      </p>
    </header>

    <form class="pc__form" novalidate @submit.prevent="save">
      <section class="panel block" v-reveal>
        <h2 class="block__h">معرفی برند</h2>
        <div class="block__grid">
          <AInput v-model="form.brandName" label="نام برند / کسب‌وکار" placeholder="مثلاً کافه لوکا" @update:model-value="dirty = true" />
          <AInput v-model="form.city" label="شهر" placeholder="مثلاً تهران" @update:model-value="dirty = true" />
        </div>
        <AInput v-model="form.website" label="وب‌سایت (اختیاری)" placeholder="https://…" dir="ltr" icon="globe" :error="errors.website" @update:model-value="dirty = true" />
        <ATextarea v-model="form.bio" label="درباره‌ی کسب‌وکار" placeholder="چیکار می‌کنی و چه حسی می‌خواهی برندت بدهد؟" :rows="3" :maxlength="400" counter @update:model-value="dirty = true" />
      </section>

      <section class="panel block" v-reveal>
        <h2 class="block__h">حوزه‌های موردعلاقه</h2>
        <p class="t-caption block__note">برای فیلتر پروژه‌های پیشنهادی استفاده می‌شود.</p>
        <div class="cats" role="group" aria-label="حوزه‌ها">
          <button
            v-for="t in catalog.projectTypes"
            :key="t.id"
            type="button"
            class="cat"
            :class="{ 'cat--on': form.preferredCategories.includes(t.id) }"
            :aria-pressed="form.preferredCategories.includes(t.id)"
            @click="toggleCat(t.id)"
          >
            <AIcon :name="form.preferredCategories.includes(t.id) ? 'check' : 'plus'" :size="13" />
            {{ t.label }}
          </button>
        </div>
      </section>

      <div class="pc__actions" v-reveal>
        <p class="t-caption pc__hint">{{ dirty ? 'تغییرهای ذخیره‌نشده داری.' : 'همه‌چیز ذخیره است.' }}</p>
        <AButton type="submit" :loading="saving" :disabled="!dirty">ذخیره</AButton>
      </div>
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

.pc__form { display: grid; gap: 1rem; max-width: 40rem; }
.block { display: grid; gap: 0.9rem; padding: 1.3rem; }
.block__h { font-size: var(--fs-md); font-weight: 900; }
.block__note { color: var(--faint); }
.block__grid { display: grid; gap: 0.9rem; }
@media (min-width: 640px) { .block__grid { grid-template-columns: 1fr 1fr; } }

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

.pc__actions { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.pc__hint { color: var(--faint); }
</style>
