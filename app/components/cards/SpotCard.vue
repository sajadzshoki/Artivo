<script setup lang="ts">
import type { PhotoSpot } from '#shared/types'

// کارت لوکیشن عکاسی — با ذخیره‌ی علاقه‌مندی
const props = defineProps<{ spot: PhotoSpot }>()
const toast = useToast()
const saved = ref(false)

function toggleSave() {
  saved.value = !saved.value
  toast.success(saved.value ? 'ذخیره شد' : 'از ذخیره‌شده‌ها حذف شد', props.spot.name)
}
</script>

<template>
  <article class="sc">
    <div class="sc__img" :style="!spot.image ? { background: `linear-gradient(150deg, ${spot.accent}26, ${spot.accent}5E)` } : undefined">
      <img v-if="spot.image" :src="spot.image" :alt="spot.name" loading="lazy" width="720" height="560">
      <button
        class="sc__save"
        :class="{ 'sc__save--on': saved }"
        :aria-label="saved ? 'حذف از ذخیره‌شده‌ها' : 'ذخیره لوکیشن'"
        @click.prevent="toggleSave"
      >
        <AIcon name="heart" :size="17" :fill="saved" />
      </button>
      <span class="sc__time"><AIcon name="clock" :size="13" /> {{ spot.bestTime }}</span>
    </div>

    <div class="sc__body">
      <div class="sc__head">
        <h3 class="sc__name">{{ spot.name }}</h3>
        <span class="sc__city"><AIcon name="map-pin" :size="13" /> {{ spot.city }}</span>
      </div>
      <p class="sc__tip">{{ spot.tip }}</p>
      <div class="sc__tags">
        <ATag v-for="t in spot.tags" :key="t" :label="t" tone="neutral" />
      </div>
    </div>
  </article>
</template>

<style scoped>
.sc {
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-lg);
  overflow: hidden;
  transition: transform 0.3s var(--ease-out), box-shadow 0.3s;
}
.sc:hover { transform: translateY(-3px); box-shadow: var(--shadow-pop); }

.sc__img { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: var(--bg-deep); }
.sc__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s var(--ease-out); }
.sc:hover .sc__img img { transform: scale(1.05); }

.sc__save {
  position: absolute;
  top: 0.7rem;
  inset-inline-end: 0.7rem;
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

.sc__body { display: grid; gap: 0.45rem; padding: 0.95rem 1rem 1.1rem; }
.sc__head { display: flex; align-items: baseline; justify-content: space-between; gap: 0.7rem; }
.sc__name { font-size: var(--fs-md); font-weight: 900; }
.sc__city { display: inline-flex; align-items: center; gap: 0.2rem; font-size: var(--fs-caption); color: var(--muted); flex-shrink: 0; }
.sc__tip { font-size: var(--fs-small); color: var(--muted); line-height: 1.85; }
.sc__tags { display: flex; gap: 0.35rem; margin-top: 0.1rem; }
</style>
