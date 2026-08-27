<script setup lang="ts">
import type { ProjectTypeId } from '#shared/types'
import { projectTypeMap } from '#shared/config/project-types'
import { wizardSteps, useProjectRequest } from '~/composables/useProjectRequest'
import StepType from '~/components/create/StepType.vue'
import StepSize from '~/components/create/StepSize.vue'
import StepVisual from '~/components/create/StepVisual.vue'
import StepFont from '~/components/create/StepFont.vue'
import StepBrief from '~/components/create/StepBrief.vue'
import StepBudget from '~/components/create/StepBudget.vue'
import StepClient from '~/components/create/StepClient.vue'
import StepReview from '~/components/create/StepReview.vue'
import StepSuccess from '~/components/create/StepSuccess.vue'

// ویزارد درخواست پروژه — هر گام تمام صفحه است
useHead({ title: 'شروع پروژه — آرتیوو' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { state, step, validity, progress, setType, reset, next, back, canGoNext } = useProjectRequest()
const { estimate } = usePricing()
const { add: addRequest } = useMyRequests()

const done = ref(false)
const submitting = ref(false)
const showExit = ref(false)
const showSummary = ref(false)

const stepComponents = { type: StepType, size: StepSize, visual: StepVisual, font: StepFont, brief: StepBrief, budget: StepBudget, client: StepClient, review: StepReview } as const
const currentComponent = computed(() => stepComponents[wizardSteps[step.value]?.key ?? 'type'])
const isReview = computed(() => step.value === wizardSteps.length - 1)

// میان‌بر از خانه: /create?type=poster
onMounted(() => {
  const t = route.query.type as ProjectTypeId | undefined
  if (t && t in projectTypeMap && state.value.type === null) setType(t)
})

function onNext() {
  if (!canGoNext.value) {
    const msg: Record<number, string> = {
      0: 'یکی از انواع پروژه را انتخاب کن.',
      1: 'یک اندازه و فرمت مشخص کن.',
      2: 'یک پالت رنگی انتخاب کن یا رنگ‌های دلخواه بچین.',
      3: 'از بین ترکیب‌های فونت، یکی را انتخاب کن.',
      4: 'متن اصلی و توضیح پروژه (حداقل ۲۰ کاراکتر) را بنویس.',
      5: 'مهلت تحویل را مشخص کن.',
      6: 'نام و شماره موبایل معتبر لازم است.',
      7: 'تیک تایید اطلاعات را بزن تا ثبت نهایی شود.',
    }
    toast.error('کمی صبر کن', msg[step.value] ?? 'این گام کامل نشده است.')
    return
  }
  if (isReview.value) submit()
  else next()
}

function submit() {
  submitting.value = true
  // Phase 1: ارسال شبیه‌سازی‌شده — در فاز بعد به API وصل می‌شود
  setTimeout(() => {
    const code = `ART-${Math.floor(1000 + Math.random() * 9000)}`
    addRequest({
      code,
      createdAt: new Date().toISOString(),
      typeLabel: state.value.type ? projectTypeMap[state.value.type].label : 'پروژه',
      total: estimate.value.total,
      clientName: state.value.client.fullName,
      status: 'در حال بررسی',
    })
    submitting.value = false
    done.value = true
    toast.success('درخواست ثبت شد', `کد پیگیری: ${code}`)
    window.scrollTo({ top: 0 })
  }, 900)
}

function exitWizard() {
  showExit.value = false
  reset()
  router.push('/')
}

function startNew() {
  reset()
  done.value = false
}
</script>

<template>
  <div class="wiz">
    <!-- نوار بالای ویزارد -->
    <header class="wiz__bar">
      <div class="container wiz__bar-in">
        <button v-if="!done" class="wiz__close" aria-label="خروج از ویزارد" @click="showExit = true">
          <AIcon name="x" :size="18" />
        </button>
        <NuxtLink v-else to="/" class="wiz__close" aria-label="خانه"><AIcon name="home" :size="18" /></NuxtLink>

        <NuxtLink to="/" class="wiz__brand latin" aria-label="آرتیوو">Artivo<em>*</em></NuxtLink>

        <button v-if="!done" class="wiz__summary-btn" @click="showSummary = true">
          <AIcon name="file" :size="15" />
          خلاصه
        </button>
      </div>
      <div v-if="!done" class="wiz__track">
        <span class="wiz__track-fill" :style="{ inlineSize: `${(progress / wizardSteps.length) * 100}%` }" />
      </div>
    </header>

    <!-- بدنه -->
    <div v-if="!done" class="container wiz__meta">
      <AStepProgress :steps="[...wizardSteps]" :current="step" />
    </div>

    <main class="container wiz__main">
      <div v-if="!done" class="wiz__stepcol">
        <Transition name="step" mode="out-in">
          <component :is="currentComponent" :key="step" class="wiz__step" />
        </Transition>
      </div>
      <div v-else class="wiz__stepcol">
        <StepSuccess @new="startNew" />
      </div>

      <!-- ریل خلاصه — فقط دسکتاپ -->
      <aside v-if="!done" class="wiz__rail">
        <div class="wiz__rail-sticky">
          <CreateSummary />
        </div>
      </aside>
    </main>

    <!-- نوار پایین: رفت‌وبرگشت / ثبت -->
    <footer v-if="!done" class="wiz__foot">
      <div class="container wiz__foot-in">
        <AButton
          variant="ghost"
          :disabled="step === 0"
          icon="arrow-right"
          @click="back"
        >
          قبلی
        </AButton>

        <div class="wiz__foot-side">
          <span v-if="estimate.total > 0" class="wiz__price">
            ~ {{ formatTomanCompact(estimate.total) }}
          </span>
          <AButton
            size="lg"
            :loading="submitting"
            :icon-end="isReview ? 'check' : 'arrow-left'"
            @click="onNext"
          >
            {{ isReview ? 'ثبت درخواست' : 'ادامه' }}
          </AButton>
        </div>
      </div>
    </footer>

    <!-- خروجی: تایید خروج -->
    <AModal v-model="showExit" title="از ویزارد خارج می‌شوی؟" size="sm">
      <p class="t-body">پیش‌نویس تو ذخیره شده و دفعه‌ی بعد از همان‌جا ادامه می‌دهی.</p>
      <template #footer>
        <AButton variant="outline" block @click="showExit = false">ادامه‌ی ویرایش</AButton>
        <AButton block @click="exitWizard">خروج</AButton>
      </template>
    </AModal>

    <!-- خروجی: خلاصه‌ی زنده (موبایل) -->
    <ADrawer v-model="showSummary" title="خلاصه‌ی درخواست">
      <CreateSummary />
      <template #footer>
        <AButton block @click="showSummary = false">بستن</AButton>
      </template>
    </ADrawer>
  </div>
</template>

<style scoped>
.wiz {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(60rem 30rem at 110% -10%, rgba(255, 90, 60, 0.05), transparent 60%),
    radial-gradient(50rem 26rem at -10% 0%, rgba(75, 68, 220, 0.05), transparent 60%),
    var(--bg);
}

/* ── نوار بالا ── */
.wiz__bar {
  position: sticky;
  top: 0;
  z-index: calc(var(--z-header) + 1);
  background: color-mix(in srgb, var(--bg) 90%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--line);
}
.wiz__bar-in {
  height: 3.6rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.wiz__close {
  width: 2.3rem; height: 2.3rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--paper);
  border: 1px solid var(--line);
  color: var(--ink-soft);
  transition: background 0.2s;
}
.wiz__close:hover { background: var(--bg-deep); }
.wiz__brand { font-size: 1.2rem; font-weight: 700; }
.wiz__brand em { color: var(--coral); font-style: normal; }
.wiz__summary-btn {
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: var(--fs-caption); font-weight: 800;
  color: var(--ink);
  border: 1px solid var(--line-strong);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.8rem;
  background: var(--paper);
  transition: border-color 0.2s;
}
.wiz__summary-btn:hover { border-color: var(--ink); }

.wiz__track { height: 2px; background: var(--line); }
.wiz__track-fill {
  display: block;
  height: 100%;
  background: var(--coral);
  transition: inline-size 0.5s var(--ease-out);
}

/* ── بدنه ── */
.wiz__meta { padding-top: 1.3rem; }
.wiz__main {
  flex: 1;
  display: grid;
  gap: var(--sp-5);
  padding-block: var(--sp-5) 2rem;
  align-content: start;
}
@media (min-width: 1024px) {
  .wiz__main {
    grid-template-columns: minmax(0, 33rem) 17rem;
    justify-content: center;
    gap: var(--sp-7);
  }
}

.wiz__step { animation: fade-up 0.45s var(--ease-out) both; }

/* ── ریل خلاصه (دسکتاپ) ── */
.wiz__rail { display: none; }
@media (min-width: 1024px) {
  .wiz__rail { display: block; }
  .wiz__stepcol { max-width: 33rem; width: 100%; }
  .wiz__rail-sticky {
    position: sticky;
    top: 6.5rem;
    background: var(--paper);
    border: 1px solid var(--line);
    border-radius: var(--r-lg);
    padding: 1.15rem 1.25rem;
  }
}

/* ── نوار پایین ── */
.wiz__foot {
  position: sticky;
  bottom: 0;
  z-index: var(--z-nav);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
}
.wiz__foot-in {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding-block: 0.7rem;
}
.wiz__foot-side { display: flex; align-items: center; gap: 0.8rem; }
.wiz__price {
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--muted);
  white-space: nowrap;
}

.step-enter-active { transition: opacity 0.3s, transform 0.3s var(--ease-out); }
.step-leave-active { transition: opacity 0.16s ease-in, transform 0.16s; }
.step-enter-from { opacity: 0; transform: translateY(14px); }
.step-leave-to { opacity: 0; transform: translateY(-8px); }
</style>
