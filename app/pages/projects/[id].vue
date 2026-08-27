<script setup lang="ts">
import type { Project, FileAttachment } from '#shared/types'
import { deadlineLabel, formatToman, formatTomanCompact } from '#shared/utils/format'
import { useProjects } from '~/composables/useProjects'
import { useConversations } from '~/composables/useConversations'
import { useAuth } from '~/composables/useAuth'

// ─────────────────────────────────────────────────────────────
// فضای کاری پروژه — بریف، پیشنهادها، تحویل‌ها و کنش‌های نقش‌محور
// موبایل: نوار اقدام چسبان پایین · فرم‌ها در شیت تمام‌صفحه
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const toast = useToast()
const fa = new Intl.NumberFormat('fa-IR')
const dateFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium' })
const timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' })

const { get, refresh } = useProjects()
const conversations = useConversations()
const { user: me } = useAuth()

const project = ref<Project | null>(null)
const myRole = ref<'client' | 'creative'>('client')
const threadId = ref<string | null>(null)
const state = ref<'loading' | 'ready' | 'notfound' | 'forbidden'>('loading')

async function load() {
  state.value = 'loading'
  const res = await get(String(route.params.id))
  if (!res) {
    // تفاوت ۴۰۴ و ۴۰۳ را سرور با پیام می‌فرستد؛ اینجا ساده می‌گیریم
    state.value = 'notfound'
    return
  }
  project.value = res.project
  myRole.value = res.myRole
  threadId.value = res.threadId
  state.value = 'ready'
}
onMounted(load)

const isClient = computed(() => myRole.value === 'client')
const status = computed(() => project.value?.status)

// ── کنش‌های وضعیت ──
const acting = ref(false)
async function action(name: string, extra: Record<string, unknown> = {}, successMsg?: string) {
  if (!project.value) return
  acting.value = true
  try {
    const res = await $fetch<{ project: Project }>(`/api/projects/${project.value.id}/status`, {
      method: 'POST',
      body: { action: name, ...extra },
    })
    project.value = res.project
    if (name === 'accept') await load() // برای گرفتن threadId
    if (successMsg) toast.success(successMsg)
    await refresh()
    await conversations.refresh()
  }
  catch (err: unknown) {
    toast.error('انجام نشد', (err as { data?: { message?: string } })?.data?.message)
  }
  finally {
    acting.value = false
  }
}

// ── شیت‌ها ──
const showProposal = ref(false)
const showDeliver = ref(false)
const showRevision = ref(false)
const showCancel = ref(false)
const showFile = ref<FileAttachment | null>(null)

const proposalForm = reactive({ price: '', deliveryDays: '', message: '' })
const proposalFiles = ref<{ name: string; url: string; size: number }[]>([])
const proposalErrors = ref<Record<string, string>>({})
const submittingProposal = ref(false)

async function submitProposal() {
  proposalErrors.value = {}
  const price = Number(proposalForm.price.replace(/\D/g, ''))
  const days = Number(proposalForm.deliveryDays.replace(/\D/g, ''))
  if (!Number.isFinite(price) || price < 100_000) proposalErrors.value.price = 'حداقل ۱۰۰٬۰۰۰ تومان.'
  if (!Number.isFinite(days) || days < 1) proposalErrors.value.deliveryDays = 'مهلت را به روز بنویس.'
  if (proposalForm.message.trim().length < 20) proposalErrors.value.message = 'حداقل ۲۰ کاراکتر توضیح بده.'
  if (Object.keys(proposalErrors.value).length) return

  submittingProposal.value = true
  try {
    await $fetch(`/api/projects/${project.value?.id}/proposal`, {
      method: 'POST',
      body: { price, deliveryDays: days, message: proposalForm.message.trim() },
    })
    showProposal.value = false
    toast.success('پیشنهادت فرستاده شد', 'پاسخ کارفرما در اعلان‌ها می‌رسد.')
    proposalForm.price = proposalForm.deliveryDays = proposalForm.message = ''
    await load()
  }
  catch (err: unknown) {
    toast.error('ارسال نشد', (err as { data?: { message?: string } })?.data?.message)
  }
  finally {
    submittingProposal.value = false
  }
}

const deliverForm = reactive({ note: '' })
const deliverFiles = ref<{ name: string; url: string; size: number }[]>([])
const deliverErrors = ref<Record<string, string>>({})
const submittingDeliver = ref(false)

