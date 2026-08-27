<script setup lang="ts">
import type { AdminPricingRules } from '#shared/config/catalog'
import type { ProjectRequestState } from '#shared/types'
import { rulesToPricingConfig } from '#shared/config/catalog'
import { sizeConfigs } from '#shared/config/project-types'
import { calculateEstimate } from '#shared/services/pricing'
import { formatToman, formatTomanCompact } from '#shared/utils/format'

// ─────────────────────────────────────────────────────────────
// موتور قیمت — قواعد مرکزی قیمت‌گذاری کل پلتفرم
// ادمین این‌جا تغییر می‌دهد؛ هیچ کامپوننتی تغییر نمی‌کند.
// پیش‌نمایش زنده با همان موتور calculateEstimate حساب می‌شود.
// ─────────────────────────────────────────────────────────────
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
useHead({ title: 'موتور قیمت — پنل مدیریت' })

const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')

const rules = ref<AdminPricingRules | null>(null)
const pristine = ref<string>('')
const loading = ref(true)
const loadError = ref('')
const saving = ref(false)
const showReset = ref(false)
const resetting = ref(false)

const dirty = computed(() => rules.value !== null && JSON.stringify(rules.value) !== pristine.value)

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const res = await $fetch<{ rules: AdminPricingRules }>('/api/admin/pricing')
    rules.value = JSON.parse(JSON.stringify(res.rules))
    pristine.value = JSON.stringify(rules.value)
  }
  catch (err: unknown) {
    loadError.value = (err as { data?: { message?: string } })?.data?.message ?? 'بارگذاری ناموفق بود.'
  }
  finally {
    loading.value = false
  }
}
onMounted(load)

function updateSizeMultiplier(presetId: string, value: string) {
  if (!rules.value) return
  if (value === '' || value === null) {
    delete rules.value.sizePresetMultipliers[presetId]
  }
  else {
    const n = Number(value)
    rules.value.sizePresetMultipliers[presetId] = Number.isFinite(n) ? n : 0
  }
}

function addAddOn() {
  if (!rules.value) return
  const id = `addon-${Math.random().toString(36).slice(2, 7)}`
  rules.value.addOns.push({ id, label: 'سرویس تازه', description: '', price: 300_000 })
}
function removeAddOn(i: number) {
  rules.value?.addOns.splice(i, 1)
}

async function save() {
  if (!rules.value) return
  saving.value = true
  try {
    const res = await $fetch<{ rules: AdminPricingRules }>('/api/admin/pricing', {
      method: 'PUT',
      body: { rules: rules.value },
    })
    rules.value = JSON.parse(JSON.stringify(res.rules))
    pristine.value = JSON.stringify(rules.value)
    toast.success('قواعد قیمت ذخیره شد', 'از این لحظه برای همه‌ی کاربران اعمال می‌شود.')
  }
  catch (err: unknown) {
    const e = err as { data?: { message?: string } }
    toast.error('ذخیره نشد', e?.data?.message ?? 'خطای نامشخص')
  }
  finally {
    saving.value = false
  }
}

async function reset() {
  resetting.value = true
  try {
    await $fetch('/api/admin/pricing/reset', { method: 'POST' })
    showReset.value = false
    await load()
    toast.success('بازگشت به پیش‌فرض‌ها')
  }
  catch (err: unknown) {
    toast.error('بازنشانی نشد', (err as { data?: { message?: string } })?.data?.message)
  }
  finally {
    resetting.value = false
  }
}

// ── پیش‌نمایش زنده: نمونه‌ی پوستر A3 پیچیده و فوری ──
const sampleState = computed<ProjectRequestState>(() => ({
  creativeId: null,
  type: 'poster',
  size: { presetId: 'a3', medium: 'print', custom: { width: null, height: null, unit: 'cm' } },
  visual: { paletteId: null, customPrimary: '#000', customSecondary: '#fff', isCustom: false },
  fontPairingId: null,
  brief: { mainText: '', description: '', requirements: '', files: [], links: {} },
  budget: {
    min: null,
    max: null,
    deadlineId: '1w',
    urgencyId: rules.value?.urgencyOptions[1]?.id ?? 'fast',
    complexityId: rules.value?.complexityOptions[2]?.id ?? 'complex',
    addOnIds: rules.value?.addOns.slice(0, 2).map(a => a.id) ?? [],
  },
  client: { fullName: '', mobile: '', email: '', telegram: '' },
  confirmed: false,
}))

