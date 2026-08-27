import type { ConversationSummary, FileAttachment, ThreadPayload } from '#shared/types'

// ─────────────────────────────────────────────────────────────
// useConversations · گفتگوها — آماده‌ی Real-time
// لایه‌ی transport ایزوله است: امروز polling سبک (۴ ثانیه، فقط با
// تبِ فعال)، فردا WebSocket/SSE — UI هیچ تغییری نمی‌خواهد.
// ─────────────────────────────────────────────────────────────

const POLL_MS = 4000
const TYPING_EMIT_MS = 2500

export function useConversations() {
  const items = useState<ConversationSummary[]>('conv-items', () => [])
  const totalUnread = useState<number>('conv-unread', () => 0)
  const ready = useState<boolean>('conv-ready', () => false)

  async function refresh() {
    try {
      const res = await $fetch<{ items: ConversationSummary[]; totalUnread: number }>('/api/conversations')
      items.value = res.items
      totalUnread.value = res.totalUnread
      ready.value = true
    }
    catch {
      /* مهمان — بی‌خیال */
    }
  }

  return { items, totalUnread, ready, refresh }
}

/** گفتگوی واحد — polling + optimistic send + typing */
export function useThread(threadId: string) {
  const thread = useState<ThreadPayload | null>(`thread-${threadId}`, () => null)
  const error = ref(false)
  const sending = ref(false)
  let timer: ReturnType<typeof setInterval> | null = null
  let lastTypingSent = 0

  async function fetchOnce() {
    if (import.meta.client && document.hidden) return
    try {
      thread.value = await $fetch<ThreadPayload>(`/api/conversations/${threadId}`)
      error.value = false
    }
    catch {
      error.value = true
    }
  }

  function startPolling() {
    if (!import.meta.client || timer) return
    void fetchOnce()
    timer = setInterval(fetchOnce, POLL_MS)
  }

  function stopPolling() {
    if (timer) clearInterval(timer)
    timer = null
  }

  /** امیدوارکُننده: پیام را فوراً در thread نشان بده */
  async function send(body: string, files: { name: string; url: string; size: number }[] = []) {
    if (sending.value || (!body.trim() && !files.length)) return
    sending.value = true
    const optimistic: import('#shared/types').ChatMessage = {
      id: `tmp-${Date.now()}`,
      from: '__me__',
      fromName: 'من',
      body,
      files: files.map((f, i) => ({ id: `tmp-f-${i}`, ...f })) as FileAttachment[],
      at: new Date().toISOString(),
      readAt: null,
    }
    thread.value?.messages.push(optimistic)
    try {
      const res = await $fetch<{ message: import('#shared/types').ChatMessage }>(`/api/conversations/${threadId}/message`, {
        method: 'POST',
        body: { body, files },
      })
      const list = thread.value?.messages
      if (list) {
        const i = list.findIndex(m => m.id === optimistic.id)
        if (i >= 0) list[i] = res.message
      }
    }
    catch (err) {
      const i = thread.value?.messages.findIndex(m => m.id === optimistic.id) ?? -1
      if (i >= 0) thread.value?.messages.splice(i, 1)
      throw err
    }
    finally {
      sending.value = false
    }
  }

  /** throttle شده — فقط هر ۲٫۵ ثانیه یک بار به سرور */
  function notifyTyping() {
    const now = Date.now()
    if (now - lastTypingSent < TYPING_EMIT_MS) return
    lastTypingSent = now
    void $fetch(`/api/conversations/${threadId}/typing`, { method: 'POST' }).catch(() => {})
  }

  onMounted(startPolling)
  onUnmounted(stopPolling)

  return { thread, error, sending, send, notifyTyping, refresh: fetchOnce, startPolling, stopPolling }
}
