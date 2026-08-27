<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// AHeader · هدر چسبان — واژه‌نگار + ناوبری دسکتاپ + CTA + حساب
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const { user, logout, isAdmin } = useAuth()
const { unread: notifUnread, refresh: refreshNotifs, startPolling: startNotifPolling, stopPolling: stopNotifPolling } = useNotifications()
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

// منوی حساب
const menuOpen = ref(false)
const acctRoot = ref<HTMLElement | null>(null)
function onDocClick(e: MouseEvent) {
  if (acctRoot.value && !acctRoot.value.contains(e.target as Node)) menuOpen.value = false
}
onMounted(() => document.addEventListener('click', onDocClick))
watch(() => user.value?.id, (id) => { if (id) startNotifPolling(); else stopNotifPolling() }, { immediate: true })
onUnmounted(() => stopNotifPolling())
onUnmounted(() => document.removeEventListener('click', onDocClick))
watch(() => route.path, () => { menuOpen.value = false })

const initial = computed(() => user.value?.name.trim().charAt(0) ?? '')
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

      <div class="a-header__side">
        <AButton to="/create" size="sm" class="a-header__cta">شروع پروژه</AButton>

        <!-- حساب -->
        <div v-if="user" ref="acctRoot" class="acct acct--group">
          <NuxtLink to="/notifications" class="acct__bell" aria-label="اعلان‌ها">
            <AIcon name="bell" :size="18" />
            <span v-if="notifUnread" class="acct__bell-dot" />
          </NuxtLink>
          <button type="button" class="acct__btn" :aria-expanded="menuOpen" aria-label="منوی حساب" @click="menuOpen = !menuOpen">
            <span class="acct__avatar">{{ initial }}</span>
          </button>
          <Transition name="acct">
            <div v-if="menuOpen" class="acct__menu" role="menu">
              <div class="acct__head">
                <strong>{{ user.name }}</strong>
                <span class="latin" dir="ltr">{{ user.mobile || user.email }}</span>
              </div>
              <NuxtLink to="/profile" class="acct__item" role="menuitem">
                <AIcon name="user" :size="15" /> پروفایل
              </NuxtLink>
              <NuxtLink to="/profile/settings" class="acct__item" role="menuitem">
                <AIcon name="sliders" :size="15" /> تنظیمات
              </NuxtLink>
              <NuxtLink v-if="isAdmin" to="/admin" class="acct__item acct__item--admin" role="menuitem">
                <AIcon name="shield" :size="15" /> پنل مدیریت
              </NuxtLink>
              <button type="button" class="acct__item acct__item--out" role="menuitem" @click="logout()">
                <AIcon name="logout" :size="15" /> خروج
              </button>
            </div>
          </Transition>
        </div>
        <AButton v-else to="/auth/login" size="sm" variant="outline" class="a-header__login">ورود</AButton>
      </div>
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

.a-header__side { margin-inline-start: auto; display: flex; align-items: center; gap: 0.6rem; }
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

/* ── منوی حساب ── */
.acct { position: relative; }
.acct--group { display: flex; align-items: center; gap: 0.45rem; }
.acct__bell {
  position: relative;
  width: 2.4rem; height: 2.4rem;
  display: grid; place-items: center;
  border-radius: 99px;
  color: var(--ink-soft);
  transition: background 0.2s;
}
.acct__bell:hover { background: var(--bg-deep); }
.acct__bell-dot {
  position: absolute;
  top: 0.3rem;
  inset-inline-end: 0.3rem;
  width: 0.5rem; height: 0.5rem;
  border-radius: 99px;
  background: var(--coral);
  border: 1.5px solid var(--bg);
}
.acct__btn {
  display: grid;
  place-items: center;
  border-radius: 99px;
  padding: 0;
  transition: transform 0.2s;
}
.acct__btn:active { transform: scale(0.92); }
.acct__avatar {
  width: 2.4rem;
  height: 2.4rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--ink);
  color: var(--bg);
  font-weight: 900;
  font-size: 1rem;
  border: 2px solid var(--paper);
  box-shadow: 0 0 0 1px var(--line-strong);
}
.acct__menu {
  position: absolute;
  top: calc(100% + 0.55rem);
  inset-inline-end: 0;
  z-index: 70;
  width: 15rem;
  background: var(--paper);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow-pop);
  overflow: hidden;
}
.acct__head {
  display: grid;
  gap: 0.1rem;
  padding: 0.8rem 0.95rem;
  border-bottom: 1px solid var(--line);
  background: var(--bg-deep);
}
.acct__head strong { font-size: var(--fs-small); font-weight: 900; }
.acct__head span { font-size: 0.64rem; color: var(--muted); }
.acct__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.6rem 0.95rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--ink-soft);
  transition: background 0.15s;
}
.acct__item:hover { background: var(--bg-deep); color: var(--ink); }
.acct__item--admin { color: var(--indigo-deep); }
.acct__item--out { color: var(--coral-deep); border-top: 1px solid var(--line); }
.acct__item--out:hover { background: var(--coral-soft); }

.acct-enter-active { transition: opacity 0.2s, transform 0.2s var(--ease-out); }
.acct-leave-active { transition: opacity 0.15s; }
.acct-enter-from, .acct-leave-to { opacity: 0; transform: translateY(-6px); }
</style>