async function submitDeliverable() {
  deliverErrors.value = {}
  if (deliverForm.note.trim().length < 10) deliverErrors.value.note = 'حداقل ۱۰ کاراکتر درباره‌ی کار بنویس.'
  if (!deliverFiles.value.length) deliverErrors.value.files = 'حداقل یک فایل خروجی لازم است.'
  if (Object.keys(deliverErrors.value).length) return

  submittingDeliver.value = true
  try {
    await $fetch(`/api/projects/${project.value?.id}/deliverable`, {
      method: 'POST',
      body: { note: deliverForm.note.trim(), files: deliverFiles.value },
    })
    showDeliver.value = false
    deliverForm.note = ''
    deliverFiles.value = []
    toast.success('کار ارسال شد', 'کارفرما بررسی می‌کند و نتیجه را می‌گوید.')
    await load()
  }
  catch (err: unknown) {
    toast.error('ارسال نشد', (err as { data?: { message?: string } })?.data?.message)
  }
  finally {
    submittingDeliver.value = false
  }
}

const revisionForm = reactive({ note: '' })
const revisionErrors = ref<Record<string, string>>({})
const submittingRevision = ref(false)

async function submitRevision() {
  revisionErrors.value = {}
  if (revisionForm.note.trim().length < 10) revisionErrors.value.note = 'نظرت را دقیق بنویس (حداقل ۱۰ کاراکتر).'
  if (Object.keys(revisionErrors.value).length) return

  submittingRevision.value = true
  try {
    await $fetch(`/api/projects/${project.value?.id}/revision`, {
      method: 'POST',
      body: { note: revisionForm.note.trim() },
    })
    showRevision.value = false
    revisionForm.note = ''
    toast.success('اصلاحیه ثبت شد', 'خلاق بازخوردت را می‌بیند و نسخه‌ی جدید می‌فرستد.')
    await load()
  }
  catch (err: unknown) {
    toast.error('ثبت نشد', (err as { data?: { message?: string } })?.data?.message)
  }
  finally {
    submittingRevision.value = false
  }
}

async function acceptProposal(proposalId: string, name: string) {
  await action('accept', { proposalId }, `پروژه با ${name} شروع شد؛ فضای گفتگو آماده است.`)
}

const canPropose = computed(() =>
  status.value === 'receiving' && !isClient.value
  && !!me.value
  && !project.value?.proposals.some(p => p.creativeId === me.value?.id))

const myProposal = computed(() =>
  project.value?.proposals.find(p => p.creativeId === me.value?.id))

const timeline = computed(() => {
  if (!project.value) return []
  const steps = [
    { key: 'draft', label: 'ساخت' },
    { key: 'receiving', label: 'جذب پیشنهاد' },
    { key: 'in_progress', label: 'اجرا' },
    { key: 'ready_for_approval', label: 'آماده‌ی تأیید' },
    { key: 'completed', label: 'تکمیل' },
  ] as const
  const order: Record<string, number> = {
    draft: 0, published: 1, receiving: 1, in_progress: 2,
    revision_requested: 3, ready_for_approval: 3, completed: 4, cancelled: -1,
  }
  const cur = order[status.value ?? 'draft'] ?? 0
  return steps.map((s, i) => ({
    ...s,
    done: cur > i,
    current: cur === i,
  }))
})

useHead(() => ({ title: project.value ? `${project.value.title} — پروژه | آرتیوو` : 'پروژه | آرتیوو' }))
</script>

