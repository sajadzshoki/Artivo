<script setup lang="ts">
// ─────────────────────────────────────────────────────────────
// ABottomNav · ناوبری پایین موبایل + دکمه‌ی مرکزی «شروع پروژه»
// badge پیام خوانده‌نشده روی «گفتگوها» (polling سبک)
// ─────────────────────────────────────────────────────────────
const route = useRoute()
const { user } = useAuth()
const { totalUnread, ready, refresh } = useConversations()

const items = computed(() => [
  { to: '/', icon: 'home', label: 'خانه' },
  { to: '/jobs', icon: 'briefcase', label: 'پروژه‌ها' },
  { to: '/messages', icon: 'send', label: 'گفتگو', badge: user.value ? totalUnread.value : 0 },
  { to: '/dashboard', icon: 'sliders', label: 'داشبورد' },
  { to: '/profile', icon: 'user', label: 'پروفایل' },
])

let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => {
  if (!user.value) return
  void refresh()
  timer = setInterval(() => {
    if (!document.hidden) void refresh()
  }, 20000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
watch(() => user.value?.id, (id) => { if (id) void refresh() })
</script>

<template>
  <nav class="a-bnav" aria-label="ناوبری پایین">
    <div class="a-bnav__in">
      <NuxtLink
        v-for="it in items"
        :key="it.to"
        :to="it.to"
        class="a-bnav__item"
        :class="{ 'a-bnav__item--active': route.path === it.to || (it.to !== '/' && route.path.startsWith(it.to)) }"
        :aria-current="route.path === it.to ? 'page' : undefined"
      >
        <span class="a-bnav__iconwrap">
          <AIcon :name="it.icon" :size="21" />
          <span v-if="it.badge" class="a-bnav__badge">{{ it.badge > 9 ? '۹+' : new Intl.NumberFormat('fa-IR').format(it.badge) }}</span>
        </span>
        <span class="a-bnav__label">{{ it.label }}</span>
        <span v-if="route.path === it.to" class="a-bnav__dot" aria-hidden="true" />
      </NuxtLink>

      <NuxtLink to="/create" class="a-bnav__fab" aria-label="شروع پروژه جدید">
        <AIcon name="plus" :size="24" />
      </NuxtLink>
    </div>
  </nav>
</template>

<style scoped>
.a-bnav {
  position: fixed;
  inset-inline: 0;
  bottom: 0;
  z-index: var(--z-nav);
  background: color-mix(in srgb, var(--paper) 92%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--line);
  padding-bottom: env(safe-area-inset-bottom);
}
.a-bnav__in {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  max-width: 34rem;
  margin-inline: auto;
  height: 4.1rem;
  align-items: stretch;
}

.a-bnav__item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  color: var(--faint);
  transition: color 0.2s, transform 0.15s;
}
.a-bnav__item:active { transform: scale(0.94); }
.a-bnav__item--active { color: var(--ink); }
.a-bnav__label { font-size: 0.64rem; font-weight: 700; }
.a-bnav__iconwrap { position: relative; display: grid; place-items: center; }
.a-bnav__badge {
  position: absolute;
  top: -0.3rem;
  inset-inline-end: -0.45rem;
  min-width: 1.05rem;
  height: 1.05rem;
  display: grid;
  place-items: center;
  background: var(--coral);
  color: #fff;
  border-radius: 99px;
  font-size: 0.62rem;
  font-weight: 900;
  padding-inline: 0.25rem;
  border: 1.5px solid var(--bg);
}
.a-bnav__dot {
  position: absolute;
  top: 0.35rem;
  width: 4px;
  height: 4px;
  border-radius: 99px;
  background: var(--coral);
}

.a-bnav__fab {
  align-self: center;
  justify-self: center;
  width: 3.4rem;
  height: 3.4rem;
  display: grid;
  place-items: center;
  border-radius: 99px;
  background: var(--coral);
  color: #fff;
  box-shadow: var(--shadow-coral);
  margin-top: -1.6rem;
  animation: pulse-soft 3.2s ease-out infinite;
  transition: transform 0.2s var(--ease-out), background 0.2s;
}
.a-bnav__fab:hover { transform: translateY(-2px) scale(1.04); background: var(--coral-deep); }
.a-bnav__fab:active { transform: scale(0.95); }
</style>
