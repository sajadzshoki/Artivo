<script setup lang="ts">
import type { PortfolioItem } from '#shared/types'
import { serviceCategoryLabels, serviceCategoryIcons } from '#shared/config/service-categories'

// کارت نمونه‌کار — کاور تصویری + عنوان ادیتوریال
const props = withDefaults(defineProps<{
  item: PortfolioItem
  /** نسبت تصویر — عکاس‌ها عمیق‌تر */
  tall?: boolean
  showDesc?: boolean
}>(), { tall: false, showDesc: false })

const emit = defineEmits<{ open: [id: string] }>()
</script>

<template>
  <button type="button" class="pf" :class="{ 'pf--tall': tall }" @click="emit('open', item.id)">
    <span class="pf__cover">
      <img :src="item.cover" :alt="item.title" loading="lazy" width="640" height="800">
      <span class="pf__count" v-if="item.images.length > 1">
        <AIcon name="image" :size="12" />
        {{ new Intl.NumberFormat('fa-IR').format(item.images.length) }}
      </span>
    </span>
    <span class="pf__body">
      <span class="pf__cat"><AIcon :name="serviceCategoryIcons[item.category]" :size="12" /> {{ serviceCategoryLabels[item.category] }}</span>
      <strong class="pf__title">{{ item.title }}</strong>
      <span v-if="showDesc && item.description" class="pf__desc">{{ item.description }}</span>
      <span class="pf__meta">{{ item.year }}<template v-if="item.client"> · {{ item.client }}</template></span>
    </span>
  </button>
</template>

<style scoped>
.pf {
  display: grid;
  gap: 0;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s;
  width: 100%;
}
.pf:hover { transform: translateY(-3px); box-shadow: var(--shadow-pop); }

.pf__cover { position: relative; display: block; aspect-ratio: 4 / 3; overflow: hidden; background: var(--bg-deep); }
.pf--tall .pf__cover { aspect-ratio: 3 / 3.7; }
.pf__cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.pf:hover .pf__cover img { transform: scale(1.05); }

.pf__count {
  position: absolute;
  top: 0.55rem;
  inset-inline-end: 0.55rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--bg);
  border-radius: 99px;
  padding: 0.18rem 0.5rem;
  font-size: 0.64rem;
  font-weight: 700;
}

.pf__body { display: grid; gap: 0.15rem; padding: 0.7rem 0.85rem 0.85rem; }
.pf__cat { display: inline-flex; align-items: center; gap: 0.28rem; font-size: 0.66rem; font-weight: 700; color: var(--indigo-deep); }
.pf__title { font-size: var(--fs-small); font-weight: 900; line-height: 1.7; }
.pf__desc {
  font-size: var(--fs-caption);
  color: var(--muted);
  line-height: 1.8;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.pf__meta { font-size: 0.66rem; color: var(--faint); margin-top: 0.15rem; }
</style>