<template>
  <div class="container pw">
    <!-- ── حالت‌های خطا ── -->
    <div v-if="state === 'loading'" class="pw__state">
      <ASkeleton h="2.4rem" w="60%" radius="10px" />
      <ASkeleton h="9rem" radius="16px" />
      <ASkeleton h="6rem" radius="16px" />
    </div>
    <AEmptyState
      v-else-if="state === 'notfound'"
      class="pw__state"
      icon="briefcase"
      title="پروژه پیدا نشد"
      description="ممکن است در دسترس تو نباشد یا حذف شده باشد."
    >
      <AButton to="/projects" size="sm">پروژه‌های من</AButton>
    </AEmptyState>

    <template v-else-if="project">
      <!-- ── سربرگ ── -->
      <header class="head" v-reveal>
        <NuxtLink to="/projects" class="crumbs">
          <AIcon name="arrow-right" :size="14" />
          پروژه‌های من
        </NuxtLink>
        <div class="head__row">
          <h1 class="t-h1 head__title">{{ project.title }}</h1>
          <StatusTag :status="project.status" />
        </div>
        <div class="head__meta">
          <span class="latin head__code">{{ project.code }}</span>
          <span>{{ project.typeLabel }}</span>
          <span v-if="project.deadlineDays">· {{ deadlineLabel(project.deadlineDays) }}</span>
          <span v-if="project.budgetMax">· بودجه تا {{ formatTomanCompact(project.budgetMax) }}</span>
        </div>

        <!-- نوار پیشرفت -->
        <ol v-if="project.status !== 'cancelled'" class="steps" aria-label="مراحل پروژه">
          <li v-for="(s, i) in timeline" :key="s.key" class="steps__item" :class="{ 'steps__item--done': s.done, 'steps__item--now': s.current }">
            <span class="steps__dot" />
            <span class="steps__label">{{ s.label }}</span>
            <span v-if="i < timeline.length - 1" class="steps__bar" />
          </li>
        </ol>
        <p v-else class="head__cancelled">این پروژه لغو شده است.</p>
      </header>

      <!-- ── نوار اقدام چسبان موبایل ── -->
      <nav class="cta" aria-label="اقدام‌های پروژه">
        <button
          v-if="isClient && status === 'draft'"
          class="cta__btn cta__btn--primary"
          :disabled="acting"
          @click="action('publish', {}, 'پروژه منتشر شد')"
        >
          <AIcon name="send" :size="16" /> انتشار پروژه
        </button>
        <button
          v-else-if="isClient && status === 'published'"
          class="cta__btn cta__btn--primary"
          :disabled="acting"
          @click="action('open', {}, 'دریافت پیشنهادها باز شد')"
        >
          <AIcon name="users" :size="16" /> شروع دریافت پیشنهاد
        </button>
        <button
          v-else-if="canPropose"
          class="cta__btn cta__btn--primary"
          @click="showProposal = true"
        >
          <AIcon name="send" :size="16" /> ارسال پیشنهاد
        </button>
        <button
          v-else-if="!isClient && myRole === 'creative' && (status === 'in_progress' || status === 'revision_requested')"
          class="cta__btn cta__btn--primary"
          @click="showDeliver = true"
        >
          <AIcon name="upload" :size="16" /> {{ status === 'revision_requested' ? 'ارسال نسخه‌ی اصلاح‌شده' : 'ارسال کار' }}
        </button>
        <template v-else-if="isClient && status === 'ready_for_approval'">
          <button class="cta__btn" @click="showRevision = true">
            <AIcon name="pen" :size="15" /> درخواست اصلاحیه
          </button>
          <button class="cta__btn cta__btn--primary" :disabled="acting" @click="action('approve', {}, 'پروژه تکمیل شد 🎉')">
            <AIcon name="check" :size="16" /> تأیید و تکمیل
          </button>
        </template>
        <NuxtLink v-if="threadId" :to="`/messages/${threadId}`" class="cta__btn">
          <AIcon name="send" :size="15" /> گفتگو
        </NuxtLink>
        <button
          v-if="isClient && !['completed', 'cancelled', 'draft'].includes(status ?? '')"
          class="cta__btn cta__btn--danger"
          @click="showCancel = true"
        >
          لغو
        </button>
      </nav>

      <!-- ── بدنه ── -->
      <div class="body">
        <div class="main">
          <!-- بریف -->
          <section class="panel block" v-reveal>
            <h2 class="block__h">بریف پروژه</h2>
            <p class="brief">{{ project.description }}</p>
          </section>

          <!-- پیشنهادها (کارفرما) -->
          <section v-if="isClient && project.proposals.length" class="block" v-reveal>
            <h2 class="block__h block__h--sec">
              پیشنهادها
              <span class="block__badge">{{ fa.format(project.proposals.length) }}</span>
            </h2>
            <article
              v-for="pr in project.proposals"
              :key="pr.id"
              class="panel prop"
              :class="`prop--${pr.status}`"
            >
              <div class="prop__head">
                <strong class="prop__name">{{ pr.creativeName }}</strong>
                <ATag :label="pr.status === 'pending' ? 'در انتظار' : pr.status === 'accepted' ? 'پذیرفته شد' : 'رد شد'" :tone="pr.status === 'accepted' ? 'green' : pr.status === 'rejected' ? 'coral' : 'amber'" dot />
              </div>
              <div class="prop__facts">
                <span><AIcon name="wallet" :size="13" /> {{ formatToman(pr.price) }}</span>
                <span><AIcon name="clock" :size="13" /> {{ deadlineLabel(pr.deliveryDays) }}</span>
                <span><AIcon name="calendar" :size="13" /> {{ dateFmt.format(new Date(pr.createdAt)) }}</span>
              </div>
              <p class="prop__msg">{{ pr.message }}</p>
              <div v-if="pr.status === 'pending'" class="prop__actions">
                <AButton size="sm" variant="outline" @click="action('reject', { proposalId: pr.id })">رد</AButton>
                <AButton size="sm" :loading="acting" @click="acceptProposal(pr.id, pr.creativeName)">
                  پذیرش و شروع پروژه
                </AButton>
              </div>
            </article>
          </section>

          <!-- پیشنهاد من (خلاق) -->
          <section v-else-if="!isClient && myProposal" class="block" v-reveal>
            <h2 class="block__h block__h--sec">پیشنهاد تو</h2>
            <div class="panel prop prop--mine">
              <div class="prop__facts">
                <span><AIcon name="wallet" :size="13" /> {{ formatToman(myProposal.price) }}</span>
                <span><AIcon name="clock" :size="13" /> {{ deadlineLabel(myProposal.deliveryDays) }}</span>
              </div>
              <p class="prop__msg">{{ myProposal.message }}</p>
              <ATag
                :label="myProposal.status === 'pending' ? 'در انتظار پاسخ کارفرما' : myProposal.status === 'accepted' ? 'پذیرفته شد ✨' : 'پذیرفته نشد'"
                :tone="myProposal.status === 'accepted' ? 'green' : myProposal.status === 'rejected' ? 'coral' : 'amber'"
                dot
              />
            </div>
          </section>

          <!-- تحویل‌ها و بازنگری‌ها -->
          <section v-if="project.deliverables.length" class="block" v-reveal>
            <h2 class="block__h block__h--sec">
              تحویل‌ها و بازخوردها
              <span class="block__badge">{{ fa.format(project.deliverables.length) }}</span>
            </h2>
            <article
              v-for="d in project.deliverables"
              :key="d.id"
              class="panel del"
              :class="{ 'del--revision': d.files.length === 0 }"
            >
              <div class="del__head">
                <strong>{{ d.authorName }}</strong>
                <span class="del__meta">
                  {{ d.files.length === 0 ? `درخواست اصلاحیه ${fa.format(d.revisionNo)}` : d.revisionNo === 0 ? 'نسخه‌ی اول' : `نسخه‌ی اصلاح ${fa.format(d.revisionNo)}` }}
                  · {{ timeFmt.format(new Date(d.createdAt)) }}
                </span>
              </div>
              <p class="del__note" :class="{ 'del__note--rev': d.files.length === 0 }">{{ d.note }}</p>
              <div v-if="d.files.length" class="del__files">
                <button v-for="f in d.files" :key="f.id" type="button" class="del__file" @click="showFile = f">
                  <img v-if="f.url.startsWith('data:image')" :src="f.url" :alt="f.name">
                  <span v-else class="del__file-icon"><AIcon name="file" :size="17" /></span>
                  <span class="del__fname">{{ f.name }}</span>
                </button>
              </div>
            </article>
          </section>
        </div>

        <!-- ستون کنار (دسکتاپ) -->
        <aside class="side" v-reveal>
          <div class="panel side__card">
            <h3 class="side__h">طرف‌های پروژه</h3>
            <div class="side__party">
              <span class="side__avatar">{{ project.clientName.charAt(0) }}</span>
              <div>
                <strong>{{ project.clientName }}</strong>
                <small>کارفرما</small>
              </div>
            </div>
            <div v-if="project.creativeName" class="side__party">
              <span class="side__avatar side__avatar--c">{{ project.creativeName.charAt(0) }}</span>
              <div>
                <strong>{{ project.creativeName }}</strong>
                <small>خلاق</small>
              </div>
            </div>
            <NuxtLink v-if="threadId" :to="`/messages/${threadId}`" class="side__chat">
              <AIcon name="send" :size="15" />
              رفتن به گفتگو
            </NuxtLink>
          </div>

          <div class="panel side__card side__card--desktop-actions">
            <!-- کنش‌های دسکتاپ — همان نوار موبایل -->
            <template v-if="isClient && status === 'draft'">
              <AButton block :loading="acting" @click="action('publish', {}, 'پروژه منتشر شد')">انتشار پروژه</AButton>
              <AButton block variant="ghost" :disabled="acting" @click="showCancel = true">لغو پروژه</AButton>
            </template>
            <template v-else-if="isClient && status === 'published'">
              <AButton block :loading="acting" @click="action('open', {}, 'دریافت پیشنهادها باز شد')">شروع دریافت پیشنهاد</AButton>
            </template>
            <template v-else-if="isClient && status === 'ready_for_approval'">
              <AButton block :loading="acting" @click="action('approve', {}, 'پروژه تکمیل شد 🎉')">تأیید و تکمیل پروژه</AButton>
              <AButton block variant="outline" @click="showRevision = true">درخواست اصلاحیه</AButton>
            </template>
            <AButton
              v-if="!isClient && myRole === 'creative' && (status === 'in_progress' || status === 'revision_requested')"
              block
              @click="showDeliver = true"
            >
              {{ status === 'revision_requested' ? 'ارسال نسخه‌ی اصلاح‌شده' : 'ارسال کار' }}
            </AButton>
          </div>
        </aside>
      </div>

      <!-- ═══ شیت پیشنهاد (خلاق) ═══ -->
      <ADrawer v-model="showProposal" title="ارسال پیشنهاد برای این پروژه">
        <div class="form">
          <div class="form__grid">
            <AInput v-model="proposalForm.price" label="قیمت پیشنهادی (تومان)" dir="ltr" inputmode="numeric" placeholder="5000000" :error="proposalErrors.price" @update:model-value="proposalForm.price = proposalForm.price.replace(/\D/g, '')" />
            <AInput v-model="proposalForm.deliveryDays" label="مهلت تحویل (روز)" dir="ltr" inputmode="numeric" placeholder="10" :error="proposalErrors.deliveryDays" @update:model-value="proposalForm.deliveryDays = proposalForm.deliveryDays.replace(/\D/g, '')" />
          </div>
          <ATextarea v-model="proposalForm.message" label="چرا تو بهترین انتخابی؟" placeholder="رویکردت، تجربه‌ی مرتبط و برنامه‌ی اجرا…" :rows="4" :maxlength="800" counter :error="proposalErrors.message" />
          <p class="form__note t-caption">پیشنهاد فقط برای کارفرمای این پروژه نمایش داده می‌شود.</p>
        </div>
        <template #footer>
          <AButton block :loading="submittingProposal" icon-end="send" @click="submitProposal">ارسال پیشنهاد</AButton>
        </template>
      </ADrawer>

      <!-- ═══ شیت ارسال کار (خلاق) ═══ -->
      <ADrawer v-model="showDeliver" title="ارسال کار برای تأیید">
        <div class="form">
          <ATextarea v-model="deliverForm.note" label="توضیح تحویل" placeholder="چه تحویل داده‌ای؟ نکات فایل‌ها را بنویس…" :rows="3" :maxlength="600" counter :error="deliverErrors.note" />
          <FilePicker v-model="deliverFiles" :max="4" label="افزودن فایل‌های خروجی" />
          <p v-if="deliverErrors.files" class="err">{{ deliverErrors.files }}</p>
          <p class="form__note t-caption">با ارسال، وضعیت پروژه به «آماده‌ی تأیید» می‌رود.</p>
        </div>
        <template #footer>
          <AButton block :loading="submittingDeliver" icon-end="upload" @click="submitDeliverable">ارسال برای تأیید</AButton>
        </template>
      </ADrawer>

      <!-- ═══ شیت اصلاحیه (کارفرما) ═══ -->
      <ADrawer v-model="showRevision" title="درخواست اصلاحیه">
        <div class="form">
          <ATextarea v-model="revisionForm.note" label="بازخوردت را دقیق بنویس" placeholder="چه چیزهایی باید تغییر کند؟ تا جایی که می‌توانی مشخص کن…" :rows="4" :maxlength="800" counter :error="revisionErrors.note" />
          <p class="form__note t-caption">خلاق نسخه‌ی اصلاح‌شده را دوباره برای تأیید می‌فرستد.</p>
        </div>
        <template #footer>
          <AButton block :loading="submittingRevision" icon-end="pen" @click="submitRevision">ثبت درخواست اصلاحیه</AButton>
        </template>
      </ADrawer>

      <!-- لغو پروژه -->
      <AModal v-model="showCancel" title="لغو پروژه؟" size="sm">
        <p class="t-body">پروژه به وضعیت «لغوشده» می‌رود و قابل بازگشت نیست. گفتگو و سابقه باقی می‌ماند.</p>
        <template #footer>
          <AButton variant="outline" @click="showCancel = false">منصرف شدم</AButton>
          <AButton :loading="acting" @click="showCancel = false; action('cancel', {}, 'پروژه لغو شد')">لغو پروژه</AButton>
        </template>
      </AModal>

      <!-- پیش‌نمایش فایل -->
      <AModal :model-value="showFile !== null" :title="showFile?.name ?? 'فایل'" size="lg" @update:model-value="v => !v && (showFile = null)">
        <div v-if="showFile" class="fileview">
          <img v-if="showFile.url.startsWith('data:image')" :src="showFile.url" :alt="showFile.name">
          <div v-else class="fileview__generic"><AIcon name="file" :size="40" /></div>
          <a :href="showFile.url" :download="showFile.name" class="fileview__dl">
            <AIcon name="download" :size="15" />
            دانلود {{ showFile.name }}
          </a>
        </div>
      </AModal>
    </template>
  </div>
