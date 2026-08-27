<script setup lang="ts">
import type { Creative, CreativeService, PortfolioItem } from '#shared/types'
import { serviceCategoryLabels, serviceCategoryIcons, serviceCategoryToProjectType } from '#shared/config/service-categories'
import { servicesOf } from '#shared/data/services'
import { getPortfolioItem } from '#shared/data/portfolio'
// سرویس/خلاق از لایه‌ی هم‌پوشانی (سازگار با تغییرهای ادمین و سرویس‌های تازه)
const { serviceById, creativeById } = useOverlay()
import { reviewsOf } from '#shared/data/reviews'

// ─────────────────────────────────────────────────────────────
// صفحه‌ی سرویس — خدمت قابل‌سفارش یک خلاق با مثال‌های واقعی
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const service = computed(() => serviceById(String(route.params.id)))
const creative = computed(() => (service.value ? creativeById(service.value.creativeId) : undefined))

if (!service.value || !creative.value) {
  throw createError({ statusCode: 404, message: 'سرویس پیدا نشد', fatal: false })
}

// پس از گارد ۴۰۴ — اسنپ‌شات تایپ‌شده برای استفاده‌ی مطمئن
const svc = service.value as CreativeService
const cr = creative.value as Creative

useHead({ title: `${svc.title} — ${cr.name} | آرتیوو` })

const fa = new Intl.NumberFormat('fa-IR')

const examples = computed<PortfolioItem[]>(() =>
  svc.portfolioItemIds
    .map(id => getPortfolioItem(id))
    .filter((p): p is PortfolioItem => !!p))

const otherServices = computed(() =>
  servicesOf(svc.creativeId).filter(s => s.id !== svc.id).slice(0, 3))

const lightboxIndex = ref<number | null>(null)
</script>

<template>
  <div v-if="service && creative" class="container">
    <nav class="crumbs" aria-label="مسیر">
      <NuxtLink to="/services">سرویس‌ها</NuxtLink>
      <AIcon name="chevron-left" :size="13" />
      <span>{{ serviceCategoryLabels[service.category] }}</span>
    </nav>

    <div class="sdet">
      <!-- گالری مثال‌ها -->
      <div class="sdet__gallery" v-reveal>
        <button
          v-if="examples.length"
          type="button"
          class="sdet__cover"
          @click="lightboxIndex = 0"
          aria-label="بزرگ‌نمایی تصویر"
        >
          <img v-if="examples[0]" :src="examples[0].cover" :alt="service.title" width="880" height="660" loading="lazy" decoding="async">
          <span class="sdet__zoom"><AIcon name="eye" :size="16" /> تماشا</span>
        </button>

        <div v-if="examples.length > 1" class="sdet__thumbs">
          <button
            v-for="(ex, i) in examples.slice(1, 4)"
            :key="ex.id"
            type="button"
            class="sdet__thumb"
            @click="lightboxIndex = i + 1"
          >
            <img :src="ex.cover" :alt="ex.title" loading="lazy" width="280" height="210">
          </button>
        </div>
      </div>

      <!-- پنل اطلاعات -->
      <div class="sdet__info" v-reveal>
        <p class="sdet__cat">
          <ATag :label="serviceCategoryLabels[service.category]" :icon="serviceCategoryIcons[service.category]" tone="indigo" />
          <ATag v-if="service.popular" label="پرتقالاب" tone="coral" dot />
        </p>

        <h1 class="t-h1 sdet__title">{{ service.title }}</h1>

        <NuxtLink :to="`/creatives/${creative.id}`" class="sdet__by">
          <img :src="creative.avatar" :alt="creative.name" width="40" height="40" loading="lazy" decoding="async">
          <span class="sdet__byid">
            <strong>{{ creative.name }}</strong>
            <span>{{ creative.role }} · پاسخ در {{ creative.responseTime }}</span>
          </span>
          <ARating :rating="creative.rating" :size="13" show-value class="sdet__byrate" />
        </NuxtLink>

        <p class="t-body sdet__desc">{{ service.description }}</p>

        <!-- مشخصات -->
        <div class="sdet__specs">
          <div class="sdet__spec">
            <span class="sdet__spec-l">شروع قیمت</span>
            <strong class="sdet__spec-v">{{ formatToman(service.startingPrice) }}</strong>
          </div>
          <div class="sdet__spec">
            <span class="sdet__spec-l">مهلت تحویل</span>
            <strong class="sdet__spec-v">{{ fa.format(service.deliveryDays) }} روز کاری</strong>
          </div>
          <div class="sdet__spec">
            <span class="sdet__spec-l">اصلاحیه‌های شامل</span>
            <strong class="sdet__spec-v">{{ fa.format(service.revisions) }} نوبت</strong>
          </div>
        </div>

        <!-- شامل چیست -->
        <div class="sdet__features">
          <h2 class="sdet__h">این سرویس چه چیزی شامل می‌شود؟</h2>
          <ul>
            <li v-for="f in service.features" :key="f">
              <AIcon name="check-circle" :size="16" />
              {{ f }}
            </li>
          </ul>
        </div>

        <div class="sdet__cta">
          <AButton
            size="lg"
            block
            icon-end="arrow-left"
            :to="`/create?type=${serviceCategoryToProjectType[service.category]}&creative=${creative.id}`"
          >
            سفارش این سرویس
          </AButton>
          <p class="sdet__note">
            <AIcon name="info" :size="14" />
            قیمت نهایی پس از بررسی بریف شما و به‌صورت برآورد شفاف در ویزارد اعلام می‌شود؛ پرداخت در فاز بعدی فعال است.
          </p>
        </div>
      </div>
    </div>

    <!-- نمونه‌کارهای مرتبط -->
    <section v-if="examples.length" class="section" v-reveal>
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">نمونه‌های این سرویس</span>
          <h2 class="t-h2">خروجی واقعی، نه قول</h2>
        </div>
      </div>
      <PortfolioGallery :items="examples" :tall="creative.kind === 'photographer'" :with-filter="false" />
    </section>

    <!-- سایر سرویس‌های این خلاق -->
    <section v-if="otherServices.length" class="section" v-reveal>
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">از همان خلاق</span>
          <h2 class="t-h2">سرویس‌های دیگر {{ creative.name.split(' ')[0] }}</h2>
        </div>
        <NuxtLink :to="`/creatives/${creative.id}`" class="section-head__link">
          پروفایل کامل
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>
      <div class="sdet__others">
        <ServiceCard v-for="s in otherServices" :key="s.id" :service="s" />
      </div>
    </section>

    <Lightbox v-model="lightboxIndex" :items="examples" />
  </div>