const previewEstimate = computed(() => {
  if (!rules.value) return null
  return calculateEstimate(sampleState.value, rulesToPricingConfig(rules.value))
})
</script>

<template>
  <div class="pe">
    <header class="pe__head">
      <div>
        <h2 class="pe__title">
          <AIcon name="wallet" :size="20" />
          موتور قیمت
        </h2>
        <p class="pe__desc">
          قواعد مرکزی برآورد قیمت ویزارد پروژه. تغییرها بدون دست‌زدن به کد، برای همه اعمال می‌شود.
        </p>
      </div>
      <div class="pe__actions">
        <AButton variant="outline" size="sm" icon="arrow-right" :disabled="!dirty && !rules" @click="showReset = true">
          بازنشانی
        </AButton>
        <AButton size="sm" :loading="saving" :disabled="!dirty" icon-end="check" @click="save">
          ذخیره‌ی قواعد
        </AButton>
      </div>
    </header>

    <p v-if="dirty" class="pe__dirty">
      <AIcon name="pen" :size="14" />
      تغییرهای ذخیره‌نشده داری.
    </p>

    <div v-if="loading" class="panel" style="padding:1.2rem">
      <ASkeleton h="10rem" radius="16px" />
    </div>

    <div v-else-if="loadError" class="panel pe__error">
      <AIcon name="info" :size="18" />
      <p>{{ loadError }}</p>
      <AButton size="sm" variant="outline" @click="load">تلاش دوباره</AButton>
    </div>

    <div v-else-if="rules" class="pe__layout">
      <div class="pe__col">
        <!-- قیمت پایه -->
        <section class="panel sec" v-reveal>
          <h3 class="sec__h">قیمت پایه‌ی انواع پروژه (تومان)</h3>
          <div class="sec__rows">
            <label v-for="t in rules.projectTypes" :key="t.id" class="row">
              <span class="row__label">{{ t.label }}</span>
              <span class="row__hint latin">{{ t.id }}</span>
              <input v-model.number="t.basePrice" type="number" min="0" step="10000" class="row__in latin" dir="ltr">
            </label>
          </div>
        </section>

        <!-- حداقل مبلغ -->
        <section class="panel sec" v-reveal>
          <h3 class="sec__h">حداقل مبلغ پروژه</h3>
          <p class="sec__note">اگر جمع برآورد کمتر شود، به این عدد تکمیل می‌شود و در رسید با خط «حداقل مبلغ» نمایش داده می‌شود.</p>
          <div class="minrow">
            <input v-model.number="rules.minimumPrice" type="number" min="0" step="50000" class="row__in latin" dir="ltr">
            <strong class="minrow__fmt">{{ formatToman(rules.minimumPrice) }}</strong>
          </div>
        </section>

        <!-- پیچیدگی -->
        <section class="panel sec" v-reveal>
          <h3 class="sec__h">سطوح پیچیدگی</h3>
          <div class="sec__rows">
            <div v-for="o in rules.complexityOptions" :key="o.id" class="row row--triple">
              <input v-model="o.label" type="text" class="row__name" :aria-label="`برچسب ${o.id}`">
              <input v-model="o.hint" type="text" class="row__hint-in" :aria-label="`توضیح ${o.id}`" placeholder="توضیح کوتاه">
              <span class="row__mult">
                ×
                <input v-model.number="o.multiplier" type="number" min="0.1" max="5" step="0.05" class="row__in row__in--sm latin" dir="ltr">
              </span>
            </div>
          </div>
        </section>

        <!-- فوریت -->
        <section class="panel sec" v-reveal>
          <h3 class="sec__h">سطوح فوریت تحویل</h3>
          <div class="sec__rows">
            <div v-for="o in rules.urgencyOptions" :key="o.id" class="row row--triple">
              <input v-model="o.label" type="text" class="row__name" :aria-label="`برچسب ${o.id}`">
              <input v-model="o.hint" type="text" class="row__hint-in" :aria-label="`توضیح ${o.id}`" placeholder="توضیح کوتاه">
              <span class="row__mult">
                ×
                <input v-model.number="o.multiplier" type="number" min="0.1" max="5" step="0.05" class="row__in row__in--sm latin" dir="ltr">
              </span>
            </div>
          </div>
        </section>

        <!-- سرویس‌های اختیاری -->
        <section class="panel sec" v-reveal>
          <div class="sec__head">
            <h3 class="sec__h">سرویس‌های اختیاری</h3>
            <AButton variant="outline" size="sm" icon="plus" @click="addAddOn">افزودن</AButton>
          </div>
          <div class="sec__rows">
            <div v-for="(a, i) in rules.addOns" :key="a.id" class="row row--addon">
              <div class="row__addon-main">
                <input v-model="a.label" type="text" class="row__name" :aria-label="`برچسب ${a.id}`">
                <input v-model="a.description" type="text" class="row__hint-in" :aria-label="`توضیح ${a.id}`" placeholder="توضیح کوتاه">
              </div>
              <input v-model.number="a.price" type="number" min="0" step="10000" class="row__in latin" dir="ltr" :aria-label="`قیمت ${a.id}`">
              <button type="button" class="row__del" aria-label="حذف" @click="removeAddOn(i)">
                <AIcon name="trash" :size="14" />
              </button>
            </div>
          </div>
        </section>

        <!-- ضرایب سایز -->
        <section class="panel sec" v-reveal>
          <h3 class="sec__h">ضریب اندازه و فرمت (پریست‌ها)</h3>
          <p class="sec__note">
            عدد خالی یعنی همان ضریب پیش‌فرض پریست. مقادیر بین ۰٫۱ تا ۵.
          </p>
          <div v-for="(cfg, typeId) in sizeConfigs" :key="typeId" class="sizegroup">
            <p class="sizegroup__t">{{ rules.projectTypes.find(t => t.id === typeId)?.label ?? typeId }}</p>
            <div class="sec__rows">
              <label v-for="p in cfg.presets" :key="p.id" class="row">
                <span class="row__label">{{ p.label }}</span>
                <span class="row__hint">پیش‌فرض ×{{ fa.format(p.multiplier) }}</span>
                <input
                  :value="rules.sizePresetMultipliers[p.id] ?? ''"
                  type="number"
                  min="0.1"
                  max="5"
                  step="0.05"
                  class="row__in row__in--sm latin"
                  dir="ltr"
                  :placeholder="String(p.multiplier)"
                  @input="updateSizeMultiplier(p.id, ($event.target as HTMLInputElement).value)"
                >
              </label>
            </div>
          </div>
        </section>
      </div>

      <!-- پیش‌نمایش زنده -->
      <aside class="pe__preview">
        <div class="pe__preview-sticky panel" v-reveal>
          <p class="pe__preview-title">پیش‌نمایش زنده</p>
          <p class="sec__note">نمونه: پوستر A3 · پیچیده · تحویل سریع + دو سرویس اختیاری</p>
          <ul v-if="previewEstimate" class="pe__lines">
            <li v-for="l in previewEstimate.lines" :key="l.id" class="pe__line" :class="{ 'pe__line--min': l.kind === 'minimum' }">
              <span>{{ l.label }}<em v-if="l.detail"> · {{ l.detail }}</em></span>
              <b v-if="l.factor" class="latin">×{{ fa.format(l.factor) }}</b>
              <b v-else-if="l.amount != null">{{ l.kind === 'minimum' ? '+' : '' }}{{ formatTomanCompact(l.amount) }}</b>
            </li>
          </ul>
          <div v-if="previewEstimate" class="pe__total">
            <span>برآورد نهایی</span>
            <strong>{{ formatToman(previewEstimate.total) }}</strong>
          </div>
          <p v-if="!previewEstimate || previewEstimate.total === 0" class="t-caption">قاعده‌ای معتبر نیست.</p>
        </div>
      </aside>
    </div>

    <!-- بازنشانی -->
    <AModal v-model="showReset" title="بازگشت به پیش‌فرض‌ها" size="sm">
      <p class="t-body">همه‌ی قواعد سفارشی پاک می‌شود و به مقادیر اولیه‌ی repo برمی‌گردد.</p>
      <template #footer>
        <AButton variant="outline" @click="showReset = false">انصراف</AButton>
        <AButton :loading="resetting" @click="reset">بازنشانی</AButton>
      </template>
    </AModal>
  </div>
