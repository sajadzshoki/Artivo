<script setup lang="ts">
import type { Job, LightboxSlide } from '#shared/types'
import { jobCategoryLabels, jobCategoryIcons, workplaceLabels } from '#shared/config/job-categories'
import { getJob, jobs } from '#shared/data/jobs'
import { deadlineLabel } from '#shared/utils/format'
import { postedLabel } from '~/composables/useJobsQuery'
import { useSavedJobs } from '~/composables/useSavedJobs'
import { useJobProposals } from '~/composables/useJobProposals'

// ─────────────────────────────────────────────────────────────
// جزئیات پروژه‌ی باز — بریف کامل + ارسال پیشنهاد
// ─────────────────────────────────────────────────────────────
const route = useRoute()
// وضعیت ادمین (بسته/متوقف/حذف‌شده) + وصله‌ی عنوان/فوریت از هم‌پوشانی
const { overlay } = useOverlay()
const job = computed(() => {
  const base = getJob(String(route.params.id))
  if (!base) return undefined
  if (overlay.value.closedJobIds.includes(base.id) || overlay.value.deletedJobIds.includes(base.id)) return undefined
  return { ...base, ...(overlay.value.jobOverrides[base.id] ?? {}) }
})

if (!job.value) {
  throw createError({ statusCode: 404, message: 'پروژه پیدا نشد', fatal: false })
}

const j = job.value as Job
useHead({ title: `${j.title} — پروژه‌ی باز | آرتیوو` })

const fa = new Intl.NumberFormat('fa-IR')
const toast = useToast()
const { isSaved, toggle: toggleSaved } = useSavedJobs()
const { hasProposed } = useJobProposals()

const showProposal = ref(false)
const lightboxIndex = ref<number | null>(null)

const existing = computed(() => hasProposed(j.id))
const deadline = computed(() => deadlineLabel(j.deadlineDays))

const referenceItems = computed<LightboxSlide[]>(() =>
  j.brief.referenceImages.map((src, i) => ({
    id: `ref-${i}`,
    title: `${j.title} — تصویر مرجع ${fa.format(i + 1)}`,
    cover: src,
  })))

const similar = computed(() =>
  [...jobs]
    .filter(x => x.id !== j.id && (x.categoryId === j.categoryId || x.kinds.some(k => j.kinds.includes(k))))
    .sort((a, b) => Number(b.categoryId === j.categoryId) - Number(a.categoryId === j.categoryId))
    .slice(0, 3))

function onSave() {
  const now = toggleSaved(j.id)
  toast.success(now ? 'ذخیره شد' : 'از ذخیره‌شده‌ها حذف شد', j.title)
}

async function share() {
  const url = window.location.href
  try {
    if (navigator.share) {
      await navigator.share({ title: j.title, url })
    }
    else {
      await navigator.clipboard.writeText(url)
      toast.success('لینک کپی شد', 'این پروژه را با هم‌تیمی‌هایت به اشتراک بگذار.')
    }
  }
  catch { /* لغو توسط کاربر */ }
}

const clientInitials = computed(() => j.client.name.split(' ').map(w => w[0]).slice(0, 2).join(''))
</script>

