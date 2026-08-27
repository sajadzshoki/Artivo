<script setup lang="ts">
import type { Job, JobProposal } from '#shared/types'
import { portfolioItems } from '#shared/data/portfolio'
import { creativeServices } from '#shared/data/services'
import { toEnDigits, formatTomanCompact } from '#shared/utils/format'
import { useJobProposals } from '~/composables/useJobProposals'

// ─────────────────────────────────────────────────────────────
// ProposalModal · فرم ارسال پیشنهاد برای پروژه‌ی باز
// قیمت پیشنهادی + مهلت + متن + ارجاع به نمونه‌کار/سرویس
// ─────────────────────────────────────────────────────────────
const props = defineProps<{ job: Job }>()
const open = defineModel<boolean>({ required: true })
const emit = defineEmits<{ submitted: [] }>()

const { hasProposed, upsert } = useJobProposals()
const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')

const priceStr = ref('')
const deliveryDays = ref(7)
const proposalText = ref('')
const portfolioIds = ref<string[]>([])
const serviceIds = ref<string[]>([])
const submitting = ref(false)

// پیش‌فرض‌ها: وسط بازه‌ی بودجه + مهلت پیشنهادی؛ در حالت ویرایش، پیشنهاد قبلی
watch(open, (v) => {
  if (!v) return
  const existing = hasProposed(props.job.id)
  if (existing) {
    priceStr.value = String(existing.price)
    deliveryDays.value = existing.deliveryDays
    proposalText.value = existing.proposal
    portfolioIds.value = [...existing.portfolioItemIds]
    serviceIds.value = [...existing.serviceIds]
  }
  else {
    priceStr.value = String(Math.round(((props.job.budgetMin + props.job.budgetMax) / 2) / 500_000) * 500_000)
    deliveryDays.value = Math.min(props.job.deadlineDays, 10)
    proposalText.value = ''
    portfolioIds.value = []
    serviceIds.value = []
  }
})