</template>

<style scoped>
.pe { display: grid; gap: 1rem; }
.pe__head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
.pe__title { display: flex; align-items: center; gap: 0.5rem; font-size: var(--fs-lg); font-weight: 900; }
.pe__title svg { color: var(--coral); }
.pe__desc { font-size: var(--fs-caption); color: var(--muted); margin-top: 0.3rem; max-width: 32rem; }
.pe__actions { display: flex; gap: 0.5rem; }
.pe__dirty {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--amber);
  background: var(--amber-soft);
  border-radius: var(--r-pill);
  padding: 0.3rem 0.8rem;
}
.pe__error { display: flex; align-items: center; gap: 0.8rem; padding: 1rem 1.2rem; color: var(--coral-deep); }

.pe__layout { display: grid; gap: 1rem; align-items: start; }
@media (min-width: 1100px) {
  .pe__layout { grid-template-columns: 1fr 19rem; }
  .pe__preview { position: sticky; top: 4.6rem; }
}
.pe__col { display: grid; gap: 1rem; min-width: 0; }

.sec { display: grid; gap: 0.8rem; padding: 1.2rem 1.3rem; }
.sec__h { font-size: var(--fs-md); font-weight: 900; }
.sec__head { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.sec__note { font-size: var(--fs-caption); color: var(--faint); }
.sec__rows { display: grid; gap: 0.45rem; }

.row {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 0.6rem;
  padding: 0.35rem 0.55rem;
  border-radius: var(--r-sm);
  background: color-mix(in srgb, var(--bg-deep) 55%, transparent);
}
.row__label { font-size: var(--fs-small); font-weight: 800; }
.row__hint { font-size: 0.66rem; color: var(--faint); }
.row__in {
  width: 9rem;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-xs);
  background: var(--paper);
  padding: 0.4rem 0.6rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink);
  text-align: end;
}
.row__in:focus { outline: none; border-color: var(--coral); }
.row__in--sm { width: 4.6rem; }

