<script setup lang="ts">
import type { ProjectTypeId } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// ساخت پروژه — عنوان، نوع، توضیح، بودجه و مهلت؛ شروع در پیش‌نویس
// ?creative= → پیش‌تر از پروفایل خلاق آمده (فقط یادداشت در توضیح)
// ─────────────────────────────────────────────────────────────
useHead({ title: 'پروژه‌ی جدید — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { catalog } = usePricing()
const toast = useToast()
const router = useRouter()

const form = reactive({
  title: '',
  typeId: '' as ProjectTypeId | '',
  description: '',
  budgetMin: '',
  budgetMax: '',
  deadlineDays: '',
})
const errors = ref<Record<string, string>>({})
const saving = ref(false)

const creativeHint = computed(() => {
  const c = route.query.creative
  return typeof c === 'string' ? c : ''
})

const faNum = (v: string) => v.replace(/\D/g, '')

function validate(): boolean {
  errors.value = {}
  if (form.title.trim().length < 4) errors.value.title = 'عنوان حداقل ۴ کاراکتر.'
  if (!form.typeId) errors.value.typeId = 'نوع پروژه را انتخاب کن.'
  if (form.description.trim().length < 30) errors.value.description = 'توضیح حداقل ۳۰ کاراکتر تا خلاق‌ها بفهمند.'
  if (form.budgetMin && form.budgetMax && Number(faNum(form.budgetMin)) > Number(faNum(form.budgetMax))) {
    errors.value.budgetMin = 'حداقل از حداکثر بیشتر نشود.'
  }
  if (form.deadlineDays && (Number(faNum(form.deadlineDays)) < 1 || Number(faNum(form.deadlineDays)) > 365)) {
    errors.value.deadlineDays = 'بین ۱ تا ۳۶۵ روز.'
  }
  return Object.keys(errors.value).length === 0
}

async function submit(publish: boolean) {
  if (!validate()) {
    toast.error('چند جای فرم کم دارد', 'موارد مشخص‌شده را کامل کن.')
    return
  }
  saving.value = true
  try {
    const res = await $fetch<{ project: { id: string } }>('/api/projects', {
      method: 'POST',
      body: {
        title: form.title.trim(),
        typeId: form.typeId,
        typeLabel: catalog.value.projectTypes.find(t => t.id === form.typeId)?.label ?? 'پروژه',
        description: form.description.trim()
          + (creativeHint.value ? `\n\nخلاق پیشنهادی: ${creativeHint.value}` : ''),
        budgetMin: faNum(form.budgetMin) || null,
        budgetMax: faNum(form.budgetMax) || null,
        deadlineDays: faNum(form.deadlineDays) || null,
      },
    })
    toast.success('پروژه ساخته شد', publish ? 'حالا منتشرش کن تا پیشنهادها برسند.' : 'فعلاً در پیش‌نویس‌هاست.')
    await router.push(`/projects/${res.project.id}`)
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string; data?: { field?: string } } }
    if (e?.data?.data?.field) errors.value[e.data.data.field] = e?.data?.message ?? ''
    else toast.error('ساخت پروژه ناموفق بود', e?.data?.message)
  }
  finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="container pn">
    <header class="page-head" v-reveal>
      <NuxtLink to="/dashboard" class="crumbs">
        <AIcon name="arrow-right" :size="14" />
        داشبورد
      </NuxtLink>
      <h1 class="t-h1 page-head__title">پروژه‌ی جدید</h1>
      <p class="t-body page-head__desc">
        پروژه را بساز، وقتی آماده بودی منتشرش کن تا خلاق‌ها پیشنهاد بدهند.
        <template v-if="creativeHint"> خلاق منتخب تو در توضیحات ثبت می‌شود.</template>
      </p>
    </header>

    <form class="pn__form" novalidate @submit.prevent="submit(false)">
      <section class="panel block" v-reveal>
        <h2 class="block__h">معرفی پروژه</h2>
        <AInput v-model="form.title" label="عنوان پروژه" placeholder="مثلاً طراحی هویت بصری کافه" :error="errors.title" required @update:model-value="errors.title = ''" />
        <div class="types" role="group" aria-label="نوع پروژه">
          <button
            v-for="t in catalog.projectTypes"
            :key="t.id"
            type="button"
            class="type"
            :class="{ 'type--on': form.typeId === t.id }"
            :aria-pressed="form.typeId === t.id"
            @click="form.typeId = t.id as ProjectTypeId; errors.typeId = ''"
          >
            <AIcon :name="t.icon" :size="16" />
            {{ t.label }}
          </button>
        </div>
        <p v-if="errors.typeId" class="err">{{ errors.typeId }}</p>
        <ATextarea
          v-model="form.description"
          label="توضیحات"
          placeholder="چه می‌خواهی، برای چه کسب‌وکاری، چه حسی باید داشته باشد…"
          :rows="5"
          :maxlength="2000"
          counter
          :error="errors.description"
          @update:model-value="errors.description = ''"
        />
      </section>

      <section class="panel block" v-reveal>
        <h2 class="block__h">بودجه و مهلت <small class="block__opt">(اختیاری)</small></h2>
        <div class="block__grid">
          <AInput v-model="form.budgetMin" label="بودجه از (تومان)" dir="ltr" inputmode="numeric" placeholder="3000000" :error="errors.budgetMin" @update:model-value="form.budgetMin = faNum(form.budgetMin)" />
          <AInput v-model="form.budgetMax" label="تا (تومان)" dir="ltr" inputmode="numeric" placeholder="8000000" :error="errors.budgetMax" @update:model-value="form.budgetMax = faNum(form.budgetMax)" />
        </div>
        <AInput v-model="form.deadlineDays" label="مهلت تحویل (روز)" dir="ltr" inputmode="numeric" placeholder="14" :error="errors.deadlineDays" @update:model-value="form.deadlineDays = faNum(form.deadlineDays)" />
      </section>

      <div class="pn__actions" v-reveal>
        <AButton variant="outline" :disabled="saving" @click="submit(false)">
          ذخیره‌ی پیش‌نویس
        </AButton>
        <AButton :loading="saving" icon-end="arrow-left" @click="submit(true)">
          ذخیره و انتشار
        </AButton>
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
  width: fit-content;
}
.crumbs:hover { color: var(--ink); }
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.5rem; }
.page-head__desc { max-width: 30rem; color: var(--muted); }

.pn__form { display: grid; gap: 1rem; max-width: 40rem; }
.block { display: grid; gap: 0.9rem; padding: 1.3rem; }
.block__h { font-size: var(--fs-md); font-weight: 900; }
.block__opt { font-size: var(--fs-caption); color: var(--faint); font-weight: 400; }
.block__grid { display: grid; gap: 0.9rem; }
@media (min-width: 640px) { .block__grid { grid-template-columns: 1fr 1fr; } }

.types { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.type {
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
  transition: all 0.15s;
}
.type:hover { border-color: var(--ink); }
.type--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

.err { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.pn__actions {
  display: flex;
  gap: 0.6rem;
  justify-content: flex-end;
  position: sticky;
  bottom: calc(5.2rem + env(safe-area-inset-bottom));
}
@media (min-width: 768px) {
  .pn__actions { position: static; }
}
</style>
