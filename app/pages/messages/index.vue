<script setup lang="ts">
import { useConversations } from '~/composables/useConversations'

// ─────────────────────────────────────────────────────────────
// فهرست گفتگوها — خوانده‌نشده، آخرین پیام، پیوند پروژه
// ─────────────────────────────────────────────────────────────
useHead({ title: 'گفتگوها — آرتیوو' })
definePageMeta({ middleware: 'auth' })

const { items, totalUnread, ready, error, refresh } = useConversations()
const { user } = useAuth()

const timeFmt = new Intl.DateTimeFormat('fa-IR', { hour: '2-digit', minute: '2-digit' })
const dateFmt = new Intl.DateTimeFormat('fa-IR', { day: 'numeric', month: 'short' })

function when(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  return d.toDateString() === today.toDateString()
    ? timeFmt.format(d)
    : dateFmt.format(d)
}

function peerName(c: { peers: { name: string }[] }): string {
  return c.peers[0]?.name ?? 'گفتگو'
}

onMounted(refresh)
</script>

<template>
  <div class="container ms">
    <header class="page-head" v-reveal>
      <p class="overline">Messages</p>
      <h1 class="t-h1 page-head__title">گفتگوها</h1>
      <p v-if="totalUnread" class="ms__unread t-caption">{{ new Intl.NumberFormat('fa-IR').format(totalUnread) }} پیام خوانده‌نشده</p>
    </header>

    <AEmptyState
        v-if="error && !ready"
        icon="zap"
        title="گفتگوها بارگذاری نشدند"
        description="ارتباط برقرار نشد؛ دوباره تلاش کن."
      >
        <AButton size="sm" @click="refresh()">تلاش دوباره</AButton>
      </AEmptyState>
      <div v-else-if="!ready" class="ms__list">
      <div v-for="i in 4" :key="i" class="panel" style="padding:0.9rem">
        <ASkeleton h="2.8rem" radius="12px" />
      </div>
    </div>

    <template v-else>
      <div class="ms__list" v-reveal>
        <NuxtLink v-for="c in items" :key="c.id" :to="`/messages/${c.id}`" class="panel conv" :class="{ 'conv--unread': c.unread > 0 }">
          <span class="conv__avatar" :class="{ 'conv__avatar--hot': c.unread > 0 }">{{ peerName(c).charAt(0) }}</span>
          <span class="conv__body">
            <span class="conv__top">
              <strong class="conv__name">{{ peerName(c) }}</strong>
              <span v-if="c.lastMessage" class="conv__time">{{ when(c.lastMessage.at) }}</span>
            </span>
            <span v-if="c.projectTitle" class="conv__project"><AIcon name="briefcase" :size="11" /> {{ c.projectTitle }}</span>
            <span v-if="c.lastMessage" class="conv__last" :class="{ 'conv__last--mine': c.lastMessage.from === user?.id }">
              {{ c.lastMessage.from === user?.id ? 'تو: ' : '' }}{{ c.lastMessage.body }}
            </span>
            <span v-else class="conv__last conv__last--empty">هنوز پیامی رد و بدل نشده</span>
          </span>
          <span v-if="c.unread" class="conv__badge">{{ new Intl.NumberFormat('fa-IR').format(c.unread) }}</span>
          <AIcon v-else name="arrow-left" :size="15" class="conv__go" />
        </NuxtLink>

        <AEmptyState
          v-if="!items.length"
          icon="send"
          title="هنوز گفتگویی نداری"
          description="وقتی پروژه‌ای شروع شود، فضای گفتگو با طرف مقابل این‌جا ساخته می‌شود."
        >
          <AButton to="/dashboard" size="sm">داشبورد</AButton>
        </AEmptyState>
      </div>
    </template>
  </div>
</template>

<style scoped>
.page-head { padding-block: clamp(2rem, 6vw, 3rem) 1.2rem; }
.ms__unread { color: var(--coral-deep); font-weight: 800; margin-top: 0.3rem; }

.ms__list { display: grid; gap: 0.55rem; }

.conv {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  transition: transform 0.2s var(--ease-out);
}
.conv:hover { transform: translateY(-1px); }
.conv--unread { border-inline-start: 3px solid var(--coral); }

.conv__avatar {
  width: 2.9rem; height: 2.9rem;
  display: grid; place-items: center;
  border-radius: 99px;
  background: var(--bg-deep);
  font-weight: 900;
  flex-shrink: 0;
}
.conv__avatar--hot { background: var(--coral); color: #fff; }

.conv__body { display: grid; gap: 0.12rem; min-width: 0; flex: 1; }
.conv__top { display: flex; align-items: baseline; justify-content: space-between; gap: 0.6rem; }
.conv__name { font-size: var(--fs-small); font-weight: 900; }
.conv--unread .conv__name { color: var(--coral-deep); }
.conv__time { font-size: 0.62rem; color: var(--faint); flex-shrink: 0; }
.conv__project {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.64rem;
  font-weight: 800;
  color: var(--indigo-deep);
}
.conv__last {
  font-size: var(--fs-caption);
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.conv__last--mine { color: var(--faint); }
.conv__last--empty { font-style: italic; color: var(--faint); }

.conv__badge {
  min-width: 1.35rem; height: 1.35rem;
  display: grid; place-items: center;
  background: var(--coral);
  color: #fff;
  border-radius: 99px;
  font-size: 0.64rem;
  font-weight: 900;
  flex-shrink: 0;
  padding-inline: 0.35rem;
}
.conv__go { color: var(--faint); flex-shrink: 0; }
</style>
