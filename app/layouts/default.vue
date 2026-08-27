<script setup lang="ts">
// چیدمان پیش‌فرض — در مسیرهای immersive (ویزارد) هدر/ناوبری حذف می‌شود
const route = useRoute()
const immersive = computed(() => route.path.startsWith('/create'))
</script>

<template>
  <div class="shell">
    <AHeader v-if="!immersive" />
    <main class="shell__main" :class="{ 'shell__main--immersive': immersive }">
      <slot />
    </main>
    <SiteFooter v-if="!immersive" />
    <ABottomNav v-if="!immersive" />
  </div>
</template>

<style scoped>
.shell { min-height: 100dvh; display: flex; flex-direction: column; }
.shell__main {
  flex: 1;
  padding-bottom: calc(5.2rem + env(safe-area-inset-bottom));
}
.shell__main--immersive { padding-bottom: 0; }
@media (min-width: 768px) {
  .shell__main { padding-bottom: 0; }
}
</style>
