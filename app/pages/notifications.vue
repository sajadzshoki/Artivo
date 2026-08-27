<script setup lang="ts">
import { useNotifications } from '~/composables/useNotifications'

// ─────────────────────────────────────────────────────────────
// اعلان‌ها — همه‌ی رویدادهای پروژه و پیام‌ها
// ─────────────────────────────────────────────────────────────
useHead({ title: 'اعلان‌ها — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const { items, unread, ready, error, refresh, markRead } = useNotifications()

const icons: Record<string, string> = {
  proposal: 'send',
  'proposal-accepted': 'check-circle',
  'proposal-rejected': 'x',
  'project-started': 'briefcase',
  'work-submitted': 'eye',
  'revision-requested': 'pen',
  'project-completed': 'check-circle',
  message: 'send',
}

const dateFmt = new Intl.DateTimeFormat('fa-IR', { dateStyle: 'medium', timeStyle: 'short' })

onMounted(refresh)
</script>

<template>
  <div class="container nt">
    <header class="page-head" v-reveal>
      <p class="overline">Notifications</p>
      <h1 class="t-h1 page-head__title">اعلان‌ها</h1>
      <div v-if="unread" class="nt__bar">
        <span class="t-caption nt__count">{{ new Intl.NumberFormat('fa-IR').format(unread) }} اعلان خوانده‌نشده</span>
        <AButton size="sm" variant="outline" @click="markRead()">خواندن همه</AButton>
      </div>
    </header>

    <AEmptyState
      v-if="error && !ready"
      icon="zap"
      title="اعلان‌ها بارگذاری نشدند"
      description="ارتباط برقرار نشد؛ دوباره تلاش کن."
    >
      <AButton size="sm" @click="refresh()">تلاش دوباره</AButton>
    </AEmptyState>
    <div v-else-if="!ready" class="nt__list">
      <div v-for="i in 4" :key="i" class="panel" style="padding:0.9rem">
        <ASkeleton h="2.8rem" radius="12px" />
      </div>
    </div>

    <template v-else>
      <div class="nt__list" v-reveal>
        <component
          :is="n.link.startsWith('http') ? 'a' : 'NuxtLink'"
          v-for="n in items"
          :key="n.id"
          :to="n.link.startsWith('http') ? undefined : n.link"
          :href="n.link.startsWith('http') ? n.link : undefined"
          class="panel item"
          :class="{ 'item--unread': !n.readAt }"
          @click="!n.readAt && markRead(n.id)"
        >
          <span class="item__icon" :class="{ 'item__icon--hot': !n.readAt }">
            <AIcon :name="icons[n.kind] ?? 'bell'" :size="16" />
          </span>
          <span class="item__body">
            <strong>{{ n.title }}</strong>
            <p>{{ n.body }}</p>
            <time>{{ dateFmt.format(new Date(n.createdAt)) }}</time>
          </span>
          <span v-if="!n.readAt" class="item__dot" aria-label="خوانده‌نشده" />
        </component>

        <AEmptyState
          v-if="!items.length"
          icon="bell"
          title="اعلانی نداری"
          description="رویدادهای پروژه‌ها، پیشنهادها و پیام‌ها این‌جا خبر می‌رسند."
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; display: grid; gap: 0.6rem; }
.nt__bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.nt__count { color: var(--coral-deep); font-weight: 800; }

.nt__list { display: grid; gap: 0.55rem; }

.item {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  transition: transform 0.2s var(--ease-out);
}
.item:hover { transform: translateY(-1px); }
.item--unread { background: color-mix(in srgb, var(--coral-soft) 45%, var(--paper)); }

.item__icon {
  width: 2.5rem; height: 2.5rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  color: var(--ink-soft);
  flex-shrink: 0;
}
.item__icon--hot { background: var(--ink); color: var(--bg); }

.item__body { display: grid; gap: 0.15rem; min-width: 0; flex: 1; }
.item__body strong { font-size: var(--fs-small); font-weight: 900; }
.item__body p { font-size: var(--fs-caption); color: var(--muted); line-height: 1.85; overflow-wrap: anywhere; }
.item__body time { font-size: 0.62rem; color: var(--faint); }

.item__dot {
  width: 0.55rem; height: 0.55rem;
  border-radius: 99px;
  background: var(--coral);
  flex-shrink: 0;
  margin-top: 0.35rem;
}
</style>
