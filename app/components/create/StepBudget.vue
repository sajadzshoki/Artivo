<script setup lang="ts">
import { pricingConfig } from '#shared/services/pricing'
import { toEnDigits } from '#shared/utils/format'

// گام ۶ — بودجه و تحویل: فوریت، مهلت، پیچیدگی، سرویس‌های اختیاری و برآورد
const { state } = useProjectRequest()

const fa = new Intl.NumberFormat('fa-IR')

const deadlines = [
  { id: '3d', label: '۳ روز', days: 3 as number | null },
  { id: '1w', label: '۱ هفته', days: 7 },
  { id: '2w', label: '۲ هفته', days: 14 },
  { id: '1m', label: '۱ ماه', days: 30 },
  { id: 'flex', label: 'انعطاف‌پذیر', days: null },
]

const deadlineText = computed(() => {
  const d = deadlines.find(x => x.id === state.value.budget.deadlineId)
  if (!d) return null
  return deadlineLabel(d.days)
})

const minStr = ref(state.value.budget.min ? String(state.value.budget.min) : '')
const maxStr = ref(state.value.budget.max ? String(state.value.budget.max) : '')

function syncBudget() {
  minStr.value = toEnDigits(minStr.value).replace(/[^\d]/g, '')
  maxStr.value = toEnDigits(maxStr.value).replace(/[^\d]/g, '')
  state.value.budget.min = minStr.value ? Number(minStr.value) : null
  state.value.budget.max = maxStr.value ? Number(maxStr.value) : null
}

const budgetError = computed(() => {
  const { min, max } = state.value.budget
  if (min && max && min > max) return 'حداقل بودجه نمی‌تواند از حداکثر بیشتر باشد.'
  return ''
})

function toggleAddOn(id: string) {
  const list = state.value.budget.addOnIds
  const i = list.indexOf(id)
  if (i >= 0) list.splice(i, 1)
  else list.push(id)
}
</script>

<template>
  <div class="budget">
    <header class="s-head">
      <h2 class="t-h1">بودجه و تحویل</h2>
      <p class="t-body">سرعت تحویل و سطح جزئیات، روی قیمت اثر می‌گذارد؛ همین‌جا برآورد را زنده ببین.</p>
    </header>

    <!-- فوریت تحویل -->
    <section>
      <p class="budget__label">فوریت تحویل</p>
      <div class="urg">
        <button
          v-for="u in pricingConfig.urgencyOptions"
          :key="u.id"
          type="button"
          class="urg__card"
          :class="{ 'urg__card--on': state.budget.urgencyId === u.id }"
          @click="state.budget.urgencyId = u.id"
        >
          <span class="urg__head">
            <strong>{{ u.label }}</strong>
            <span v-if="u.multiplier !== 1" class="urg__mult latin">×{{ fa.format(u.multiplier) }}</span>
          </span>
          <span class="urg__hint">{{ u.hint }}</span>
        </button>
      </div>
    </section>

    <!-- مهلت -->
    <section>
      <p class="budget__label">مهلت دلخواه شما</p>
      <div class="dls">
        <button
          v-for="d in deadlines"
          :key="d.id"
          type="button"
          class="dl"
          :class="{ 'dl--on': state.budget.deadlineId === d.id }"
          @click="state.budget.deadlineId = d.id"
        >
          {{ d.label }}
        </button>
      </div>
      <p v-if="deadlineText" class="budget__hint"><AIcon name="calendar" :size="13" /> {{ deadlineText }}</p>
    </section>

    <!-- پیچیدگی -->
    <ASegmented
      :options="pricingConfig.complexityOptions.map(o => ({ value: o.id, label: o.label, hint: o.hint }))"
      v-model="state.budget.complexityId"
      label="سطح پیچیدگی"
    />

    <!-- بودجه (اختیاری) -->
    <section>
      <p class="budget__label">بودجه‌ی مدنظر شما <span class="t-caption">(اختیاری — برای راهنمای خلاق)</span></p>
      <div class="bminmax">
        <AInput v-model="minStr" dir="ltr" inputmode="numeric" placeholder="2,000,000" suffix="تومان" @update:model-value="syncBudget" />
        <span class="bminmax__sep latin">—</span>
        <AInput v-model="maxStr" dir="ltr" inputmode="numeric" placeholder="5,000,000" suffix="تومان" @update:model-value="syncBudget" />
      </div>
      <p v-if="budgetError" class="budget__err">{{ budgetError }}</p>
    </section>

    <!-- سرویس‌های اختیاری -->
    <section>
      <p class="budget__label">سرویس‌های اختیاری</p>
      <div class="addons">
        <ACheck
          v-for="a in pricingConfig.addOns"
          :key="a.id"
          :model-value="state.budget.addOnIds.includes(a.id)"
          :label="a.label"
          :description="a.description"
          :trailing="`+ ${formatToman(a.price)}`"
          @update:model-value="toggleAddOn(a.id)"
        />
      </div>
    </section>

    <!-- برآورد زنده -->
    <EstimatePanel />
  </div>
</template>

<style scoped>
.budget { display: grid; gap: 1.4rem; }
.s-head { display: grid; gap: 0.4rem; margin-bottom: 0.2rem; }
.budget__label { display: block; font-size: var(--fs-small); font-weight: 800; margin-bottom: 0.55rem; }

.urg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.55rem; }
.urg__card {
  display: grid;
  gap: 0.1rem;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.7rem 0.8rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.urg__card:hover { border-color: var(--line-strong); }
.urg__card--on { border-color: var(--coral); box-shadow: 0 0 0 1px var(--coral); }
.urg__head { display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; }
.urg__head strong { font-size: var(--fs-small); font-weight: 900; }
.urg__mult {
  font-size: 0.64rem; font-weight: 600;
  color: var(--coral-deep);
  background: var(--coral-soft);
  padding: 0.06rem 0.4rem;
  border-radius: var(--r-pill);
}
.urg__hint { font-size: 0.66rem; color: var(--muted); }

.dls { display: flex; flex-wrap: wrap; gap: 0.45rem; }
.dl {
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.45rem 1rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.dl:hover { border-color: var(--ink); color: var(--ink); }
.dl--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

.budget__hint {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.55rem;
  font-size: var(--fs-caption);
  color: var(--green);
  font-weight: 700;
}

.bminmax { display: flex; align-items: flex-end; gap: 0.5rem; }
.bminmax > :first-child, .bminmax > :last-child { flex: 1; min-width: 0; }
.bminmax__sep { color: var(--faint); padding-bottom: 0.85rem; }

.budget__err { margin-top: 0.45rem; font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.addons { display: grid; gap: 0.5rem; }

@media (max-width: 420px) {
  .urg { grid-template-columns: 1fr; }
  .urg__card { grid-template-columns: 1fr auto; }
  .urg__hint { grid-column: 1 / -1; }
}
</style>
