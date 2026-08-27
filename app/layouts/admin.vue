<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// چیدمان ادمین — سایدبار ادیتوریال + نوار بالا
// سبک آرتیوو: کاغذ و جوهر، تایپ درشت، بدون حس داشبورد SaaS
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const { user, logout } = useAuth()
const menuOpen = ref(false)

interface AdminNavItem { to: string; icon: string; label: string; exact?: boolean }
const groups: { title: string; items: AdminNavItem[] }[] = [
  {
    title: 'مرور',
    items: [
      { to: '/admin', icon: 'home', label: 'داشبورد', exact: true },
    ],
  },
  {
    title: 'قیمت‌گذاری',
    items: [
      { to: '/admin/pricing', icon: 'wallet', label: 'موتور قیمت' },
    ],
  },
  {
    title: 'مدیریت',
    items: [
      { to: '/admin/collection/users', icon: 'user', label: 'کاربران' },
      { to: '/admin/collection/jobs', icon: 'briefcase', label: 'پروژه‌ها' },
      { to: '/admin/collection/services', icon: 'bookmark', label: 'سرویس‌ها' },
      { to: '/admin/collection/spots', icon: 'map-pin', label: 'لوکیشن‌ها' },
    ],
  },
  {
    title: 'تاکسونومی و کاتالوگ',
    items: [
      { to: '/admin/collection/project-categories', icon: 'layers', label: 'دسته‌های پروژه' },
      { to: '/admin/collection/creative-categories', icon: 'users', label: 'دسته‌های خلاق' },
      { to: '/admin/collection/photography-categories', icon: 'camera', label: 'دسته‌های عکاسی' },
      { to: '/admin/collection/color-palettes', icon: 'palette', label: 'پالت‌های رنگی' },
      { to: '/admin/collection/font-packs', icon: 'type', label: 'پک‌های فونت' },
    ],
  },
]

function isActive(to: string, exact?: boolean) {
  return exact ? route.path === to : route.path.startsWith(to)
}
</script>

<template>
  <div class="adm">
    <!-- سایدبار -->
    <aside class="adm__side" :class="{ 'adm__side--open': menuOpen }">
      <div class="adm__brand">
        <NuxtLink to="/" class="adm__wordmark latin">Artivo<em>*</em></NuxtLink>
        <span class="adm__brand-tag">پنل مدیریت</span>
      </div>

      <nav class="adm__nav" aria-label="ناوبری مدیریت">
        <div v-for="g in groups" :key="g.title" class="adm__group">
          <p class="adm__group-title">{{ g.title }}</p>
          <NuxtLink
            v-for="it in g.items"
            :key="it.to"
            :to="it.to"
            class="adm__link"
            :class="{ 'adm__link--active': isActive(it.to, it.exact) }"
            @click="menuOpen = false"
          >
            <AIcon :name="it.icon" :size="17" />
            {{ it.label }}
          </NuxtLink>
        </div>
      </nav>

      <div class="adm__side-foot">
        <NuxtLink to="/" class="adm__back">
          <AIcon name="arrow-right" :size="15" />
          بازگشت به سایت
        </NuxtLink>
      </div>
    </aside>

    <!-- پرده موبایل -->
    <div v-if="menuOpen" class="adm__scrim" @click="menuOpen = false" />

    <!-- بدنه -->
    <div class="adm__body">
      <header class="adm__top">
        <button type="button" class="adm__burger" aria-label="منو" @click="menuOpen = !menuOpen">
          <AIcon name="sliders" :size="19" />
        </button>
        <h1 class="adm__top-title">{{ route.meta.title ?? 'پنل مدیریت' }}</h1>
        <div class="adm__top-user">
          <span class="adm__uname">{{ user?.name }}</span>
          <button type="button" class="adm__logout" aria-label="خروج" @click="logout()">
            <AIcon name="logout" :size="17" />
          </button>
        </div>
      </header>

      <main class="adm__main">
        <slot />
      </main>
    </div>
  </div>
</template>

<style scoped>
.adm { min-height: 100dvh; display: grid; grid-template-columns: 1fr; background: var(--bg); }

.adm__side {
  display: none;
  position: fixed;
  inset-block: 0;
  inset-inline-start: 0;
  inline-size: 15.5rem;
  z-index: 60;
  background: var(--paper);
  border-inline-end: 1px solid var(--line);
  padding: 1.4rem 1.1rem;
  grid-template-rows: auto 1fr auto;
  gap: 1.2rem;
}
.adm__side--open { display: grid; }

.adm__brand { display: grid; gap: 0.15rem; }
.adm__wordmark { font-size: 1.35rem; font-weight: 700; }
.adm__wordmark em { color: var(--coral); font-style: normal; }
.adm__brand-tag { font-size: var(--fs-caption); color: var(--muted); }

.adm__nav { display: grid; gap: 1.1rem; align-content: start; overflow-y: auto; }
.adm__group { display: grid; gap: 0.15rem; }
.adm__group-title {
  font-size: 0.64rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: var(--faint);
  margin-bottom: 0.3rem;
}
.adm__link {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.48rem 0.6rem;
  border-radius: var(--r-sm);
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--ink-soft);
  transition: all 0.15s;
}
.adm__link:hover { background: var(--bg-deep); color: var(--ink); }
.adm__link--active { background: var(--ink); color: var(--bg); }

.adm__side-foot { border-top: 1px solid var(--line); padding-top: 0.9rem; }
.adm__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: var(--fs-caption);
  font-weight: 700;
  color: var(--muted);
}
.adm__back:hover { color: var(--ink); }

.adm__scrim { position: fixed; inset: 0; z-index: 55; background: rgba(33, 28, 21, 0.4); }

.adm__body { display: grid; grid-template-rows: auto 1fr; min-height: 100dvh; }

.adm__top {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.8rem clamp(1rem, 4vw, 2.2rem);
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--line);
  position: sticky;
  top: 0;
  z-index: 40;
}
.adm__burger {
  width: 2.3rem; height: 2.3rem;
  display: grid; place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: var(--r-sm);
  background: var(--paper);
}
.adm__top-title { font-size: var(--fs-md); font-weight: 900; }
.adm__top-user { margin-inline-start: auto; display: flex; align-items: center; gap: 0.6rem; }
.adm__uname { font-size: var(--fs-caption); font-weight: 800; color: var(--muted); }
.adm__logout {
  width: 2.2rem; height: 2.2rem;
  display: grid; place-items: center;
  border: 1px solid var(--line-strong);
  border-radius: 99px;
  background: var(--paper);
  color: var(--ink-soft);
  transition: all 0.2s;
}
.adm__logout:hover { color: var(--coral); border-color: var(--coral); }

.adm__main { padding: clamp(1rem, 4vw, 2.2rem); max-width: 78rem; width: 100%; }

@media (min-width: 1000px) {
  .adm { grid-template-columns: 15.5rem 1fr; }
  .adm__side {
    display: grid;
    position: sticky;
    height: 100dvh;
  }
  .adm__burger, .adm__scrim { display: none; }
}
</style>
