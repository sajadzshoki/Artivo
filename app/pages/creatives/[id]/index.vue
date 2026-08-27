<script setup lang="ts">
import type { Creative } from '#shared/types'
import { creativeKindLabels } from '#shared/types'
import { portfolioOf } from '#shared/data/portfolio'
import { reviewsOf } from '#shared/data/reviews'
// خلاق از لایه‌ی هم‌پوشانی (پروفایل‌های جامعه + وصله‌های ادمین)
const { allCreatives: creativesPool, services: overlayServices } = useOverlay()

// ─────────────────────────────────────────────────────────────
// پروفایل خلاق — تجربه‌ای شبیه پرونده‌ی مجله‌ای، نه رزومه
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const creative = computed(() => creativesPool.value.find(c => c.id === route.params.id))

if (!creative.value) {
  throw createError({ statusCode: 404, message: 'خلاق پیدا نشد', fatal: false })
}

useHead(() => ({
  title: creative.value ? `${creative.value.name} — ${creative.value.role} | آرتیوو` : 'آرتیوو',
}))

const fa = new Intl.NumberFormat('fa-IR')
const toast = useToast()

const items = computed(() => (creative.value ? portfolioOf(creative.value.id) : []))
const services = computed(() => (creative.value ? overlayServices.value.filter(s => s.creativeId === creative.value!.id) : []))
const reviewCount = computed(() => (creative.value ? reviewsOf(creative.value.id).length : 0))

const stats = computed(() => creative.value
  ? [
      { value: fa.format(creative.value.rating), label: 'امتیاز از ۵' },
      { value: fa.format(creative.value.projectsDone), label: 'پروژه‌ی موفق' },
      { value: fa.format(creative.value.experienceYears), label: 'سال تجربه' },
      { value: fa.format(creative.value.languages.length), label: 'زبان' },
    ]
  : [])

const similar = computed(() => {
  if (!creative.value) return []
  return creativesPool.value
    .filter(c => c.id !== creative.value?.id && c.kind === creative.value?.kind)
    .slice(0, 4)
})

function contactDirect() {
  toast.info('به‌زودی', 'درخواست همکاری مستقیم در فاز بعدی فعال می‌شود؛ فعلاً از «شروع پروژه» بریف بدهید.')
}
</script>

