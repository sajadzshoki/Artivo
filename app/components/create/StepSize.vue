<script setup lang="ts">
// گام ۲ — اندازه و فرمت (پریست‌ها + ابعاد سفارشی + چاپ/دیجیتال)
import { projectTypeMap, sizeConfigs } from '#shared/config/project-types'
import { customAreaMultiplier, effectiveSizePresets } from '#shared/services/pricing'
import { toEnDigits } from '#shared/utils/format'

const { state } = useProjectRequest()
// ضرایب پریست با بازنویسی ادمین (در صورت وجود) نشان داده می‌شوند
const { config: pricingCfg } = usePricing()

const customOpen = ref(false)
const wStr = ref('')
const hStr = ref('')

const cfg = computed(() => state.value.type ? sizeConfigs[state.value.type] : null)
const fa = new Intl.NumberFormat('fa-IR')

const visiblePresets = computed(() => {
  if (!state.value.type) return []
  const presets = effectiveSizePresets(state.value.type, pricingCfg.value.sizePresetMultipliers)
  return presets.filter(p => !p.medium || !state.value.size.medium || p.medium === state.value.size.medium)
})

function setMedium(m: 'print' | 'digital') {
  state.value.size.medium = m
  state.value.size.presetId = null
}

function choosePreset(id: string) {
  state.value.size.presetId = state.value.size.presetId === id ? null : id
  if (state.value.size.presetId) customOpen.value = false
}

function openCustom() {
  customOpen.value = !customOpen.value
  state.value.size.presetId = null
}

const customRatioOk = computed(() => {
  const { width: w, height: h } = state.value.size.custom
  if (!w || !h) return true
  return Math.max(w, h) / Math.min(w, h) <= 5
})

const customFactor = computed(() => {
  const { width: w, height: h, unit } = state.value.size.custom
  if (!w || !h || !customRatioOk.value) return null
  return customAreaMultiplier(w, h, unit)
})

function syncCustom() {
  wStr.value = toEnDigits(wStr.value).replace(/[^\d.]/g, '')
  hStr.value = toEnDigits(hStr.value).replace(/[^\d.]/g, '')
  state.value.size.custom.width = wStr.value ? Number(wStr.value) : null
  state.value.size.custom.height = hStr.value ? Number(hStr.value) : null
  if (state.value.size.custom.width && state.value.size.custom.height) state.value.size.presetId = null
}

const unitOptions = [
  { value: 'cm', label: 'سانتی‌متر' },
  { value: 'px', label: 'پیکسل' },
]
</script>