<template>
  <div class="container jd">
    <nav class="crumbs" aria-label="مسیر">
      <NuxtLink to="/jobs">پروژه‌های باز</NuxtLink>
      <AIcon name="chevron-left" :size="13" />
      <span>{{ jobCategoryLabels[j.categoryId] }}</span>
    </nav>

    <!-- ── سربرگ ── -->
    <header class="head" v-reveal>
      <div class="head__top">
        <span class="head__cat"><AIcon :name="jobCategoryIcons[j.categoryId]" :size="15" /> {{ jobCategoryLabels[j.categoryId] }}</span>
        <ATag v-if="j.urgent" label="فوری" tone="coral" dot />
        <ATag :label="workplaceLabels[j.workplace]" tone="indigo" />
        <span class="head__posted">{{ postedLabel(j.postedDaysAgo) }}</span>
      </div>

      <h1 class="t-display head__title">{{ j.title }}</h1>
      <p class="t-body-lg head__desc">{{ j.description }}</p>

      <div class="head__actions">
        <button type="button" class="head__action" :class="{ 'head__action--on': isSaved(j.id) }" @click="onSave">
          <AIcon name="bookmark" :size="16" :fill="isSaved(j.id)" />
          {{ isSaved(j.id) ? 'ذخیره شد' : 'ذخیره' }}
        </button>
        <button type="button" class="head__action" @click="share">
          <AIcon name="link" :size="16" />
          اشتراک‌گذاری
        </button>
        <span class="head__proposals"><AIcon name="send" :size="14" /> {{ fa.format(j.proposalsCount) }} پیشنهاد ثبت شده</span>
      </div>
    </header>

    <!-- ── نوار آمار ── -->
    <dl class="stats" v-reveal>
      <div class="stats__item">
        <dt>بودجه‌ی کارفرما</dt>
        <dd>{{ formatTomanCompact(j.budgetMin) }} <em>تا</em> {{ formatTomanCompact(j.budgetMax) }}</dd>
      </div>
      <div class="stats__item">
        <dt>مهلت تحویل</dt>
        <dd>{{ fa.format(j.deadlineDays) }} روز</dd>
      </div>
      <div class="stats__item">
        <dt>محل اجرا</dt>
        <dd>{{ j.location }}</dd>
      </div>
      <div class="stats__item">
        <dt>مهلت اتمام فرصت</dt>
        <dd class="stats__date">{{ deadline }}</dd>
      </div>
    </dl>

    <!-- ── بدنه ── -->
    <div class="body">
      <article class="brief" v-reveal>
        <span class="section-head__kicker">بریف کامل پروژه</span>

        <div class="brief__paras">
          <p v-for="(p, i) in j.brief.paragraphs" :key="i">{{ p }}</p>
        </div>

        <section class="brief__sec">
          <h2 class="brief__h">الزامات و انتظارات</h2>
          <ul class="brief__list">
            <li v-for="r in j.brief.requirements" :key="r">
              <AIcon name="check-circle" :size="16" />
              {{ r }}
            </li>
          </ul>
        </section>

        <section class="brief__sec">
          <h2 class="brief__h">تحویل‌دادنی‌ها</h2>
          <div class="brief__dels">
            <ATag v-for="d in j.brief.deliverables" :key="d" :label="d" tone="green" />
          </div>
        </section>

        <section v-if="j.brief.referenceImages.length" class="brief__sec">
          <h2 class="brief__h">تصاویر مرجع</h2>
          <div class="brief__refs">
            <button
              v-for="(img, i) in j.brief.referenceImages"
              :key="img"
              type="button"
              class="brief__ref"
              @click="lightboxIndex = i"
              :aria-label="`بزرگ‌نمایی تصویر ${fa.format(i + 1)}`"
            >
              <img :src="img" :alt="`تصویر مرجع ${fa.format(i + 1)} پروژه`" loading="lazy" width="360" height="270">
            </button>
          </div>
        </section>

        <section v-if="j.brief.referenceLinks.length" class="brief__sec">
          <h2 class="brief__h">لینک‌های مرجع</h2>
          <div class="brief__links">
            <span v-for="l in j.brief.referenceLinks" :key="l.url" class="brief__link">
              <AIcon name="link" :size="14" />
              {{ l.label }}
              <code class="latin">{{ l.url }}</code>
            </span>
          </div>
        </section>

        <!-- کارفرما -->
        <section class="brief__sec">
          <h2 class="brief__h">درباره‌ی کارفرما</h2>
          <div class="client">
            <span class="client__avatar latin">{{ clientInitials }}</span>
            <div class="client__body">
              <div class="client__name">
                <strong>{{ j.client.name }}</strong>
                <ATag v-if="j.client.verified" label="تأییدشده" tone="green" icon="shield" />
              </div>
              <p class="client__about">{{ j.client.about }}</p>
              <div class="client__meta">
                <span><ARating :rating="j.client.rating" :size="12" show-value /></span>
                <span>{{ fa.format(j.client.jobsPosted) }} پروژه منتشر کرده</span>
                <span>عضو از {{ j.client.memberSince }}</span>
              </div>
            </div>
          </div>
        </section>
      </article>

      <!-- ── ستون کنار: پنل ارسال پیشنهاد ── -->
      <aside class="side" v-reveal>
        <div class="side__sticky">
          <template v-if="existing">
            <div class="sent">
              <span class="sent__icon"><AIcon name="check-circle" :size="22" /></span>
              <strong>پیشنهادت ارسال شده</strong>
              <span class="sent__price">{{ formatTomanCompact(existing.price) }} · {{ fa.format(existing.deliveryDays) }} روز</span>
              <span class="sent__hint">پاسخ کارفرما در «پیشنهادهای من» دیده می‌شود.</span>
              <AButton size="sm" variant="outline" block @click="showProposal = true">ویرایش پیشنهاد</AButton>
            </div>
          </template>
          <template v-else>
            <p class="side__label">قیمت کارفرما</p>
            <p class="side__budget">{{ formatToman(j.budgetMin) }} <em>تا</em> {{ formatToman(j.budgetMax) }}</p>
            <ul class="side__points">
              <li><AIcon name="check" :size="14" /> پیشنهاد در چند دقیقه ثبت می‌شود</li>
              <li><AIcon name="check" :size="14" /> بدون نیاز به ثبت‌نام در فاز فعلی</li>
              <li><AIcon name="check" :size="14" /> امکان ویرایش تا انتخاب نهایی</li>
            </ul>
            <AButton size="lg" block icon-end="send" @click="showProposal = true">ارسال پیشنهاد</AButton>
            <p class="side__note">پاسخ معمولاً ظرف چند روز در پروفایل شما اعلام می‌شود.</p>
          </template>
        </div>
      </aside>
    </div>

    <!-- ── پروژه‌های مشابه ── -->
    <section v-if="similar.length" class="section" v-reveal>
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">مشابه این پروژه</span>
          <h2 class="t-h2">فرصت‌های دیگر</h2>
        </div>
        <NuxtLink to="/jobs" class="section-head__link">
          همه‌ی پروژه‌ها
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>
      <div class="similar">
        <JobCard v-for="s in similar" :key="s.id" :job="s" />
      </div>
    </section>

    <!-- نوار پایین موبایل -->
    <footer class="bar">
      <div class="bar__in">
        <div class="bar__budget">
          <span>بودجه کارفرما</span>
          <strong>{{ formatTomanCompact(j.budgetMin) }} تا {{ formatTomanCompact(j.budgetMax) }}</strong>
        </div>
        <AButton v-if="!existing" size="md" icon-end="send" @click="showProposal = true">ارسال پیشنهاد</AButton>
        <AButton v-else size="md" variant="outline" @click="showProposal = true">ویرایش پیشنهاد</AButton>
      </div>
    </footer>

    <ProposalModal v-model="showProposal" :job="j" />
    <Lightbox v-model="lightboxIndex" :items="referenceItems" />
  </div>
