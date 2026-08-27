import type { ConversationSummary } from '#shared/types'
import { requireUser } from '../../utils/auth'
import { findProject, store } from '../../utils/store'

// GET /api/conversations — فهرست گفتگوهای من + شمار خوانده‌نشده
export default defineEventHandler((event) => {
  const user = requireUser(event)

  const summaries: ConversationSummary[] = []
  for (const t of store.data.threads) {
    if (!t.members.includes(user.id)) continue
    const peerId = t.members.find(m => m !== user.id) ?? user.id
    const peer = store.data.users.find(u => u.id === peerId)
    const project = t.projectId ? findProject(t.projectId) : undefined
    const last = t.messages[t.messages.length - 1]
    const unread = t.messages.filter(m => m.from !== user.id && !m.readAt).length
    summaries.push({
      id: t.id,
      projectId: t.projectId,
      projectTitle: project?.title ?? null,
      peers: [{ id: peerId, name: peer?.name ?? 'کاربر' }],
      lastMessage: last ? { body: last.files.length && !last.body ? `📎 ${last.files.length} فایل` : last.body, at: last.at, from: last.from } : null,
      unread,
      updatedAt: last?.at ?? t.createdAt,
    })
  }
  summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))

  return {
    items: summaries,
    totalUnread: summaries.reduce((s, c) => s + c.unread, 0),
  }
})
