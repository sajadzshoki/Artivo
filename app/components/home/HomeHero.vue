<script setup lang="ts">
import { homeStats } from '#shared/data/content'

// هیروی ادیتوریال — تیتر درشت، CTA دوتایی و تصویر شاخص
const { config } = usePricing()
const minPrice = computed(() => Math.min(...Object.values(config.value.basePrices)))
</script>

<template>
  <section class="hero">
    <div class="container hero__grid">
      <div class="hero__copy">
        <p class="hero__kicker latin">Est. 2026 · Tehran — Creative Marketplace</p>
        <h1 class="t-display hero__title">
          ایده‌ات را به
          <span class="hero__hl">اثر</span>
          تبدیل کن
        </h1>
        <p class="t-body-lg hero__sub">
          آرتیوو پروژه‌ی طراحی و عکاسی‌ات را در ۸ گام کوتاه بریف می‌کند و به
          بهترین طراحان گرافیک و عکاسان می‌رساند — با قیمت شفاف از همان ابتدا.
        </p>

        <div class="hero__cta">
          <AButton to="/create" size="lg" icon-end="arrow-left">شروع پروژه</AButton>
          <AButton to="/creatives" size="lg" variant="outline">مشاهده‌ی خلاق‌ها</AButton>
        </div>

        <dl class="hero__stats">
          <div v-for="s in homeStats" :key="s.label" class="hero__stat">
            <dt class="hero__stat-l">{{ s.label }}</dt>
            <dd class="hero__stat-v">{{ s.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="hero__visual">
        <div class="hero__frame">
          <img src="/images/hero.jpg" alt="پوسترهای طراحی‌شده در استودیوی آرتیوو" width="880" height="1100" fetchpriority="high">
        </div>

        <div class="hero__chip hero__chip--1"><ATag label="پوستر" tone="coral" dot /></div>
        <div class="hero__chip hero__chip--2"><ATag label="لوگو و هویت" tone="indigo" dot /></div>
        <div class="hero__chip hero__chip--3"><ATag label="عکاسی محصول" tone="green" dot /></div>

        <NuxtLink to="/create" class="hero__float">
          <span class="hero__float-l">برآورد لحظه‌ای قیمت</span>
          <span class="hero__float-v">{{ formatTomanCompact(minPrice) }} <em>به بالا</em></span>
          <span class="hero__float-a"><AIcon name="arrow-left" :size="15" /></span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero { padding-top: clamp(1.5rem, 5vw, 4rem); }

.hero__grid { display: grid; gap: var(--sp-6); }
@media (min-width: 1024px) {
  .hero__grid {
    grid-template-columns: 1.05fr 0.95fr;
    align-items: center;
    gap: var(--sp-8);
  }
}

.hero__copy { display: grid; gap: var(--sp-5); justify-items: start; }
.hero__kicker { margin-bottom: -0.6rem; }

.hero__title { max-width: 12ch; }
.hero__hl {
  color: var(--coral);
  background: linear-gradient(transparent 68%, var(--coral-soft) 68%);
  padding-inline: 0.1em;
  border-radius: 4px;
}

.hero__sub { max-width: 32rem; }

.hero__cta { display: flex; flex-wrap: wrap; gap: 0.7rem; }

.hero__stats {
  display: flex;
  gap: var(--sp-6);
  padding-top: var(--sp-4);
  border-top: 1px solid var(--line);
  width: 100%;
}
.hero__stat { display: grid; gap: 0; }
.hero__stat-l { font-size: var(--fs-caption); color: var(--muted); order: 2; }
.hero__stat-v { font-size: var(--fs-lg); font-weight: 900; color: var(--ink); order: 1; margin: 0; }

/* ── تصویر ── */
.hero__visual { position: relative; }
.hero__frame {
  border-radius: var(--r-xl);
  overflow: hidden;
  border: 1px solid var(--line);
  background: var(--bg-deep);
  aspect-ratio: 4 / 4.6;
}
@media (min-width: 1024px) { .hero__frame { aspect-ratio: 4 / 4.9; } }
.hero__frame img { width: 100%; height: 100%; object-fit: cover; }

.hero__chip { position: absolute; animation: fade-up 0.8s var(--ease-out) both; }
.hero__chip--1 { top: 7%; inset-inline-start: 6%; }
.hero__chip--2 { top: 45%; inset-inline-end: 5%; animation-delay: 0.15s; }
.hero__chip--3 { bottom: 24%; inset-inline-start: 9%; animation-delay: 0.3s; }
.hero__chip .a-tag { box-shadow: var(--shadow-soft); background: var(--paper); }

.hero__float {
  position: absolute;
  bottom: -1.1rem;
  inset-inline-end: 6%;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  background: var(--ink);
  color: var(--bg);
  border-radius: var(--r-md);
  padding: 0.7rem 0.95rem;
  box-shadow: var(--shadow-pop);
  transition: transform 0.25s var(--ease-out);
}
.hero__float:hover { transform: translateY(-3px); }
.hero__float-l { font-size: var(--fs-caption); opacity: 0.75; }
.hero__float-v { font-size: var(--fs-small); font-weight: 800; }
.hero__float-v em { font-style: normal; font-size: var(--fs-caption); font-weight: 600; opacity: 0.7; }
.hero__float-a {
  display: grid;
  place-items: center;
  width: 1.7rem; height: 1.7rem;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
}

@media (max-width: 420px) {
  .hero__chip--3 { display: none; }
  .hero__stats { gap: var(--sp-5); }
}
</style>