const price = computed(() => {
  const n = Number(toEnDigits(priceStr.value).replace(/[^\d]/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
})

const priceError = computed(() => {
  if (!price.value) return 'قیمت پیشنهادی را وارد کن.'
  if (price.value < 100_000) return 'قیمت کمتر از حد مجاز است.'
  if (price.value > 2_000_000_000) return 'قیمت بیشتر از حد مجاز است.'
  return ''
})

const deliveryError = computed(() =>
  (deliveryDays.value >= 1 && deliveryDays.value <= 120) ? '' : 'مهلت بین ۱ تا ۱۲۰ روز باشد.')

const proposalError = computed(() => {
  const t = proposalText.value.trim()
  if (t && t.length < 30) return 'متن پیشنهاد حداقل ۳۰ کاراکتر باشد.'
  return ''
})

const canSubmit = computed(() => !priceError.value && !deliveryError.value && proposalText.value.trim().length >= 30)

const deliveryOptions = computed(() => {
  const base = [3, 7, 14, 30].filter(d => d <= props.job.deadlineDays + 7)
  const list = base.length ? base : [props.job.deadlineDays]
  if (!list.includes(deliveryDays.value) && hasProposed(props.job.id)) list.push(deliveryDays.value)
  return [...new Set(list)]
})

function togglePortfolio(id: string) {
  portfolioIds.value = portfolioIds.value.includes(id) ? portfolioIds.value.filter(x => x !== id) : [...portfolioIds.value, id]
}

function toggleService(id: string) {
  serviceIds.value = serviceIds.value.includes(id) ? serviceIds.value.filter(x => x !== id) : [...serviceIds.value, id]
}

function submit() {
  if (!canSubmit.value || !price.value) return
  submitting.value = true
  // Phase 3: ثبت شبیه‌سازی‌شده — در فاز بعد به API وصل می‌شود
  setTimeout(() => {
    const record: JobProposal = {
      id: `pr-${Math.random().toString(36).slice(2, 9)}`,
      jobId: props.job.id,
      jobTitle: props.job.title,
      price: price.value!,
      deliveryDays: deliveryDays.value,
      proposal: proposalText.value.trim(),
      portfolioItemIds: [...portfolioIds.value],
      serviceIds: [...serviceIds.value],
      createdAt: new Date().toISOString(),
    }
    upsert(record)
    submitting.value = false
    open.value = false
    toast.success('پیشنهادت ارسال شد', `برای «${props.job.title}» — ${formatTomanCompact(record.price)}`)
    emit('submitted')
  }, 700)
}
</script>

<template>
  <AModal v-model="open" :title="hasProposed(job.id) ? 'ویرایش پیشنهاد' : 'ارسال پیشنهاد'" size="md">
    <div class="pm">
      <p class="pm__job">
        برای «<strong>{{ job.title }}</strong>» —
        بودجه‌ی کارفرما: <strong>{{ formatTomanCompact(job.budgetMin) }} تا {{ formatTomanCompact(job.budgetMax) }}</strong>
      </p>

      <div class="pm__row">
        <AInput
          v-model="priceStr"
          label="قیمت پیشنهادی شما"
          required
          dir="ltr"
          inputmode="numeric"
          placeholder="4,500,000"
          suffix="تومان"
          :error="priceError"
          :hint="`در بازه‌ی ${formatTomanCompact(job.budgetMin)} تا ${formatTomanCompact(job.budgetMax)}`"
        />
      </div>

      <div class="pm__delivery">
        <p class="pm__label">مهلت تحویل <span class="pm__req">*</span></p>
        <div class="pm__chips">
          <button
            v-for="d in deliveryOptions"
            :key="d"
            type="button"
            class="pm__chip"
            :class="{ 'pm__chip--on': deliveryDays === d }"
            @click="deliveryDays = d"
          >
            {{ fa.format(d) }} روز
          </button>
        </div>
        <p v-if="deliveryError" class="pm__err">{{ deliveryError }}</p>
      </div>

      <ATextarea
        v-model="proposalText"
        label="متن پیشنهاد"
        required
        :rows="5"
        :maxlength="600"
        counter
        placeholder="چرا تو بهترین گزینه برای این پروژه‌ای؟ رویکردت، تجربه‌ی مشابه و برنامه‌ی اجرا را کوتاه توضیح بده…"
        hint="حداقل ۳۰ کاراکتر — پیشنهادهای مشخص و بدون کلی‌گویی شانس بیشتری دارند."
        :error="proposalError"
      />

      <!-- ارجاع‌ها -->
      <div class="pm__refs">
        <p class="pm__label">ارجاع به نمونه‌کارها <span class="pm__opt">(اختیاری)</span></p>
        <div class="pm__chips pm__chips--wrap">
          <button
            v-for="p in portfolioItems.slice(0, 12)"
            :key="p.id"
            type="button"
            class="pm__chip"
            :class="{ 'pm__chip--on': portfolioIds.includes(p.id) }"
            @click="togglePortfolio(p.id)"
          >
            <AIcon v-if="portfolioIds.includes(p.id)" name="check" :size="12" />
            {{ p.title }}
          </button>
        </div>
      </div>

      <div class="pm__refs">
        <p class="pm__label">سرویس‌های مرتبط <span class="pm__opt">(اختیاری)</span></p>
        <div class="pm__chips pm__chips--wrap">
          <button
            v-for="s in creativeServices.slice(0, 10)"
            :key="s.id"
            type="button"
            class="pm__chip"
            :class="{ 'pm__chip--on': serviceIds.includes(s.id) }"
            @click="toggleService(s.id)"
          >
            <AIcon v-if="serviceIds.includes(s.id)" name="check" :size="12" />
            {{ s.title }}
          </button>
        </div>
      </div>

      <p class="pm__note">
        <AIcon name="info" :size="14" />
        پیشنهادها برای کارفرما ارسال می‌شود و پاسخ در «پیشنهادهای من» در پروفایل دیده می‌شود.
        گفت‌وگوی مستقیم و پرداخت در فازهای بعدی فعال خواهد شد.
      </p>
    </div>

    <template #footer>
      <AButton variant="outline" @click="open = false">انصراف</AButton>
      <AButton :loading="submitting" :disabled="!canSubmit" icon-end="send" @click="submit">
        {{ hasProposed(job.id) ? 'به‌روزرسانی پیشنهاد' : 'ارسال پیشنهاد' }}
      </AButton>
    </template>
  </AModal>
</template>

<style scoped>
.pm { display: grid; gap: 1.1rem; }
.pm__job { font-size: var(--fs-small); color: var(--muted); line-height: 1.9; background: var(--bg-deep); border-radius: var(--r-sm); padding: 0.7rem 0.9rem; }
.pm__job strong { color: var(--ink); }
.pm__label { font-size: var(--fs-small); font-weight: 800; }
.pm__req { color: var(--coral); }
.pm__opt { font-size: var(--fs-caption); color: var(--faint); font-weight: 600; }

.pm__chips { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-top: 0.5rem; }
.pm__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  color: var(--ink-soft);
  border-radius: var(--r-pill);
  font-size: var(--fs-caption);
  font-weight: 700;
  padding: 0.4rem 0.85rem;
  transition: all 0.2s;
}
.pm__chip:hover { border-color: var(--ink); color: var(--ink); }
.pm__chip--on { background: var(--ink); border-color: var(--ink); color: var(--bg); }

.pm__err { margin-top: 0.4rem; font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.pm__note {
  display: flex;
  gap: 0.45rem;
  align-items: flex-start;
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  border-radius: var(--r-sm);
  padding: 0.65rem 0.8rem;
  font-size: var(--fs-caption);
  line-height: 1.85;
}
.pm__note svg { flex-shrink: 0; margin-top: 0.2rem; }
</style>
