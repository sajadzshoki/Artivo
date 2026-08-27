<script setup lang="ts">
// چیدمان پیش‌فرض — در مسیرهای immersive (ویزارد) هدر/ناوبری حذف می‌شود
const route = useRoute()
const immersive = computed(() =>
  route.path.startsWith('/create') ||
  (route.path.startsWith('/messages/') && route.path !== '/messages')
)
</script>

<template>
  <div class="shell">
    <a href="#main" class="skip-link">پرش به محتوای اصلی</a>
    <AHeader v-if="!immersive" />
    <main id="main" class="shell__main" :class="{ 'shell__main--immersive': immersive }">
      <slot />
    </main>
    <SiteFooter v-if="!immersive" />
    <ABottomNav v-if="!immersive" />
  </div>
</template>

<style scoped>
.skip-link {
  position: fixed;
  top: 0.6rem;
  inset-inline-start: 0.6rem;
  z-index: calc(var(--z-toast) + 1);
  background: var(--ink);
  color: var(--bg);
  padding: 0.55rem 1rem;
  border-radius: var(--r-pill);
  font-size: var(--fs-small);
  font-weight: 800;
  transform: translateY(-300%);
  transition: transform 0.2s var(--ease-out);
}
.skip-link:focus-visible { transform: none; }

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
