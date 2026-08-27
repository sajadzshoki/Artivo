<script setup lang="ts">
import { photoSpots } from '#shared/data/content'

// تیزر لوکیشن‌های عکاسی — موزائیک سه‌تایی
const spots = photoSpots.slice(0, 3)
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">لوکیشن عکاسی</span>
          <h2 class="t-h1">جایی که نور می‌نشیند</h2>
        </div>
        <NuxtLink to="/spots" class="section-head__link">
          همه‌ی لوکیشن‌ها
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>

      <div class="mosaic">
        <NuxtLink v-for="s in spots" :key="s.id" to="/spots" class="tile">
          <span class="tile__img" :style="{ background: `linear-gradient(160deg, ${s.accent}22, ${s.accent}55)` }">
            <img v-if="s.image" :src="s.image" :alt="s.name" loading="lazy" width="640" height="760">
          </span>
          <span class="tile__body">
            <span class="tile__name">{{ s.name }}</span>
            <span class="tile__meta">{{ s.city }} · بهترین زمان: {{ s.bestTime }}</span>
          </span>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.mosaic {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.7rem;
}
.tile { display: grid; gap: 0.55rem; }
.tile__img {
  display: block;
  aspect-ratio: 3 / 3.4;
  border-radius: var(--r-md);
  overflow: hidden;
  border: 1px solid var(--line);
}
.tile__img img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s var(--ease-out); }
.tile:hover .tile__img img { transform: scale(1.05); }

.tile__name { display: block; font-size: var(--fs-small); font-weight: 800; }
.tile__meta { display: block; font-size: var(--fs-caption); color: var(--muted); }
@media (max-width: 640px) {
  .tile__meta { display: none; }
}
</style>
