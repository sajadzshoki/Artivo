<script setup lang="ts">
import type { PhotoSpot } from '#shared/types'
import type { LatLng } from '#shared/utils/geo'
import { spotCategoryLabels } from '#shared/config/spot-categories'
import { formatDistance, haversineKm } from '#shared/utils/geo'
import { useSavedSpots } from '~/composables/useSavedSpots'
import { useSpots } from '~/composables/useSpots'

// ─────────────────────────────────────────────────────────────
// SpotCard · کارت ادیتوریال لوکیشن عکاسی
// ─────────────────────────────────────────────────────────────
const props = defineProps<{
  spot: PhotoSpot
  /** موقعیت کاربر برای نشان فاصله */
  userPos?: LatLng | null
}>()

const toast = useToast()
const { isSaved, toggle } = useSavedSpots()
const { displayRating, photosOf } = useSpots()

const fa = new Intl.NumberFormat('fa-IR')
const cover = computed(() => photosOf(props.spot)[0]?.url ?? props.spot.image)
const ratingInfo = computed(() => displayRating(props.spot))
const distance = computed(() =>
  props.userPos ? haversineKm(props.userPos, props.spot.location) : null)

function onSave() {
  const now = toggle(props.spot.id)
  toast.success(now ? 'ذخیره شد' : 'از علاقه‌مندی‌ها حذف شد', props.spot.name)
}
</script>

<template>
  <article class="sc">
    <NuxtLink :to="`/spots/${spot.id}`" class="sc__link" :aria-label="spot.name" />

    <div class="sc__img" :style="!cover ? { background: `linear-gradient(150deg, ${spot.accent}26, ${spot.accent}5E)` } : undefined">
      <img v-if="cover" :src="cover" :alt="spot.name" loading="lazy" width="720" height="560">
      <button
        class="sc__save"
        :class="{ 'sc__save--on': isSaved(spot.id) }"
        :aria-label="isSaved(spot.id) ? 'حذف از علاقه‌مندی‌ها' : 'ذخیره لوکیشن'"
        @click.prevent="onSave"
      >
        <AIcon name="heart" :size="17" :fill="isSaved(spot.id)" />
      </button>
      <span class="sc__time"><AIcon name="clock" :size="13" /> {{ spot.bestTime }}</span>
      <span v-if="distance != null" class="sc__dist"><AIcon name="map-pin" :size="12" /> {{ formatDistance(distance) }}</span>
    </div>

    <div class="sc__body">
      <div class="sc__head">
        <h3 class="sc__name">{{ spot.name }}</h3>
        <ARating :rating="ratingInfo.rating" :size="12" :show-value="true" />
      </div>
      <p class="sc__city"><AIcon name="map-pin" :size="13" /> {{ spot.city }}</p>
      <p class="sc__tip">{{ spot.tip || spot.description }}</p>
      <div class="sc__tags">
        <ATag v-for="c in spot.categories.slice(0, 2)" :key="c" :label="spotCategoryLabels[c]" tone="neutral" />
        <ATag v-if="spot.userAdded" label="افزوده‌ی کاربر" tone="indigo" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.sc {
  position: relative;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s;
}
.sc:hover { transform: translateY(-3px); box-shadow: var(--shadow-pop); }

.sc__link { position: absolute; inset: 0; z-index: 1; }

.sc__img { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--bg-deep); }
.sc__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.sc:hover .sc__img img { transform: scale(1.05); }

.sc__save {
  position: absolute;
  top: 0.7rem;
  inset-inline-end: 0.7rem;
  z-index: 2;
  width: 2.3rem; height: 2.3rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: color-mix(in srgb, var(--paper) 90%, transparent);
  backdrop-filter: blur(6px);
  color: var(--ink);
  transition: transform 0.2s, color 0.2s, background 0.2s;
}
.sc__save:active { transform: scale(0.88); }
.sc__save--on { color: var(--coral); background: var(--paper); }

.sc__time {
  position: absolute;
  bottom: 0.7rem;
  inset-inline-start: 0.7rem;
  display: inline-flex; align-items: center; gap: 0.28rem;
  background: color-mix(in srgb, var(--ink) 82%, transparent);
  color: var(--bg);
  border-radius: 99px;
  padding: 0.24rem 0.62rem;
  font-size: var(--fs-caption);
  font-weight: 700;
}
.sc__dist {
  position: absolute;
  bottom: 0.7rem;
  inset-inline-end: 0.7rem;
  display: inline-flex; align-items: center; gap: 0.25rem;
  background: var(--paper);
  color: var(--indigo-deep);
  border-radius: 99px;
  padding: 0.24rem 0.6rem;
  font-size: 0.66rem;
  font-weight: 800;
  box-shadow: var(--shadow-soft);
}

.sc__body { display: grid; gap: 0.35rem; padding: 0.95rem 1rem 1.1rem; }
.sc__head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.7rem; }
.sc__name { font-size: var(--fs-md); font-weight: 900; }
.sc__city { display: flex; align-items: center; gap: 0.25rem; font-size: var(--fs-caption); color: var(--muted); }
.sc__tip {
  font-size: var(--fs-caption);
  color: var(--muted);
  line-height: 1.85;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.sc__tags { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-top: 0.15rem; }
</style>