</template>

<style scoped>
.jd { padding-bottom: 5rem; }
@media (min-width: 900px) { .jd { padding-bottom: 2rem; } }

.crumbs {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding-top: 1.4rem;
  font-size: var(--fs-caption);
  color: var(--muted);
}
.crumbs a:hover { color: var(--coral); }
.crumbs span:last-child { color: var(--ink); font-weight: 700; }

/* ── سربرگ ── */
.head { display: grid; gap: 0.7rem; margin-top: 1.4rem; justify-items: start; }
.head__top { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.head__cat {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: var(--fs-small);
  font-weight: 800;
  color: var(--indigo-deep);
}
.head__posted { font-size: var(--fs-caption); color: var(--faint); }
.head__title { font-size: clamp(1.7rem, 5.5vw, 3rem); }
.head__desc { max-width: 38rem; }
.head__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 0.5rem; }
.head__action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  border: 1px solid var(--line-strong);
  background: var(--paper);
  border-radius: var(--r-pill);
  padding: 0.42rem 0.95rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--ink-soft);
  transition: all 0.2s;
}
.head__action:hover { border-color: var(--ink); color: var(--ink); }
.head__action--on { color: var(--coral); border-color: var(--coral); background: var(--coral-soft); }
.head__proposals { display: inline-flex; align-items: center; gap: 0.35rem; font-size: var(--fs-caption); color: var(--muted); margin-inline-start: auto; }

/* ── آمار ── */
.stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  margin-top: 1.4rem;
}
@media (min-width: 768px) { .stats { grid-template-columns: repeat(4, 1fr); } }
.stats__item {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.75rem 0.9rem;
  display: grid;
  gap: 0.15rem;
}
.stats__item dt { font-size: 0.66rem; color: var(--muted); font-weight: 700; }
.stats__item dd { font-size: var(--fs-caption); font-weight: 900; }
.stats__item dd em { font-style: normal; font-size: 0.64rem; color: var(--faint); }
.stats__date { font-weight: 700; color: var(--ink-soft); font-size: var(--fs-caption) !important; }