</template>

<style scoped>
.pw { padding-bottom: 2rem; }
.pw__state { display: grid; gap: 0.7rem; padding-block: 2rem; }

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

.head { padding-top: 1.2rem; display: grid; gap: 0.6rem; }
.head__row { display: flex; align-items: center; gap: 0.7rem; flex-wrap: wrap; }
.head__title { font-size: clamp(1.4rem, 5vw, 2.2rem); overflow-wrap: anywhere; }
.head__meta { display: flex; flex-wrap: wrap; gap: 0.3rem 0.6rem; font-size: var(--fs-caption); color: var(--muted); }
.head__code { background: var(--bg-deep); border-radius: var(--r-xs); padding: 0.15rem 0.45rem; font-size: 0.64rem; font-weight: 700; }
.head__cancelled { font-size: var(--fs-small); font-weight: 800; color: var(--coral-deep); }

/* نوار مراحل */
.steps { display: flex; gap: 0.2rem; margin-top: 0.4rem; overflow-x: auto; scrollbar-width: none; padding-block: 0.2rem; }
.steps::-webkit-scrollbar { display: none; }
.steps__item { display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0; }
.steps__dot {
  width: 0.85rem; height: 0.85rem;
  border-radius: 99px;
  border: 2px solid var(--line-strong);
  background: var(--paper);
  flex-shrink: 0;
}
.steps__item--done .steps__dot { background: var(--green); border-color: var(--green); }
.steps__item--now .steps__dot { border-color: var(--coral); box-shadow: 0 0 0 3px var(--coral-soft); }
.steps__label { font-size: 0.66rem; font-weight: 800; color: var(--muted); white-space: nowrap; }
.steps__item--now .steps__label { color: var(--ink); }
.steps__item--done .steps__label { color: var(--green); }
.steps__bar { width: 1.6rem; height: 2px; background: var(--line-strong); border-radius: 2px; }
.steps__item--done .steps__bar { background: var(--green); }

