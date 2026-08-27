<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AHeader · هدر چسبان — واژه‌نگار + ناوبری دسکتاپ + CTA
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const scrolled = ref(false)

function onScroll() { scrolled.value = window.scrollY > 8 }
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll, { passive: true }) })
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const links = [
  { to: '/', label: 'خانه' },
  { to: '/jobs', label: 'پروژه‌ها' },
  { to: '/creatives', label: 'خلاق‌ها' },
  { to: '/services', label: 'سرویس‌ها' },
  { to: '/spots', label: 'لوکیشن عکاسی' },
]
</script>

<template>
  <header class="a-header" :class="{ 'a-header--scrolled': scrolled }">
    <div class="container a-header__in">
      <NuxtLink to="/" class="a-header__brand" aria-label="آرتیوو — صفحه اصلی">
        <span class="a-header__wordmark latin">Artivo<em>*</em></span>
        <span class="a-header__tag">استودیوی خلاقیت</span>
      </NuxtLink>

      <nav class="a-header__nav" aria-label="ناوبری اصلی">
        <NuxtLink
          v-for="l in links"
          :key="l.to"
          :to="l.to"
          class="a-header__link"
          :class="{ 'a-header__link--active': route.path === l.to }"
        >
          {{ l.label }}
        </NuxtLink>
      </nav>

      <AButton to="/create" size="sm" class="a-header__cta">شروع پروژه</AButton>
    </div>
  </header>
</template>

<style scoped>
.a-header {
  position: sticky;
  top: 0;
  z-index: var(--z-header);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid transparent;
  transition: border-color 0.3s;
}
.a-header--scrolled { border-color: var(--line); }

.a-header__in {
  height: var(--header-h);
  display: flex;
  align-items: center;
  gap: var(--sp-5);
}

.a-header__brand { display: flex; align-items: baseline; gap: 0.6rem; }
.a-header__wordmark {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--ink);
}
.a-header__wordmark em { color: var(--coral); font-style: normal; }
.a-header__tag {
  font-size: var(--fs-caption);
  color: var(--muted);
  border-inline-start: 1px solid var(--line-strong);
  padding-inline-start: 0.6rem;
}

.a-header__nav { display: none; gap: var(--sp-5); margin-inline-start: auto; }
.a-header__link {
  position: relative;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--muted);
  padding-block: 0.35rem;
  transition: color 0.2s;
}
.a-header__link:hover { color: var(--ink); }
.a-header__link--active { color: var(--ink); }
.a-header__link--active::after {
  content: '';
  position: absolute;
  inset-inline: 0.2rem;
  bottom: -2px;
  height: 2px;
  border-radius: 2px;
  background: var(--coral);
}

.a-header__cta { margin-inline-start: auto; }
@media (min-width: 768px) {
  .a-header__nav { display: flex; }
  .a-header__cta { margin-inline-start: 0; }
}
@media (max-width: 480px) {
  .a-header__tag { display: none; }
}
</style>