<template>
  <div v-if="creative">
    <!-- ── هیروی پروفایل ── -->
    <header class="phero">
      <div class="container">
        <p class="overline">Creative Profile — {{ creativeKindLabels[creative.kind] }}</p>

        <div class="phero__grid">
          <div class="phero__avatar-wrap">
            <img :src="creative.avatar" :alt="creative.name" class="phero__avatar" width="180" height="180">
            <span class="phero__star"><AIcon name="star" :size="15" /> {{ fa.format(creative.rating) }}</span>
          </div>

          <div class="phero__main">
            <h1 class="t-display phero__name">{{ creative.name }}</h1>
            <p class="phero__role">
              <ATag :label="creativeKindLabels[creative.kind]" :tone="creative.kind === 'designer' ? 'indigo' : 'green'" dot />
              <span>{{ creative.role }}</span>
            </p>

            <div class="phero__meta">
              <span><AIcon name="map-pin" :size="14" /> {{ creative.city }}</span>
              <span><AIcon name="clock" :size="14" /> پاسخ در {{ creative.responseTime }}</span>
              <span><AIcon name="calendar" :size="14" /> عضو از {{ creative.memberSince }}</span>
            </div>

            <div class="phero__cta">
              <AButton :to="`/create?creative=${creative.id}`" size="lg" icon-end="arrow-left">شروع پروژه با {{ creative.name.split(' ')[0] }}</AButton>
              <AButton size="lg" variant="outline" icon="send" @click="contactDirect">درخواست همکاری مستقیم</AButton>
            </div>
          </div>
        </div>

        <!-- نوار آمار -->
        <dl class="phero__stats">
          <div v-for="s in stats" :key="s.label" class="phero__stat">
            <dt class="phero__stat-l">{{ s.label }}</dt>
            <dd class="phero__stat-v latin">{{ s.value }}</dd>
          </div>
        </dl>
      </div>
    </header>

    <!-- ── درباره + جزئیات ── -->
    <section class="section" v-reveal>
      <div class="container about">
        <div class="about__main">
          <span class="section-head__kicker">درباره</span>
          <p class="about__bio">{{ creative.bio }}</p>

          <ul class="about__exp">
            <li v-for="e in creative.experience" :key="e">
              <AIcon name="check" :size="14" />
              {{ e }}
            </li>
          </ul>
        </div>

        <aside class="about__side">
          <div class="about__block">
            <h3 class="about__title">تخصص‌ها</h3>
            <div class="about__chips">
              <ATag v-for="s in creative.skills" :key="s" :label="s" tone="neutral" />
            </div>
          </div>
          <div class="about__block">
            <h3 class="about__title">زبان‌ها</h3>
            <div class="about__chips">
              <ATag v-for="l in creative.languages" :key="l" :label="l" tone="neutral" />
            </div>
          </div>
        </aside>
      </div>
    </section>

    <!-- ── نمونه‌کارها ── -->
    <section id="portfolio" class="section" v-reveal>
      <div class="container">
        <div class="section-head">
          <div class="section-head__titles">
            <span class="section-head__kicker">نمونه‌کارها</span>
            <h2 class="t-h1">آثار منتخب</h2>
          </div>
          <NuxtLink v-if="items.length > 3" :to="`/creatives/${creative.id}/portfolio`" class="section-head__link">
            همه‌ی {{ fa.format(items.length) }} اثر
            <AIcon name="arrow-left" :size="15" />
          </NuxtLink>
        </div>

        <PortfolioGallery :items="items.slice(0, 6)" :tall="creative.kind === 'photographer'" />
      </div>
    </section>

    <!-- ── سرویس‌ها ── -->
    <section v-if="services.length" id="services" class="section" v-reveal>
      <div class="container">
        <div class="section-head">
          <div class="section-head__titles">
            <span class="section-head__kicker">سرویس‌ها</span>
            <h2 class="t-h1">قابل‌سفارش، با قیمت شفاف</h2>
          </div>
        </div>

        <div class="psv">
          <ServiceCard v-for="s in services" :key="s.id" :service="s" />
        </div>
      </div>
    </section>

    <!-- ── نظرات ── -->
    <section v-if="reviewCount" id="reviews" class="section" v-reveal>
      <div class="container">
        <div class="section-head">
          <div class="section-head__titles">
            <span class="section-head__kicker">نظرات کارفرماها</span>
            <h2 class="t-h1">از زبان آن‌ها</h2>
          </div>
        </div>
        <ReviewList :creative-id="creative.id" :rating="creative.rating" :projects-done="creative.projectsDone" :limit="3" />
      </div>
    </section>

    <!-- ── CTA پایانی ── -->
    <section class="section" v-reveal>
      <div class="container">
        <div class="pcta">
          <p class="pcta__kicker latin">Work with {{ creative.name.split(' ')[0] }}</p>
          <h2 class="pcta__title">پروژه‌ات را به {{ creative.name.split(' ')[0] }} بسپار.</h2>
          <p class="pcta__sub">
            شروع قیمت خدمات از {{ formatToman(creative.startingPrice) }} — برآورد دقیق را در ویزارد پروژه ببین.
          </p>
          <div class="pcta__actions">
            <AButton :to="`/create?creative=${creative.id}`" size="lg" icon-end="arrow-left">شروع پروژه</AButton>
            <AButton :to="`/creatives/${creative.id}/portfolio`" size="lg" variant="ghost" class="pcta__ghost">تماشای همه‌ی آثار</AButton>
          </div>
          <span class="pcta__mark latin" aria-hidden="true">*</span>
        </div>
      </div>
    </section>

    <!-- ── خلاق‌های مشابه ── -->
    <section v-if="similar.length" class="section" v-reveal>
      <div class="container">
        <div class="section-head">
          <div class="section-head__titles">
            <span class="section-head__kicker">نزدیک به این سلیقه</span>
            <h2 class="t-h2">خلاق‌های مشابه</h2>
          </div>
          <NuxtLink to="/creatives" class="section-head__link">
            مشاهده‌ی همه
            <AIcon name="arrow-left" :size="15" />
          </NuxtLink>
        </div>
        <div class="scroll-x">
          <CreativeCard v-for="c in similar" :key="c.id" :creative="c" class="psim" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── هیرو ── */
.phero { padding-top: clamp(1.8rem, 5vw, 3.5rem); }
.phero__grid { display: grid; gap: var(--sp-5); margin-top: 1rem; }
@media (min-width: 768px) {
  .phero__grid { grid-template-columns: auto 1fr; align-items: end; gap: var(--sp-6); }
}