/* نوار اقدام چسبان */
.cta {
  position: sticky;
  bottom: calc(5.2rem + env(safe-area-inset-bottom));
  z-index: 20;
  display: flex;
  gap: 0.5rem;
  padding-block: 0.6rem;
  margin-top: 0.8rem;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-block: 1px solid var(--line);
  overflow-x: auto;
  scrollbar-width: none;
}
.cta::-webkit-scrollbar { display: none; }
@media (min-width: 900px) { .cta { display: none; } }
.cta__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  min-height: 44px;
  padding-inline: 1rem;
  border-radius: var(--r-pill);
  border: 1px solid var(--line-strong);
  background: var(--paper);
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink);
  transition: all 0.15s;
  flex-shrink: 0;
}
.cta__btn:hover { border-color: var(--ink); }
.cta__btn--primary { background: var(--ink); border-color: var(--ink); color: var(--bg); }
.cta__btn--danger { color: var(--coral-deep); }

.body { display: grid; gap: var(--sp-6); margin-top: var(--sp-5); }
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 19rem; align-items: start; }
  .side { position: sticky; top: 5rem; }
}
.main { display: grid; gap: var(--sp-6); min-width: 0; }
.block { display: grid; gap: 0.8rem; }
.block__h { font-size: var(--fs-lg); font-weight: 900; display: flex; align-items: center; gap: 0.5rem; }
.block__h--sec { margin-bottom: 0.2rem; }
.block__badge {
  min-width: 1.4rem; height: 1.4rem;
  display: grid; place-items: center;
  background: var(--ink);
  color: var(--bg);
  border-radius: 99px;
  font-size: 0.66rem;
}
.brief { font-size: var(--fs-md); line-height: 2.1; color: var(--ink-soft); white-space: pre-wrap; overflow-wrap: anywhere; }

