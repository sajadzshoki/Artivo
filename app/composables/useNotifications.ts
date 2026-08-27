import type { NotificationItem } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useNotifications · اعلان‌ها — polling سبک برای زنگ هدر
// ─────────────────────────────────────────────────────────────
const POLL_MS = 25_000

export function useNotifications() {
  const items = useState<NotificationItem[]>('notif-items', () => [])
  const unread = useState<number>('notif-unread', () => 0)
  const ready = useState<boolean>('notif-ready', () => false)
  const error = useState<boolean>('notif-error', () => false)

  let timer: ReturnType<typeof setInterval> | null = null

  async function refresh() {
    try {
      const res = await $fetch<{ items: NotificationItem[]; unread: number }>('/api/notifications')
      items.value = res.items
      unread.value = res.unread
      ready.value = true
      error.value = false
    }
    catch {
      if (!ready.value) error.value = true
    }
  }

  function startPolling() {
    if (!import.meta.client || timer) return
    void refresh()
    timer = setInterval(() => {
      if (!document.hidden) void refresh()
    }, POLL_MS)
    window.addEventListener('focus', refresh)
  }

  function stopPolling() {
    if (timer) clearInterval(timer)
    timer = null
  }

  async function markRead(id?: string) {
    await $fetch('/api/notifications/read', { method: 'POST', body: { id } }).catch(() => {})
    unread.value = 0
    await refresh()
  }

  return { items, unread, ready, error, refresh, startPolling, stopPolling, markRead }
}