</template>

<style scoped>
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

.sdet {
  display: grid;
  gap: var(--sp-5);
  margin-top: 1.4rem;
}
@media (min-width: 900px) {
  .sdet {
    grid-template-columns: 1.1fr 1fr;
    gap: var(--sp-7);
    align-items: start;
  }
  .sdet__gallery { position: sticky; top: 5rem; }
}

/* ── گالری ── */
.sdet__gallery { display: grid; gap: 0.6rem; }
.sdet__cover {
  position: relative;
  display: block;
  width: 100%;
  border-radius: var(--r-lg);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
}
.sdet__cover img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
.sdet__zoom {
  position: absolute;
  bottom: 0.8rem;
  inset-inline-end: 0.8rem;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--bg);
  border-radius: 99px;
  padding: 0.35rem 0.8rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  transition: background 0.2s;
}
.sdet__cover:hover .sdet__zoom { background: var(--ink); }

.sdet__thumbs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.6rem; }
.sdet__thumb {
  border-radius: var(--r-sm);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
}
.sdet__thumb img { width: 100%; aspect-ratio: 4 / 3; object-fit: cover; transition: transform 0.4s var(--ease-out); }
.sdet__thumb:hover img { transform: scale(1.06); }

/* ── اطلاعات ── */
.sdet__info { display: grid; gap: 1.1rem; }
.sdet__cat { display: flex; gap: 0.4rem; }
.sdet__title { font-size: clamp(1.5rem, 4.5vw, 2.2rem); }

.sdet__by {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  padding: 0.7rem 0.9rem;
  transition: border-color 0.2s;
}
.sdet__by:hover { border-color: var(--line-strong); }
.sdet__by > img { width: 2.5rem; height: 2.5rem; border-radius: 99px; object-fit: cover; }
.sdet__byid { display: grid; min-width: 0; }
.sdet__byid strong { font-size: var(--fs-small); font-weight: 900; }
.sdet__byid span { font-size: var(--fs-caption); color: var(--muted); }
.sdet__byrate { margin-inline-start: auto; }

.sdet__desc { line-height: 2; }

.sdet__specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}
.sdet__spec {
  background: var(--bg-deep);
  border: 1px solid var(--line);
  border-radius: var(--r-sm);
  padding: 0.7rem 0.8rem;
  display: grid;
  gap: 0.15rem;
}
.sdet__spec-l { font-size: 0.66rem; color: var(--muted); font-weight: 700; }
.sdet__spec-v { font-size: var(--fs-small); font-weight: 900; }

.sdet__features { display: grid; gap: 0.6rem; }
.sdet__h { font-size: var(--fs-body); font-weight: 900; }
.sdet__features ul { display: grid; gap: 0.5rem; }
.sdet__features li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-small);
  color: var(--ink-soft);
  padding-bottom: 0.5rem;
  border-bottom: 1px dashed var(--line);
}
.sdet__features li:last-child { border: none; }
.sdet__features svg { color: var(--green); flex-shrink: 0; }

.sdet__cta { display: grid; gap: 0.6rem; }
.sdet__note {
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
  font-size: var(--fs-caption);
  color: var(--muted);
  background: var(--indigo-soft);
  color: var(--indigo-deep);
  border-radius: var(--r-sm);
  padding: 0.65rem 0.8rem;
  line-height: 1.85;
}
.sdet__note svg { flex-shrink: 0; margin-top: 0.2rem; }

.sdet__others {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(16rem, 100%), 1fr));
  gap: 0.9rem;
}
</style>
