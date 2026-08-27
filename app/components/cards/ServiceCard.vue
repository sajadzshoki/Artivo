<script setup lang="ts">
import type { CreativeService } from '#shared/types'
import { serviceCategoryLabels, serviceCategoryIcons } from '#shared/config/service-categories'
import { creativesById, getPortfolioItem } from '#shared/data/portfolio'

// کارت سرویس — خدمت قابل‌سفارش خلاق
const props = defineProps<{ service: CreativeService }>()

const fa = new Intl.NumberFormat('fa-IR')
const creative = computed(() => creativesById().get(props.service.creativeId))
const cover = computed(() => {
  const first = props.service.portfolioItemIds[0]
  return first ? getPortfolioItem(first)?.cover : undefined
})
</script>

<template>
  <NuxtLink :to="`/services/${service.id}`" class="sc" :class="{ 'sc--popular': service.popular }">
    <span class="sc__cover">
      <img v-if="cover" :src="cover" :alt="service.title" loading="lazy" width="520" height="340">
      <span v-else class="sc__ph"><AIcon :name="serviceCategoryIcons[service.category]" :size="26" /></span>
      <ATag v-if="service.popular" label="پرتقالاب" tone="coral" class="sc__hot" />
    </span>

    <span class="sc__body">
      <span class="sc__cat">{{ serviceCategoryLabels[service.category] }}</span>
      <strong class="sc__title">{{ service.title }}</strong>

      <span v-if="creative" class="sc__by">
        <img :src="creative.avatar" :alt="creative.name" loading="lazy" width="22" height="22">
        {{ creative.name }}
      </span>

      <span class="sc__meta">
        <span><AIcon name="clock" :size="13" /> {{ fa.format(service.deliveryDays) }} روز</span>
        <span><AIcon name="check-circle" :size="13" /> {{ fa.format(service.revisions) }} اصلاحیه</span>
      </span>

      <span class="sc__foot">
        <span class="sc__price">شروع از <strong>{{ formatTomanCompact(service.startingPrice) }}</strong></span>
        <span class="sc__go"><AIcon name="arrow-left" :size="15" /></span>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.sc {
  display: grid;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s, border-color 0.3s;
}
.sc:hover { transform: translateY(-4px); box-shadow: var(--shadow-pop); border-color: var(--line-strong); }

.sc__cover { position: relative; display: block; aspect-ratio: 16 / 10; overflow: hidden; background: var(--bg-deep); }
.sc__cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.sc:hover .sc__cover img { transform: scale(1.05); }
.sc__ph { display: grid; place-items: center; width: 100%; height: 100%; color: var(--faint); }
.sc__hot { position: absolute; top: 0.6rem; inset-inline-start: 0.6rem; box-shadow: var(--shadow-soft); }

.sc__body { display: grid; gap: 0.4rem; padding: 0.9rem 1rem 1.05rem; }
.sc__cat { font-size: var(--fs-caption); font-weight: 700; color: var(--indigo-deep); }
.sc__title { font-size: var(--fs-md); font-weight: 900; line-height: 1.6; }

.sc__by { display: inline-flex; align-items: center; gap: 0.4rem; font-size: var(--fs-caption); color: var(--muted); }
.sc__by img { width: 1.4rem; height: 1.4rem; border-radius: 99px; object-fit: cover; }

.sc__meta { display: flex; gap: 0.9rem; font-size: var(--fs-caption); color: var(--faint); }
.sc__meta span { display: inline-flex; align-items: center; gap: 0.25rem; }

.sc__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px dashed var(--line);
  padding-top: 0.65rem;
  margin-top: 0.2rem;
}
.sc__price { font-size: var(--fs-caption); color: var(--muted); }
.sc__price strong { color: var(--ink); font-weight: 800; }
.sc__go {
  width: 2rem; height: 2rem;
  display: grid; place-items: center;
  border-radius: 99px;
  border: 1px solid var(--line-strong);
  color: var(--ink);
  transition: all 0.25s var(--ease-out);
}
.sc:hover .sc__go { background: var(--coral); border-color: var(--coral); color: #fff; transform: translateX(-3px); }
</style>