.prop { display: grid; gap: 0.55rem; padding: 1rem 1.1rem; border-inline-start: 3px solid var(--line-strong); }
.prop--accepted { border-inline-start-color: var(--green); }
.prop--rejected { border-inline-start-color: var(--coral); opacity: 0.75; }
.prop--mine { border-inline-start-color: var(--indigo); }
.prop__head { display: flex; align-items: center; justify-content: space-between; gap: 0.7rem; }
.prop__name { font-size: var(--fs-md); font-weight: 900; }
.prop__facts { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; font-size: var(--fs-caption); font-weight: 700; color: var(--ink-soft); }
.prop__facts span { display: inline-flex; align-items: center; gap: 0.3rem; }
.prop__msg { font-size: var(--fs-small); color: var(--muted); line-height: 1.95; overflow-wrap: anywhere; }
.prop__actions { display: flex; gap: 0.5rem; justify-content: flex-end; flex-wrap: wrap; }

.del { display: grid; gap: 0.5rem; padding: 1rem 1.1rem; }
.del--revision { background: var(--amber-soft); border: 1px solid color-mix(in srgb, var(--amber) 30%, transparent); }
.del__head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.7rem; flex-wrap: wrap; }
.del__head strong { font-size: var(--fs-small); font-weight: 900; }
.del__meta { font-size: 0.64rem; color: var(--faint); }
.del__note { font-size: var(--fs-small); color: var(--ink-soft); line-height: 1.95; overflow-wrap: anywhere; }
.del__note--rev { color: var(--ink); font-weight: 600; }
.del__files { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.del__file {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-sm);
  padding: 0.35rem 0.6rem 0.35rem 0.4rem;
  transition: all 0.15s;
}
.del__file:hover { border-color: var(--ink); }
.del__file img { width: 2.4rem; height: 2.4rem; border-radius: var(--r-xs); object-fit: cover; }
.del__file-icon { width: 2.4rem; height: 2.4rem; display: grid; place-items: center; background: var(--bg-deep); border-radius: var(--r-xs); }
.del__fname { font-size: var(--fs-caption); font-weight: 700; max-width: 9rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }

.side { display: grid; gap: 0.8rem; }
.side__card { display: grid; gap: 0.7rem; padding: 1.1rem 1.2rem; }
.side__h { font-size: var(--fs-small); font-weight: 900; }
.side__party { display: flex; align-items: center; gap: 0.6rem; }
.side__party strong { display: block; font-size: var(--fs-small); }
.side__party small { font-size: 0.66rem; color: var(--muted); }
.side__avatar {
  width: 2.5rem; height: 2.5rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  font-weight: 900;
  flex-shrink: 0;
}
.side__avatar--c { background: var(--indigo); color: #fff; }
.side__chat {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  border: 1px solid var(--coral);
  border-radius: var(--r-pill);
  padding: 0.5rem 1rem;
  width: fit-content;
  transition: all 0.2s;
}
.side__chat:hover { background: var(--coral); color: #fff; }
.side__card--desktop-actions { display: none; }
@media (min-width: 900px) {
  .side__card--desktop-actions { display: grid; }
  .cta { display: none; }
}

.form { display: grid; gap: 0.9rem; }
.form__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem; }
.form__note { color: var(--faint); }
.err { font-size: var(--fs-caption); font-weight: 700; color: var(--coral-deep); }

.fileview { display: grid; gap: 0.8rem; justify-items: center; }
.fileview img { max-width: 100%; max-height: 60vh; border-radius: var(--r-md); }
.fileview__generic { padding: 3rem; color: var(--faint); }
.fileview__dl {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--coral-deep);
  border: 1px solid var(--coral);
  border-radius: var(--r-pill);
  padding: 0.5rem 1rem;
}
.fileview__dl:hover { background: var(--coral); color: #fff; }
</style>