.phero__avatar-wrap { position: relative; width: 8.5rem; }
@media (min-width: 768px) { .phero__avatar-wrap { width: 11.25rem; } }
.phero__avatar {
  width: 100%;
  aspect-ratio: 1;
  border-radius: var(--r-lg);
  object-fit: cover;
  border: 1px solid var(--line);
  box-shadow: var(--shadow-pop);
  transform: rotate(-2deg);
}
.phero__star {
  position: absolute;
  bottom: -0.7rem;
  inset-inline-end: -0.7rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--ink);
  color: var(--bg);
  border-radius: 99px;
  padding: 0.3rem 0.7rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  box-shadow: var(--shadow-pop);
}
.phero__star svg { color: var(--amber); }

.phero__main { display: grid; gap: 0.8rem; justify-items: start; }
.phero__name { font-size: clamp(2rem, 6.5vw, 3.6rem); }
.phero__role { display: flex; align-items: center; gap: 0.6rem; font-size: var(--fs-md); font-weight: 700; color: var(--ink-soft); flex-wrap: wrap; }

.phero__meta { display: flex; flex-wrap: wrap; gap: 0.5rem 1.2rem; font-size: var(--fs-caption); color: var(--muted); }
.phero__meta span { display: inline-flex; align-items: center; gap: 0.3rem; }

.phero__cta { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.4rem; }

.phero__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  margin-top: var(--sp-6);
  padding-block: 1.2rem;
  border-block: 1px solid var(--line-strong);
}
.phero__stat { display: grid; gap: 0; justify-items: start; }
.phero__stat-v { font-size: clamp(1.3rem, 3.5vw, 1.9rem); font-weight: 700; font-style: italic; color: var(--ink); }
.phero__stat-l { font-size: var(--fs-caption); color: var(--muted); order: 2; }

/* ── درباره ── */
.about { display: grid; gap: var(--sp-6); }
@media (min-width: 768px) {
  .about { grid-template-columns: 1.5fr 1fr; gap: var(--sp-7); }
}
.about__main { display: grid; gap: 1.1rem; align-content: start; }
.about__bio { font-size: var(--fs-lg); line-height: 2; color: var(--ink); font-weight: 500; }

.about__exp { display: grid; gap: 0.55rem; }
.about__exp li {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: var(--fs-small);
  color: var(--ink-soft);
  padding-bottom: 0.55rem;
  border-bottom: 1px dashed var(--line);
}
.about__exp li:last-child { border: none; padding-bottom: 0; }
.about__exp svg { color: var(--green); flex-shrink: 0; }

.about__side { display: grid; gap: 1.2rem; align-content: start; }
.about__block {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 1rem 1.1rem;
  display: grid;
  gap: 0.65rem;
}
.about__title { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.about__chips { display: flex; flex-wrap: wrap; gap: 0.35rem; }

/* ── سرویس‌های پروفایل ── */
.psv {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(17rem, 100%), 1fr));
  gap: 0.9rem;
}

/* ── CTA ── */
.pcta {
  position: relative;
  overflow: hidden;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--r-xl);
  padding: clamp(2rem, 5.5vw, 4rem);
  display: grid;
  justify-items: start;
  gap: 0.8rem;
}
.pcta__kicker { color: var(--coral); font-style: italic; font-size: var(--fs-small); }
.pcta__title { font-size: clamp(1.6rem, 5vw, 2.7rem); font-weight: 900; line-height: 1.35; }
.pcta__sub { color: color-mix(in srgb, var(--bg) 72%, transparent); font-size: var(--fs-body); max-width: 32rem; }
.pcta__actions { display: flex; flex-wrap: wrap; gap: 0.7rem; margin-top: 0.6rem; }
.pcta__ghost { color: var(--bg); border: 1px solid rgba(250, 246, 239, 0.3); }
.pcta__ghost:hover { background: rgba(250, 246, 239, 0.08); }
.pcta__mark {
  position: absolute;
  inset-inline-end: -1rem;
  bottom: -3.4rem;
  font-size: 15rem;
  font-weight: 700;
  font-style: italic;
  color: var(--coral);
  opacity: 0.16;
  line-height: 1;
  pointer-events: none;
}

.psim { width: min(16.5rem, 74vw); }
@media (min-width: 1024px) {
  .psim { width: 100%; }
  :deep(.creative-grid-4) { display: contents; }
}
</style>