.row--triple { grid-template-columns: 8rem 1fr auto; }
.row__name {
  border: none;
  border-bottom: 1.5px solid transparent;
  background: transparent;
  font-weight: 800;
  font-size: var(--fs-small);
  color: var(--ink);
  padding: 0.2rem 0.1rem;
  min-width: 0;
}
.row__name:focus { outline: none; border-bottom-color: var(--coral); }
.row__hint-in {
  border: none;
  background: transparent;
  font-size: var(--fs-caption);
  color: var(--muted);
  padding: 0.2rem 0.1rem;
  min-width: 0;
  width: 100%;
}
.row__hint-in:focus { outline: none; }
.row__mult { display: inline-flex; align-items: center; gap: 0.3rem; font-weight: 900; color: var(--ink-soft); font-size: var(--fs-caption); }

.row--addon { grid-template-columns: 1fr 9.5rem auto; }
.row__addon-main { display: grid; gap: 0.05rem; }
.row__del {
  width: 2rem; height: 2rem;
  display: grid; place-items: center;
  border-radius: var(--r-sm);
  color: var(--muted);
  transition: all 0.15s;
}
.row__del:hover { color: var(--coral); background: var(--coral-soft); }

.minrow { display: flex; align-items: center; gap: 0.8rem; }
.minrow__fmt { font-size: var(--fs-caption); color: var(--muted); }

.sizegroup { display: grid; gap: 0.4rem; margin-top: 0.4rem; }
.sizegroup__t { font-size: var(--fs-caption); font-weight: 900; color: var(--indigo-deep); }

.pe__preview-sticky { display: grid; gap: 0.7rem; padding: 1.2rem 1.3rem; }
.pe__preview-title {
  font-family: var(--font-latin);
  font-size: 0.68rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--faint);
  font-weight: 600;
}
.pe__lines { display: grid; gap: 0.45rem; }
.pe__line {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.6rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  padding-bottom: 0.4rem;
  border-bottom: 1px dashed var(--line);
}
.pe__line em { font-style: normal; color: var(--faint); font-weight: 400; }
.pe__line--min { color: var(--amber); }
.pe__total {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--muted);
}
.pe__total strong { font-size: 1.2rem; color: var(--ink); }
</style>