<template>
  <div>
    <header class="s-head">
      <h2 class="t-h1">چه اندازه‌ای؟</h2>
      <p class="t-body">
        {{ state.type ? `فرمت‌های پیشنهادی برای «${projectTypeMap[state.type].label}»` : 'فرمت و ابعاد کار' }} —
        اندازه در قیمت نهایی ضریب می‌شود.
      </p>
    </header>

    <!-- چاپ یا دیجیتال -->
    <ASegmented
      v-if="cfg?.hasMedium"
      :options="[{ value: 'print', label: 'چاپ', hint: 'برای چاپخانه' }, { value: 'digital', label: 'دیجیتال', hint: 'صفحه‌نمایش' }]"
      :model-value="state.size.medium ?? undefined"
      label="بستر خروجی"
      class="s-gap"
      @update:model-value="(v: string | undefined) => v && setMedium(v as 'print' | 'digital')"
    />

    <!-- پریست‌ها -->
    <div class="presets">
      <button
        v-for="p in visiblePresets"
        :key="p.id"
        type="button"
        class="ps"
        :class="{ 'ps--on': state.size.presetId === p.id }"
        @click="choosePreset(p.id)"
      >
        <span class="ps__top">
          <strong class="ps__label">{{ p.label }}</strong>
          <span v-if="p.multiplier !== 1" class="ps__mult latin">×{{ new Intl.NumberFormat('fa-IR').format(p.multiplier) }}</span>
        </span>
        <span v-if="p.dims" class="ps__dims">{{ p.dims }}</span>
        <span class="ps__check" aria-hidden="true"><AIcon name="check" :size="12" /></span>
      </button>

      <button type="button" class="ps ps--custom" :class="{ 'ps--on': customOpen }" @click="openCustom">
        <span class="ps__top">
          <strong class="ps__label">ابعاد سفارشی</strong>
        </span>
        <span class="ps__dims">عرض و ارتفاع دلخواه</span>
        <AIcon :name="customOpen ? 'chevron-up' : 'plus'" :size="16" class="ps__plus" />
      </button>
    </div>

    <!-- ابعاد سفارشی -->
    <Transition name="fold">
      <div v-if="customOpen" class="custom panel">
        <div class="custom__row">
          <label class="custom__field">
            <span>عرض</span>
            <input v-model="wStr" type="number" inputmode="decimal" min="1" placeholder="۲۱" @input="syncCustom">
          </label>
          <span class="custom__x latin">×</span>
          <label class="custom__field">
            <span>ارتفاع</span>
            <input v-model="hStr" type="number" inputmode="decimal" min="1" placeholder="۲۹٫۷" @input="syncCustom">
          </label>
          <ASegmented :options="unitOptions" :model-value="state.size.custom.unit" class="custom__unit" @update:model-value="(v: string | undefined) => state.size.custom.unit = (v ?? 'cm') as 'cm' | 'px'" />
        </div>

        <p v-if="!customRatioOk" class="custom__err">نسبت ابعاد خیلی غیرعادی است؛ تا ۵ برابر پذیرفته می‌شود.</p>
        <p v-else-if="customFactor" class="custom__hint">
          ضریب این ابعاد: <strong class="latin">×{{ fa.format(customFactor) }}</strong>
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.s-head { display: grid; gap: 0.4rem; margin-bottom: 1.5rem; }
.s-gap { margin-bottom: 1.25rem; }

.presets {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}
@media (min-width: 640px) { .presets { grid-template-columns: repeat(3, 1fr); } }

.ps {
  position: relative;
  display: grid;
  gap: 0.15rem;
  align-content: start;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.8rem 0.85rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.ps:hover { border-color: var(--line-strong); }
.ps--on { border-color: var(--ink); box-shadow: 0 0 0 1px var(--ink); }
.ps--custom { border-style: dashed; }
.ps--custom.ps--on { border-style: solid; border-color: var(--ink); }

.ps__top { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; }
.ps__label { font-size: var(--fs-small); font-weight: 900; }
.ps__mult {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--indigo-deep);
  background: var(--indigo-soft);
  padding: 0.1rem 0.4rem;
  border-radius: var(--r-pill);
}
.ps__dims { font-size: var(--fs-caption); color: var(--muted); }

.ps__check {
  position: absolute;
  top: -7px;
  inset-inline-end: -7px;
  width: 1.3rem; height: 1.3rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--ink);
  color: var(--bg);
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s var(--ease-out);
}
.ps--on .ps__check { opacity: 1; transform: scale(1); }

.ps__plus { position: absolute; top: 0.75rem; inset-inline-end: 0.75rem; color: var(--faint); }

.custom { margin-top: 0.9rem; padding: 1rem 1.1rem; }
.custom__row { display: flex; align-items: flex-end; gap: 0.6rem; flex-wrap: wrap; }
.custom__field { display: grid; gap: 0.3rem; flex: 1; min-width: 6.5rem; }
.custom__field span { font-size: var(--fs-caption); font-weight: 700; color: var(--muted); }
.custom__field input {
  background: var(--bg);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  padding: 0.55rem 0.7rem;
  min-width: 0;
  direction: ltr;
  text-align: center;
}
.custom__field input:focus { outline: none; border-color: var(--ink); }
.custom__x { color: var(--faint); padding-bottom: 0.65rem; }
.custom__unit { min-width: 10rem; }

.custom__hint { margin-top: 0.7rem; font-size: var(--fs-caption); color: var(--muted); }
.custom__hint strong { color: var(--ink); }
.custom__err { margin-top: 0.7rem; font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.fold-enter-active { transition: all 0.3s var(--ease-out); }
.fold-leave-active { transition: all 0.2s ease-in; }
.fold-enter-from, .fold-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
