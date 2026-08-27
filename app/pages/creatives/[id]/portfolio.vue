<script setup lang="ts">
import { creativeKindLabels } from '#shared/types'
import { creatives } from '#shared/data/content'
import { portfolioOf } from '#shared/data/portfolio'

// ─────────────────────────────────────────────────────────────
// گالری کامل نمونه‌کارهای خلاق — تصویر-محور
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const creative = computed(() => creatives.find(c => c.id === route.params.id))

if (!creative.value) {
  throw createError({ statusCode: 404, message: 'خلاق پیدا نشد', fatal: false })
}

useHead(() => ({
  title: creative.value ? `نمونه‌کارهای ${creative.value.name} | آرتیوو` : 'آرتیوو',
}))

const fa = new Intl.NumberFormat('fa-IR')
const items = computed(() => (creative.value ? portfolioOf(creative.value.id) : []))
</script>

<template>
  <div v-if="creative" class="container">
    <nav class="crumbs" aria-label="مسیر">
      <NuxtLink to="/creatives">خلاق‌ها</NuxtLink>
      <AIcon name="chevron-left" :size="13" />
      <NuxtLink :to="`/creatives/${creative.id}`">{{ creative.name }}</NuxtLink>
      <AIcon name="chevron-left" :size="13" />
      <span>نمونه‌کارها</span>
    </nav>

    <header class="phead" v-reveal>
      <div class="phead__id">
        <img :src="creative.avatar" :alt="creative.name" width="56" height="56">
        <div>
          <p class="overline">Portfolio — {{ fa.format(items.length) }} اثر</p>
          <h1 class="t-h1">{{ creativeKindLabels[creative.kind] === 'عکاس' ? 'دوربین' : 'میزکار' }} {{ creative.name }}</h1>
        </div>
      </div>
      <AButton :to="`/create?creative=${creative.id}`" size="sm" icon-end="arrow-left">شروع پروژه با {{ creative.name.split(' ')[0] }}</AButton>
    </header>

    <p class="phead__desc t-body" v-reveal>
      {{ creative.bio }}
    </p>

    <div class="pgal" v-reveal>
      <PortfolioGallery :items="items" :tall="creative.kind === 'photographer'" :show-desc="creative.kind === 'photographer'" />
    </div>
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

.phead {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.4rem;
  flex-wrap: wrap;
}
.phead__id { display: flex; align-items: center; gap: 0.8rem; }
.phead__id img {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 99px;
  object-fit: cover;
  border: 1px solid var(--line);
}
.phead__desc { margin-top: 0.7rem; max-width: 38rem; }

.pgal { margin-block: 1.6rem 2rem; }
</style>
