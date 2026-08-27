<script setup lang="ts">
import { useSavedCreatives } from '~/composables/useSavedCreatives'
import type { Creative } from '#shared/types'
import { creativeKindLabels } from '#shared/types'
import { serviceCategoryLabels } from '#shared/config/service-categories'

// کارت خلاق — لینک به پروفایل ادیتوریال
const props = defineProps<{ creative: Creative }>()

const saved = useSavedCreatives()
function onSaveCreative() {
  const now = saved.toggle(props.creative.id)
  useToast().success(now ? 'ذخیره شد' : 'از ذخیره‌ها حذف شد', props.creative.name)
}

const fa = new Intl.NumberFormat('fa-IR')
const imgFailed = ref(false)
</script>

<template>
  <NuxtLink :to="`/creatives/${creative.id}`" class="cc">
    <span class="cc__cover" :style="{ background: `linear-gradient(150deg, ${creative.accent}30, ${creative.accent}66)` }">
      <img v-if="creative.image && !imgFailed" :src="creative.image" :alt="`نمونه‌کار ${creative.name}`" loading="lazy" decoding="async" width="560" height="420" @error="imgFailed = true">
      <span class="cc__kind" :class="`cc__kind--${creative.kind}`">{{ creativeKindLabels[creative.kind] }}</span>
      <span class="cc__rate"><AIcon name="star" :size="13" /> {{ fa.format(creative.rating) }}</span>
      <button
        type="button"
        class="cc__save"
        :class="{ 'cc__save--on': saved.isSaved(creative.id) }"
        :aria-label="saved.isSaved(creative.id) ? 'حذف از ذخیره‌ها' : 'ذخیره‌ی خلاق'"
        @click.prevent.stop="onSaveCreative"
      >
        <AIcon name="heart" :size="15" :fill="saved.isSaved(creative.id)" />
      </button>
    </span>

    <span class="cc__body">
      <span class="cc__head">
        <img v-if="creative.avatar" :src="creative.avatar" :alt="creative.name" class="cc__avatar" loading="lazy" width="44" height="44">
        <span v-else class="cc__avatar cc__avatar--letter">{{ creative.name.charAt(0) }}</span>
        <span class="cc__id">
          <span class="cc__name">{{ creative.name }}</span>
          <span class="cc__role">{{ creative.role }}</span>
        </span>
      </span>

      <span class="cc__tags">
        <ATag v-for="c in creative.categories.slice(0, 2)" :key="c" :label="serviceCategoryLabels[c]" />
      </span>

      <span class="cc__foot">
        <span class="cc__price">شروع از <strong>{{ formatTomanCompact(creative.startingPrice) }}</strong></span>
        <span class="cc__city"><AIcon name="map-pin" :size="13" /> {{ creative.city }}</span>
      </span>
    </span>
  </NuxtLink>
</template>

<style scoped>
.cc {
  display: grid;
  text-align: start;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s, border-color 0.3s;
}
.cc:hover { transform: translateY(-4px); box-shadow: var(--shadow-pop); border-color: var(--line-strong); }

.cc__cover {
  position: relative;
  display: block;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: var(--bg-deep);
}
.cc__cover img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.cc:hover .cc__cover img { transform: scale(1.06); }

.cc__kind {
  position: absolute;
  bottom: 0.6rem;
  inset-inline-start: 0.6rem;
  border-radius: 99px;
  padding: 0.22rem 0.6rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: #fff;
  box-shadow: var(--shadow-soft);
}
.cc__kind--designer { background: var(--indigo); }
.cc__kind--photographer { background: var(--green); }

.cc__rate {
  position: absolute;
  top: 0.6rem;
  inset-inline-start: 0.6rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--paper);
  border-radius: 99px;
  padding: 0.2rem 0.55rem;
  font-size: var(--fs-caption);
  font-weight: 800;
  color: var(--amber);
  box-shadow: var(--shadow-soft);
}

.cc__body { display: grid; gap: 0.65rem; padding: 0.85rem 0.95rem 1rem; }
.cc__head { display: flex; align-items: center; gap: 0.6rem; }
.cc__avatar {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 99px;
  object-fit: cover;
  border: 2px solid var(--paper);
  box-shadow: var(--shadow-soft);
}
.cc__avatar--letter {
  display: grid;
  place-items: center;
  background: var(--bg-deep);
  color: var(--ink-soft);
  font-weight: 900;
  flex-shrink: 0;
}
.cc__id { display: grid; min-width: 0; }
.cc__name { font-size: var(--fs-small); font-weight: 900; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.cc__role { font-size: var(--fs-caption); color: var(--muted); }

.cc__save {
  position: absolute;
  bottom: 0.55rem;
  inset-inline-start: 0.55rem;
  width: 2.1rem; height: 2.1rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: color-mix(in srgb, var(--paper) 90%, transparent);
  backdrop-filter: blur(6px);
  color: var(--ink);
  z-index: 2;
  transition: transform 0.2s, color 0.2s;
}
.cc__save:active { transform: scale(0.88); }
.cc__save--on { color: var(--coral); }

.cc__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }

.cc__foot {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  border-top: 1px dashed var(--line);
  padding-top: 0.65rem;
}
.cc__price { font-size: var(--fs-caption); color: var(--muted); }
.cc__price strong { color: var(--ink); font-weight: 800; }
.cc__city { display: inline-flex; align-items: center; gap: 0.2rem; font-size: var(--fs-caption); color: var(--faint); }
@media (pointer: coarse) {
  .cc__save { width: 2.5rem; height: 2.5rem; }
}
</style>