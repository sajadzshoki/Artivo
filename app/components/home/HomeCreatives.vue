<script setup lang="ts">
import { creatives } from '#shared/data/content'

// خلاق‌های منتخب — اسکرولر افقی؛ کارت‌ها به پروفایل لینک می‌شوند
const featured = creatives.filter(c => c.featured)
</script>

<template>
  <section class="section" v-reveal>
    <div class="container">
      <div class="section-head">
        <div class="section-head__titles">
          <span class="section-head__kicker">خلاق‌های منتخب</span>
          <h2 class="t-h1">پشت هر اثر، یک امضاست</h2>
        </div>
        <NuxtLink to="/creatives" class="section-head__link">
          مشاهده‌ی همه
          <AIcon name="arrow-left" :size="15" />
        </NuxtLink>
      </div>
    </div>

    <div class="container">
      <div class="scroll-x">
        <CreativeCard v-for="c in featured" :key="c.id" :creative="c" class="home-creative" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-creative { width: min(16.5rem, 74vw); }
@media (min-width: 1024px) {
  .home-creative { width: 100%; }
  :deep(.creative-grid-4) { display: contents; }
}
</style>