/* ── بدنه ── */
.body {
  display: grid;
  gap: var(--sp-5);
  margin-top: var(--sp-6);
}
@media (min-width: 900px) {
  .body { grid-template-columns: 1fr 20rem; gap: var(--sp-7); align-items: start; }
  .side { position: sticky; top: 5rem; }
}

.brief { display: grid; gap: 1.4rem; }
.brief__paras { display: grid; gap: 0.9rem; }
.brief__paras p { font-size: var(--fs-md); line-height: 2.1; color: var(--ink-soft); }
.brief__paras p:first-child::first-letter {
  font-size: 2.6em;
  font-weight: 900;
  float: right;
  line-height: 1;
  padding-inline-start: 0.35rem;
  padding-block-start: 0.3rem;
  color: var(--coral);
}
.brief__sec { display: grid; gap: 0.7rem; padding-top: 1.2rem; border-top: 1px solid var(--line); }
.brief__h { font-size: var(--fs-md); font-weight: 900; }

.brief__list { display: grid; gap: 0.55rem; }
.brief__list li { display: flex; align-items: flex-start; gap: 0.5rem; font-size: var(--fs-small); color: var(--ink-soft); line-height: 1.9; }
.brief__list svg { color: var(--green); flex-shrink: 0; margin-top: 0.3rem; }

.brief__dels { display: flex; flex-wrap: wrap; gap: 0.4rem; }

.brief__refs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.brief__ref { border-radius: var(--r-sm); overflow: hidden; border: 1px solid var(--line); background: var(--bg-deep); }
.brief__ref img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform 0.4s var(--ease-out); }
.brief__ref:hover img { transform: scale(1.06); }

.brief__links { display: grid; gap: 0.4rem; }
.brief__link {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-deep);
  border: 1px solid var(--line);
  border-radius: var(--r-pill);
  padding: 0.4rem 0.85rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  width: fit-content;
}
.brief__link svg { color: var(--indigo); }
.brief__link code { font-size: 0.66rem; color: var(--muted); }

/* کارفرما */
.client { display: flex; gap: 0.85rem; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r-md); padding: 1rem 1.1rem; }
.client__avatar {
  width: 3rem; height: 3rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  font-weight: 700; font-style: italic;
  flex-shrink: 0;
}
.client__body { display: grid; gap: 0.4rem; min-width: 0; }
.client__name { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.client__name strong { font-size: var(--fs-body); font-weight: 900; }
.client__about { font-size: var(--fs-small); color: var(--muted); line-height: 1.9; }
.client__meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1.1rem; font-size: var(--fs-caption); color: var(--faint); }

/* پنل کنار */
.side { display: none; }
@media (min-width: 900px) { .side { display: block; } }
.side__sticky {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  padding: 1.2rem 1.3rem;
  display: grid;
  gap: 0.8rem;
}
.side__label { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.side__budget { font-size: 1.05rem; font-weight: 900; line-height: 1.8; }
.side__budget em { font-style: normal; font-size: var(--fs-caption); color: var(--faint); }
.side__points { display: grid; gap: 0.45rem; }
.side__points li { display: flex; align-items: center; gap: 0.45rem; font-size: var(--fs-caption); color: var(--muted); }
.side__points svg { color: var(--green); }
.side__note { font-size: 0.66rem; color: var(--faint); text-align: center; }

.sent { display: grid; gap: 0.4rem; justify-items: center; text-align: center; padding-block: 0.4rem; }
.sent__icon { color: var(--green); }
.sent__price { font-size: var(--fs-small); font-weight: 800; }
.sent__hint { font-size: var(--fs-caption); color: var(--muted); }
.sent .a-btn { margin-top: 0.4rem; }

/* نوار پایین موبایل */
.bar {
  position: fixed;
  bottom: 0;
  inset-inline: 0;
  z-index: var(--z-nav);
  background: color-mix(in srgb, var(--paper) 94%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
}
@media (min-width: 900px) { .bar { display: none; } }
.bar__in {
  max-width: 34rem;
  margin-inline: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem var(--gutter);
}
.bar__budget { display: grid; }
.bar__budget span { font-size: 0.64rem; color: var(--muted); }
.bar__budget strong { font-size: var(--fs-caption); font-weight: 900; }

.similar { display: grid; gap: 0.7rem; }
@media (min-width: 900px) { .similar { grid-template-columns: repeat(3, 1fr); } }
</style>
